// src/nodes/TrimAudioNode.tsx
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeInfo, NodeField } from '../components/NodeUI';
import { convertFileSrc } from '@tauri-apps/api/core';

interface TrimAudioData {
  audioPath?: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  duration: number;  // total audio duration
}

interface TrimAudioNodeProps {
  id: string;
  data: TrimAudioData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<TrimAudioData>) => void;
}

const TrimAudioNode: React.FC<TrimAudioNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const startTime = data?.startTime || 0;
  const endTime = data?.endTime || data?.duration || 60;
  const duration = data?.duration || 60;

  // Safety bounds - prevent invalid timeline values
  const safeDuration = Math.max(1, Math.min(duration, 7200)); // Max 2 hours
  const safeStartTime = Math.max(0, Math.min(startTime, safeDuration - 1));
  const safeEndTime = Math.max(safeStartTime + 1, Math.min(endTime, safeDuration));

  console.log('Audio Timeline values:', { duration, safeDuration, startTime: safeStartTime, endTime: safeEndTime });

  // Convert audio path to URL
  useEffect(() => {
    const setupAudio = async () => {
      const inputPath = data?.audioPath;
      
      if (!inputPath || inputPath === '$ null' || inputPath.trim() === '') {
        setAudioUrl(null);
        return;
      }

      try {
        const url = await convertFileSrc(inputPath);
        setAudioUrl(url);
      } catch (err) {
        console.error('Failed to convert audio path:', err);
        setAudioUrl(null);
      }
    };
    
    setupAudio();
  }, [data?.audioPath]);

  // Update audio metadata when loaded
  const handleAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log('Audio loaded, duration:', audioDuration);
      
      // Only update if we have a valid duration
      if (audioDuration && !isNaN(audioDuration) && audioDuration > 0) {
        onDataUpdate?.(id, { 
          duration: audioDuration,
          endTime: Math.min(data?.endTime || audioDuration, audioDuration) // Cap endTime to audio duration
        });
      }
    }
  }, [id, onDataUpdate, data?.endTime]);

  // Update current time
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  // Monitor playback to stop at end time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const checkTime = () => {
      if (audio.currentTime >= safeEndTime && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    };
    
    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [safeEndTime, isPlaying]);

  // Format time as HH:MM:SS:FF (frames not applicable for audio, but keeping format)
  const formatTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100); // Show centiseconds for audio
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Calculate position percentages using safe values
  const startPercent = (safeStartTime / safeDuration) * 100;
  const endPercent = (safeEndTime / safeDuration) * 100;
  const playheadPercent = (currentTime / safeDuration) * 100;

  // Handle timeline clicks
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    const newTime = (percent / 100) * safeDuration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle drag operations
  const handleMouseDown = (type: 'start' | 'end' | 'playhead') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      const newTime = (percent / 100) * safeDuration;
      
      if (type === 'start') {
        const clampedStart = Math.max(0, Math.min(newTime, safeEndTime - 0.1));
        onDataUpdate?.(id, { startTime: clampedStart });
      } else if (type === 'end') {
        const clampedEnd = Math.max(safeStartTime + 0.1, Math.min(newTime, safeDuration));
        onDataUpdate?.(id, { endTime: clampedEnd });
      } else if (type === 'playhead') {
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Play/Pause controls
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Start playback from current position, but stop at end time
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ width: '400px', maxWidth: '400px'}}>
      <BaseNode
        id={id}
        data={data}
        isConnectable={isConnectable}
        theme="trim"
        title='TRIM_AUDIO'
        hasAudioInput={true}    // Audio input instead of video
        hasOutput={false}       // No audio output - only data
        hasDataOutput={true}    // Trim parameters output only
      >
        <div className="nodrag">
          {/* Audio Preview */}
          <NodeField>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(236, 72, 153, 0.4)', // Pink border for audio
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}>
              {audioUrl ? (
                <div style={{
                  height: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onLoadedMetadata={handleAudioLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    style={{ display: 'none' }} // Hidden audio element
                  />
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(236, 72, 153, 0.9)',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    🎵 AUDIO_TRIM_PREVIEW
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(224, 242, 254, 0.7)',
                    textAlign: 'center'
                  }}>
                    Duration: {formatTimecode(safeDuration)}
                  </div>
                </div>
              ) : (
                <div style={{
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(224, 242, 254, 0.6)'
                }}>
                  connect_audio_input
                </div>
              )}
            </div>
          </NodeField>

          {/* Timeline - Same as video but with audio styling */}
          <NodeField>
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              style={{
                height: '40px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(236, 72, 153, 0.3)', // Pink border
                borderRadius: '6px',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              {/* Timeline background */}
              <div style={{
                position: 'absolute',
                inset: '2px',
                background: 'linear-gradient(90deg, rgba(107, 114, 128, 0.3) 0%, rgba(156, 163, 175, 0.2) 100%)',
                borderRadius: '4px'
              }} />

              {/* Selected range */}
              <div style={{
                position: 'absolute',
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
                height: '100%',
                background: 'rgba(236, 72, 153, 0.3)', // Pink selection
                border: '1px solid rgba(236, 72, 153, 0.5)',
                borderRadius: '4px',
                top: 0
              }} />

              {/* Start handle */}
              <div
                onMouseDown={handleMouseDown('start')}
                style={{
                  position: 'absolute',
                  left: `${startPercent}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '30px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  border: '2px solid rgba(239, 68, 68, 0.7)',
                  borderRadius: '6px',
                  cursor: 'ew-resize',
                  zIndex: 3
                }}
              />

              {/* End handle */}
              <div
                onMouseDown={handleMouseDown('end')}
                style={{
                  position: 'absolute',
                  left: `${endPercent}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '30px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  border: '2px solid rgba(239, 68, 68, 0.7)',
                  borderRadius: '6px',
                  cursor: 'ew-resize',
                  zIndex: 3
                }}
              />

              {/* Playhead */}
              <div
                onMouseDown={handleMouseDown('playhead')}
                style={{
                  position: 'absolute',
                  left: `${playheadPercent}%`,
                  top: '0',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '100%',
                  background: 'rgba(147, 197, 253, 0.9)',
                  cursor: 'ew-resize',
                  zIndex: 4
                }}
              />
            </div>
          </NodeField>

          {/* Time Display */}
          <NodeField>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              fontSize: '9px',
              fontFamily: 'inherit',
            }}>
              <div style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '4px',
                padding: '4px 6px',
                textAlign: 'center'
              }}>
                START: {formatTimecode(safeStartTime)}
              </div>
              <div style={{
                background: 'rgba(147, 197, 253, 0.2)',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                borderRadius: '4px',
                padding: '4px 6px',
                textAlign: 'center'
              }}>
                CURRENT: {formatTimecode(currentTime)}
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '4px',
                padding: '4px 6px',
                textAlign: 'center'
              }}>
                END: {formatTimecode(safeEndTime)}
              </div>
            </div>
          </NodeField>

          {/* Controls */}
          <NodeField>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={togglePlayback}
                disabled={!audioUrl}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '10px',
                  background: !audioUrl ? 'rgba(107, 114, 128, 0.3)' : 'rgba(236, 72, 153, 0.3)', // Pink when enabled
                  color: !audioUrl ? 'rgba(156, 163, 175, 0.8)' : '#e0f2fe',
                  border: `1px solid ${!audioUrl ? 'rgba(107, 114, 128, 0.5)' : 'rgba(236, 72, 153, 0.5)'}`,
                  borderRadius: '6px',
                  cursor: !audioUrl ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isPlaying ? '[pause]' : '[play_selection]'}
              </button>
            </div>
          </NodeField>
        </div>

        <NodeInfo>
          mode: data_only | selection: {formatTimecode(safeEndTime - safeStartTime)} | audio_trim
        </NodeInfo>
      </BaseNode>
    </div>
  );
};

export default memo(TrimAudioNode);