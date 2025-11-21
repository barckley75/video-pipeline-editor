import React, { useState, useEffect, useRef, memo } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeInfo, NodeButton } from '../components/NodeUI';
import { convertFileSrc } from '@tauri-apps/api/core';

interface SpectrumAnalyzerData {
  videoPath?: string;
  audioPath?: string;
  resetKey: string;
  audioFile?: string;
}

interface SpectrumAnalyzerProps {
  id: string;
  data: SpectrumAnalyzerData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<SpectrumAnalyzerData>) => void;
}

type ViewMode = 'spectrum' | 'waveform' | 'spectrogram';

const SpectrumAnalyzerNode: React.FC<SpectrumAnalyzerProps> = ({
  id, data, isConnectable, onDataUpdate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('spectrum');
  const [hoverFreq, setHoverFreq] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Convert path → URL
  useEffect(() => {
    const convertPath = async () => {
      const path = data?.audioPath || data?.videoPath;
      if (!path || path === '$ null' || path.trim() === '') {
        setVideoUrl(null);
        setDebugInfo('No video path');
        return;
      }
      try {
        const url = await convertFileSrc(path);
        setVideoUrl(url);
        setIsPlaying(false);
        setAudioInitialized(false);
        sourceRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
        if (videoRef.current) videoRef.current.load();
      } catch (err) {
        setError(`Failed to load video: ${err}`);
        setVideoUrl(null);
      }
    };
    convertPath();
  }, [data?.audioPath, data?.videoPath, data?.resetKey]);

  // Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      if (!isDragging) {
        const newCurrentTime = video.currentTime;
        const newDuration = video.duration || 0;
        const newProgress = newDuration ? (newCurrentTime / newDuration) * 100 : 0;
        
        setCurrentTime(newCurrentTime);
        setDuration(newDuration);
        setProgress(newProgress);
      }
    };
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [isDragging]);

  // Handle scrubber drag - using TrimVideoNode pattern
  const handleScrubberMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!scrubberRef.current || !videoRef.current?.duration) return;
    
    setIsDragging(true);
    
    const updatePosition = (clientX: number) => {
      if (!scrubberRef.current || !videoRef.current?.duration) return;
      
      const rect = scrubberRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      const newTime = (percent / 100) * videoRef.current.duration;
      
      // Update states immediately
      setProgress(percent);
      setCurrentTime(newTime);
      
      // Seek video immediately
      videoRef.current.currentTime = newTime;
    };
    
    // Handle initial click
    updatePosition(e.clientX);
    
    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // Final position update
      updatePosition(e.clientX);
      
      // Small delay to ensure video has processed the seek before allowing timeupdate events
      setTimeout(() => {
        setIsDragging(false);
      }, 50);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Init audio
  const initializeAudio = async () => {
    if (!videoRef.current) return false;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.85;
        analyserRef.current.minDecibels = -90;
        analyserRef.current.maxDecibels = -10;
        const buffer = new ArrayBuffer(analyserRef.current.frequencyBinCount);
        dataArrayRef.current = new Uint8Array(buffer);
      }
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(videoRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
      }
      setAudioInitialized(true);
      return true;
    } catch (err) {
      setError(`Audio init failed: ${err}`);
      return false;
    }
  };

  // Compute metrics from spectrum
  const computeMetrics = (arr: Uint8Array) => {
    const len = arr.length;
    let peak = 0, peakIndex = 0, sum = 0, weightedSum = 0;
    arr.forEach((v, i) => {
      if (v > peak) { peak = v; peakIndex = i; }
      sum += v;
      weightedSum += v * i;
    });
    const rms = Math.sqrt(arr.reduce((a,v)=>a+v*v,0)/len);
    const centroid = weightedSum / sum;
    const freqPeak = (peakIndex * audioContextRef.current!.sampleRate) / analyserRef.current!.fftSize;
    const freqCentroid = (centroid * audioContextRef.current!.sampleRate) / analyserRef.current!.fftSize;
    return {peak: freqPeak, rms, centroid: freqCentroid};
  };

  const renderFrame = () => {
    if (!analyserRef.current || !canvasRef.current || !dataArrayRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvasRef.current;
    
    if (viewMode === 'waveform') {
      // Clear canvas and draw cyberpunk background for waveform
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 4, 15, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 15, 30, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ffff';
      
      const sliceWidth = width / dataArrayRef.current.length;
      let x = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      setDebugInfo('WAVEFORM_ANALYSIS_ACTIVE');
    } else if (viewMode === 'spectrum') {
      // Clear canvas and draw cyberpunk background for spectrum
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 4, 15, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 15, 30, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const metrics = computeMetrics(dataArrayRef.current);
      const barWidth = width / dataArrayRef.current.length;
      
      dataArrayRef.current.forEach((v, i) => {
        const norm = v / 255;
        const barHeight = norm * height;
        
        // Cyberpunk spectrum bars with multiple colors
        const hue = 200 + (norm * 40); // Blue to cyan
        const saturation = 80 + (norm * 20);
        const lightness = 40 + (norm * 40);
        
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.7 + norm * 0.3})`;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
        
        // Add glow effect for high values
        if (norm > 0.6) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      });
      
      setDebugInfo(`FREQ_ANALYSIS | RMS:${metrics.rms.toFixed(1)} | PEAK:${metrics.peak.toFixed(0)}Hz | CENTROID:${metrics.centroid.toFixed(0)}Hz`);
    } else if (viewMode === 'spectrogram') {
      // DO NOT clear canvas for spectrogram - we need to preserve history!
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Shift existing image data left by 1 pixel
      const imgData = ctx.getImageData(1, 0, width-1, height);
      ctx.putImageData(imgData, 0, 0);
      
      // Clear only the rightmost column
      ctx.fillStyle = '#000820';
      ctx.fillRect(width-1, 0, 1, height);
      
      // Draw new frequency column on the right
      for (let y = 0; y < height; y++) {
        const i = Math.floor((y / height) * dataArrayRef.current.length);
        const val = dataArrayRef.current[i];
        const intensity = val / 255;
        
        // Cyberpunk spectrogram colors - but more visible
        let color;
        if (intensity > 0.8) {
          color = '#ff0080'; // Hot pink for peaks
        } else if (intensity > 0.6) {
          color = '#00ffff'; // Cyan for high
        } else if (intensity > 0.3) {
          color = '#0080ff'; // Blue for medium
        } else if (intensity > 0.1) {
          color = '#004080'; // Dark blue for low
        } else {
          color = '#000820'; // Very dark for silence, but not completely black
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(width-1, height-y-1, 1, 1);
      }
      
      setDebugInfo(`SPECTROGRAM_STREAM | Data points: ${dataArrayRef.current.length} | Canvas: ${width}x${height}`);
    }

    animationRef.current = requestAnimationFrame(renderFrame);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current || !videoUrl) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current!);
      return;
    }
    const ok = await initializeAudio();
    if (!ok) return;
    await audioContextRef.current!.resume();
    const playPromise = videoRef.current.play();
    if (playPromise) playPromise.catch(err => setError(`Playback failed: ${err}`));
    setIsPlaying(true);
    renderFrame();
  };

  const handleStop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current!);
    canvasRef.current?.getContext('2d')?.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current!);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const hasVideo = Boolean(videoUrl);

  return (
    <BaseNode 
      id={id} 
      data={data} 
      isConnectable={isConnectable} 
      theme="analysis_tools" 
      title='SPECTRUM_ANALYSER'
      hasInput={true}
      hasAudioInput={true}
      hasOutput={true}
      onDataUpdate={onDataUpdate}
    >
      <div className="nodrag" style={{ 
        padding: '12px', 
        maxWidth: '280px',
        background: 'linear-gradient(135deg, rgba(0,4,15,0.95), rgba(0,15,30,0.95))',
        border: '1px solid rgba(0,255,255,0.3)',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0,255,255,0.1), inset 0 0 20px rgba(0,255,255,0.05)',
      }}>
        {/* Video */}
        <div style={{ 
          marginBottom: '12px',
          border: '1px solid rgba(0,255,255,0.4)',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 15px rgba(0,255,255,0.1)'
        }}>
          {hasVideo ? (
            <video 
              ref={videoRef} 
              width="280" 
              height="160"
              crossOrigin="anonymous"
              preload="auto"
              style={{ 
                width: '100%', 
                background: 'linear-gradient(45deg, #000510, #001020)',
                display: 'block'
              }}
            >
              {videoUrl && <source src={videoUrl} />}
              <div style={{ color: '#ff0080', padding: '20px', textAlign: 'center', fontFamily: 'monospace' }}>
                VIDEO_CODEC_ERROR
              </div>
            </video>
          ) : (
            <div style={{ 
              height: '160px', 
              background: 'linear-gradient(45deg, #000510, #001020)',
              color: '#00ffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: '12px',
              textShadow: '0 0 10px #00ffff'
            }}>
              {(data?.audioPath || data?.videoPath) ?
                '>> LOADING_STREAM...' : '>> NO_INPUT_DETECTED'}
            </div>
          )}
        </div>

        {/* Visualization Canvas */}
        <div style={{
          marginBottom: '12px',
          border: '1px solid rgba(0,255,255,0.5)',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 0 20px rgba(0,255,255,0.1)'
        }}>
          <canvas
            ref={canvasRef}
            width={280}
            height={100}
            style={{ 
              width: '100%', 
              height: '100px', 
              display: 'block',
              background: 'linear-gradient(to bottom, #000410, #001020)'
            }}
            onMouseMove={(e)=>{
              if(viewMode==='spectrum' && analyserRef.current){
                const rect = canvasRef.current!.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const bin = Math.floor((x/rect.width)*analyserRef.current.frequencyBinCount);
                const freq = (bin*audioContextRef.current!.sampleRate)/analyserRef.current!.fftSize;
                setHoverFreq(`${freq.toFixed(1)}Hz`);
              }
            }}
            onMouseLeave={()=>setHoverFreq('')}
          />
          {/* Scan line effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 50%, transparent 100%)',
            animation: isPlaying ? 'cyberpunk-scan 2s linear infinite' : 'none',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <NodeButton 
            onClick={handlePlayPause} 
            disabled={!hasVideo} 
            style={{ 
              flex: 1,
              background: isPlaying 
                ? 'linear-gradient(45deg, #ff0040, #ff0080)' 
                : 'linear-gradient(45deg, #00a0ff, #00ffff)',
              border: `1px solid ${isPlaying ? '#ff0080' : '#00ffff'}`,
              boxShadow: `0 0 15px ${isPlaying ? '#ff008040' : '#00ffff40'}`,
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: `0 0 8px ${isPlaying ? '#ff0080' : '#00ffff'}`
            }}
          >
            {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}
          </NodeButton>
          <NodeButton 
            onClick={handleStop} 
            disabled={!hasVideo} 
            style={{ 
              flex: 1,
              background: 'linear-gradient(45deg, #404040, #606060)',
              border: '1px solid #808080',
              boxShadow: '0 0 10px #40404040',
              color: '#ccc',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            ⏹️ STOP
          </NodeButton>
        </div>

        {/* Cyberpunk Scrubber - Using TrimVideoNode pattern */}
        {hasVideo && (
          <div style={{ marginBottom: '12px' }}>
            <div 
              ref={scrubberRef}
              onMouseDown={handleScrubberMouseDown}
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #001020, #002040, #001020)',
                border: '1px solid rgba(0,255,255,0.3)',
                borderRadius: '6px',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 10px rgba(0,255,255,0.1)'
              }}
            >
              {/* Progress background */}
              <div style={{
                position: 'absolute',
                inset: '1px',
                background: 'linear-gradient(90deg, rgba(107, 114, 128, 0.3) 0%, rgba(156, 163, 175, 0.2) 100%)',
                borderRadius: '4px'
              }} />
              
              {/* Progress fill */}
              <div style={{
                position: 'absolute',
                left: '1px',
                top: '1px',
                bottom: '1px',
                width: `calc(${progress}% - 2px)`,
                background: 'linear-gradient(90deg, #00a0ff, #00ffff, #00a0ff)',
                borderRadius: '3px',
                boxShadow: '0 0 10px #00ffff'
              }} />
              
              {/* Playhead indicator */}
              <div 
                style={{
                  position: 'absolute',
                  left: `${progress}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '4px',        // ← Change this value to make it wider
                  height: '4px',       // ← Change this value to make it taller
                  background: 'radial-gradient(circle, #00ffff, #0080ff)',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px #00ffff',
                  cursor: 'grab',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              />
            </div>
            
            {/* Time display */}
            <div style={{ 
              fontSize: '10px', 
              color: '#00ffff', 
              marginTop: '4px',
              fontFamily: 'monospace',
              textShadow: '0 0 5px #00ffff',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
              {hoverFreq && <span style={{ color: '#ff0080' }}>FREQ: {hoverFreq}</span>}
            </div>
          </div>
        )}

        {/* View mode toggle */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'12px' }}>
          {(['spectrum', 'waveform', 'spectrogram'] as ViewMode[]).map((mode) => (
            <NodeButton 
              key={mode}
              onClick={() => setViewMode(mode)} 
              style={{ 
                flex: 1,
                fontSize: '9px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                background: viewMode === mode 
                  ? 'linear-gradient(45deg, #00a0ff, #00ffff)' 
                  : 'linear-gradient(45deg, #202040, #404060)',
                border: `1px solid ${viewMode === mode ? '#00ffff' : '#606080'}`,
                boxShadow: viewMode === mode ? '0 0 10px #00ffff40' : 'none',
                color: viewMode === mode ? '#fff' : '#ccc',
                textShadow: viewMode === mode ? '0 0 8px #00ffff' : 'none',
                textTransform: 'uppercase'
              }}
            >
              {mode}
            </NodeButton>
          ))}
        </div>

        {/* Debug info with cyberpunk styling */}
        <div style={{ 
          fontSize: '9px', 
          color: '#00ff80', 
          fontFamily: 'monospace',
          background: 'rgba(0,20,40,0.6)',
          border: '1px solid rgba(0,255,128,0.3)',
          borderRadius: '4px',
          padding: '6px',
          textShadow: '0 0 5px #00ff80',
          lineHeight: '1.4'
        }}>
          <div>AUDIO_SYS: {audioInitialized ? 'ONLINE' : 'OFFLINE'} | STATE: {isPlaying ? 'ACTIVE' : 'STANDBY'}</div>
          <div style={{ color: '#00ffff', marginTop: '2px' }}>{debugInfo}</div>
          {error && <div style={{ color: '#ff0080', marginTop: '2px' }}>ERROR: {error}</div>}
        </div>
      </div>
      
      <NodeInfo>
        {viewMode.toUpperCase()} | {isPlaying ? 'STREAMING' : 'IDLE'} | {audioInitialized ? 'AUDIO_READY' : 'AUDIO_PENDING'}
      </NodeInfo>

      {/* Cyberpunk animations */}
      <style>{`
        @keyframes cyberpunk-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </BaseNode>
  );
};

export default memo(SpectrumAnalyzerNode);