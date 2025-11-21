import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeInfo } from '../components/NodeUI';
import { convertFileSrc } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';

interface ViewVideoData {
  videoPath?: string;
}

interface ViewVideoNodeProps {
  id: string;
  data: ViewVideoData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<ViewVideoData>) => void;
}

const ViewVideoNode: React.FC<ViewVideoNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[ViewVideoNode ID: ${id}] Received data:`, data);
    let isMounted = true;
    const path = data?.videoPath || '';

    if (!path || path === '$ null' || path.trim() === '') {
      if (isMounted) {
        setVideoUrl(null);
        setError(null);
        setIsLoading(false);
        setIsPlaying(false);
      }
      return;
    }

    const resolveVideoUrl = async () => {
      if (isMounted) {
        setIsLoading(true);
        setError(null);
        setIsPlaying(false);
      }
      
      try {
        console.log(`[ViewVideoNode ${id}] Converting file path:`, path);
        const url = await convertFileSrc(path);
        console.log(`[ViewVideoNode ${id}] Converted URL:`, url);
        
        if (isMounted) {
          setVideoUrl(url);
        }
      } catch (err) {
        console.error(`[ViewVideoNode ${id}] Error converting file path:`, err);
        if (isMounted) {
          setVideoUrl(null);
          setError(`File path conversion failed - file may not exist`);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    resolveVideoUrl();

    return () => { 
      isMounted = false; 
    };
  }, [data?.videoPath, id]);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current || !videoUrl) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      
      // Emit pause event for spectrum analyzer
      if (data?.videoPath) {
        try {
          await emit('video-pause', { 
            videoPath: data.videoPath,
            nodeId: id,
            timestamp: videoRef.current.currentTime 
          });
          console.log('🎵 Emitted video-pause event for:', data.videoPath);
        } catch (err) {
          console.error('Failed to emit video-pause event:', err);
        }
      }
    } else {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        
        // Emit play event for spectrum analyzer
        if (data?.videoPath) {
          try {
            await emit('video-play', { 
              videoPath: data.videoPath,
              nodeId: id,
              timestamp: videoRef.current.currentTime 
            });
            console.log('🎵 Emitted video-play event for:', data.videoPath);
          } catch (err) {
            console.error('Failed to emit video-play event:', err);
          }
        }
      } catch (err) {
        console.error('Error playing video:', err);
        setError(`Playback failed: ${(err as Error).message || String(err)}`);
      }
    }
  }, [isPlaying, videoUrl, data?.videoPath, id]);

  const handleStop = useCallback(async () => {
    if (!videoRef.current) return;
    
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);

    // Emit pause event when stopping
    if (data?.videoPath) {
      try {
        await emit('video-pause', { 
          videoPath: data.videoPath,
          nodeId: id,
          timestamp: 0 
        });
        console.log('🎵 Emitted video-pause event (stop) for:', data.videoPath);
      } catch (err) {
        console.error('Failed to emit video-pause event:', err);
      }
    }
  }, [data?.videoPath, id]);


  const handleVideoLoadedData = useCallback(() => {
    console.log(`[ViewVideoNode ${id}] Video loaded successfully`);
    setError(null);
  }, [id]);

  const handleVideoError = useCallback(async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const extension = data?.videoPath?.split('.').pop()?.toLowerCase() || 'unknown';
    
    let errorMessage = `${extension.toUpperCase()} format issue`;
    
    // Emit pause event when video ends
    if (data?.videoPath) {
      try {
        await emit('video-pause', { 
          videoPath: data.videoPath,
          nodeId: id,
          timestamp: videoRef.current?.duration || 0 
        });
        console.log('🎵 Emitted video-pause event (ended) for:', data.videoPath);
      } catch (err) {
        console.error('Failed to emit video-pause event:', err);
      }
    }    

    if (video.error) {
      switch (video.error.code) {
        case 1:
          errorMessage = 'Video loading was aborted';
          break;
        case 2:
          errorMessage = 'Network error - check file permissions';
          break;
        case 3:
          errorMessage = 'Video decode failed - unsupported codec';
          break;
        case 4:
          errorMessage = `${extension.toUpperCase()} not supported by browser`;
          break;
        default:
          errorMessage = `Playback error (code: ${video.error.code})`;
      }
    }
    
    // Add conversion suggestion for known problematic formats
    if (['mov', 'mkv', 'avi', 'wmv', 'flv'].includes(extension)) {
      errorMessage += ` - Use Convert node to create MP4`;
    }
    
    console.error(`[ViewVideoNode ${id}] Video error:`, errorMessage, 'File:', data?.videoPath);
    setError(errorMessage);
    setIsPlaying(false);
  }, [id, data?.videoPath]);

  const handleVideoEnded = useCallback(async () => {
    setIsPlaying(false);
    
    // Emit pause event when video ends
    if (data?.videoPath) {
      try {
        await emit('video-pause', { 
          videoPath: data.videoPath,
          nodeId: id,
          timestamp: videoRef.current?.duration || 0 
        });
        console.log('🎵 Emitted video-pause event (ended) for:', data.videoPath);
      } catch (err) {
        console.error('Failed to emit video-pause event:', err);
      }
    }
  }, [data?.videoPath, id]);

  const getFormatStatus = () => {
    if (!data?.videoPath) return { color: 'rgba(168, 85, 247, 0.2)', status: 'no_input' };
    
    const ext = data.videoPath.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      return { color: 'rgba(34, 197, 94, 0.3)', status: 'compatible' };
    } else if (['mov', 'mkv', 'avi', 'wmv', 'flv'].includes(ext)) {
      return { color: 'rgba(239, 68, 68, 0.3)', status: 'needs_conversion' };
    } else {
      return { color: 'rgba(251, 191, 36, 0.3)', status: 'unknown' };
    }
  };

  const formatStatus = getFormatStatus();

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="output_dysplays"
      title='VIDEO_PREVIEW_01'
      hasInput={true}
      hasOutput={true}
      onDataUpdate={onDataUpdate}
    >
      {/* Video Preview */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: `2px dashed ${formatStatus.color}`,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '8px',
        position: 'relative'
      }}>
        {videoUrl ? (
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              src={videoUrl}
              onEnded={handleVideoEnded}
              style={{ 
                width: '240px', 
                height: '120px', 
                objectFit: 'cover',
                display: isLoading ? 'none' : 'block'
              }}
              loop
              preload="metadata"
              playsInline
              onLoadedData={handleVideoLoadedData}
              onError={handleVideoError}
              onCanPlay={() => {
                console.log(`[ViewVideoNode ${id}] Video can play`);
                setError(null);
              }}
            />
            
            {/* Loading overlay */}
            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fbbf24',
                height: '120px'
              }}>
                loading_video...
              </div>
            )}

            {/* Error overlay */}
            {error && (
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'rgba(239, 68, 68, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                padding: '8px',
                textAlign: 'center',
                color: '#fff',
                height: '120px',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>ERROR</div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>{error}</div>
              </div>
            )}

            {/* Play status indicator */}
            {!isLoading && !error && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '8px',
                color: isPlaying ? '#34d399' : '#94a3b8',
                fontFamily: 'inherit',
                letterSpacing: '0.5px'
              }}>
                {isPlaying ? 'PLAYING' : 'PAUSED'}
              </div>
            )}
          </div>
        ) : (
          <div style={{

            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: error ? '#f87171' : 'rgba(224, 242, 254, 0.6)',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {error ? (
              <>
                <div style={{ fontSize: '16px' }}>!</div>
                <div style={{ textAlign: 'center', fontSize: '9px' }}>{error}</div>
              </>
            ) : isLoading ? (
              <>
                <div>analyzing_video...</div>
                <div style={{ fontSize: '8px', opacity: 0.7 }}>checking format</div>
              </>
            ) : (
              <>
                <div>no_video_input</div>
                <div style={{ fontSize: '8px', opacity: 0.7 }}>connect input node</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <button
          onClick={handlePlayPause}
          disabled={!videoUrl || isLoading || !!error}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '10px',
            background: (!videoUrl || isLoading || error) 
              ? 'rgba(107, 114, 128, 0.3)' 
              : 'rgba(168, 85, 247, 0.3)',
            color: (!videoUrl || isLoading || error) 
              ? 'rgba(156, 163, 175, 0.8)' 
              : '#e0f2fe',
            border: `1px solid ${(!videoUrl || isLoading || error) 
              ? 'rgba(107, 114, 128, 0.5)' 
              : 'rgba(168, 85, 247, 0.5)'}`,
            borderRadius: '6px',
            cursor: (!videoUrl || isLoading || error) ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.5px'
          }}
        >
          {isPlaying ? '[pause]' : '[play]'}
        </button>
        
        <button
          onClick={handleStop}
          disabled={!videoUrl || isLoading || !!error}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '10px',
            background: (!videoUrl || isLoading || error) 
              ? 'rgba(107, 114, 128, 0.3)' 
              : 'rgba(168, 85, 247, 0.3)',
            color: (!videoUrl || isLoading || error) 
              ? 'rgba(156, 163, 175, 0.8)' 
              : '#e0f2fe',
            border: `1px solid ${(!videoUrl || isLoading || error) 
              ? 'rgba(107, 114, 128, 0.5)' 
              : 'rgba(168, 85, 247, 0.5)'}`,
            borderRadius: '6px',
            cursor: (!videoUrl || isLoading || error) ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.5px'
          }}
        >
          [stop]
        </button>
      </div>

      {/* Status info */}
      <div style={{
        fontSize: '8px',
        color: 'rgba(224, 242, 254, 0.6)',
        background: 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${formatStatus.color}`,
        borderRadius: '4px',
        padding: '6px 8px',
        marginBottom: '8px',
        textAlign: 'center',
        fontFamily: 'inherit'
      }}>
        {data?.videoPath ? (
          <div>
            <div style={{ marginBottom: '2px' }}>
              {data.videoPath.split('/').pop()}
            </div>
            <div style={{ 
              fontSize: '7px', 
              opacity: 0.8,
              color: formatStatus.status === 'compatible' ? '#34d399' : 
                    formatStatus.status === 'needs_conversion' ? '#f87171' : '#fbbf24'
            }}>
            </div>
          </div>
        ) : (
          'awaiting_connection'
        )}
      </div>

      <NodeInfo>
        preview: {formatStatus.status === 'compatible' ? 'html5_ready' : 
                 formatStatus.status === 'needs_conversion' ? 'convert_required' : 
                 'checking'}
      </NodeInfo>
    </BaseNode>
  );
};

export default memo(ViewVideoNode);