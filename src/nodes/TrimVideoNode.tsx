// src/nodes/TrimVideoNode.tsx
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeInfo, NodeField } from '../components/NodeUI';
import { convertFileSrc } from '@tauri-apps/api/core';

interface TrimVideoData {
  videoPath?: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  duration: number;  // total video duration
}

interface TrimVideoNodeProps {
  id: string;
  data: TrimVideoData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<TrimVideoData>) => void;
}

const TrimVideoNode: React.FC<TrimVideoNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const startTime = data?.startTime || 0;
  const endTime = data?.endTime || data?.duration || 60;
  const duration = data?.duration || 60;

  // Safety bounds - prevent invalid timeline values
  const safeDuration = Math.max(1, Math.min(duration, 7200)); // Max 2 hours
  const safeStartTime = Math.max(0, Math.min(startTime, safeDuration - 1));
  const safeEndTime = Math.max(safeStartTime + 1, Math.min(endTime, safeDuration));

  console.log('Timeline values:', { duration, safeDuration, startTime: safeStartTime, endTime: safeEndTime });

  // Convert video path to URL
  useEffect(() => {
    const setupVideo = async () => {
      const inputPath = data?.videoPath;
      
      if (!inputPath || inputPath === '$ null' || inputPath.trim() === '') {
        setVideoUrl(null);
        return;
      }

      try {
        const url = await convertFileSrc(inputPath);
        setVideoUrl(url);
      } catch (err) {
        console.error('Failed to convert video path:', err);
        setVideoUrl(null);
      }
    };
    
    setupVideo();
  }, [data?.videoPath]);

  // Update video metadata when loaded
  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      console.log('Video loaded, duration:', videoDuration);
      
      // Only update if we have a valid duration
      if (videoDuration && !isNaN(videoDuration) && videoDuration > 0) {
        onDataUpdate?.(id, { 
          duration: videoDuration,
          endTime: Math.min(data?.endTime || videoDuration, videoDuration) // Cap endTime to video duration
        });
      }
    }
  }, [id, onDataUpdate, data?.endTime]);

  // Update current time
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  // Monitor playback to stop at end time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const checkTime = () => {
      if (video.currentTime >= safeEndTime && isPlaying) {
        video.pause();
        setIsPlaying(false);
      }
    };
    
    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [safeEndTime, isPlaying]);

  // Format time as HH:MM:SS:FF
  const formatTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
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
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
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
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
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
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Start playback from current position, but stop at end time
      videoRef.current.play();
      // videoRef.current.currentTime = safeStartTime;
      // setCurrentTime(safeStartTime);
      // videoRef.current.play();
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
        title='TRIM_VIDEO'
        hasInput={true}       // Video input
        hasOutput={false}     // No video output - only data
        hasDataOutput={true}  // Trim parameters output only
      >
        <div className="nodrag">
          {/* Video Preview */}
          <NodeField>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}>
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  playsInline
                />
              ) : (
                <div style={{
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(224, 242, 254, 0.6)'
                }}>
                  connect_video_input
                </div>
              )}
            </div>
          </NodeField>

          {/* Timeline */}
          <NodeField>
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              style={{
                height: '40px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
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
                background: 'rgba(251, 191, 36, 0.3)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
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
                disabled={!videoUrl}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '10px',
                  background: !videoUrl ? 'rgba(107, 114, 128, 0.3)' : 'rgba(251, 191, 36, 0.3)',
                  color: !videoUrl ? 'rgba(156, 163, 175, 0.8)' : '#e0f2fe',
                  border: `1px solid ${!videoUrl ? 'rgba(107, 114, 128, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                  borderRadius: '6px',
                  cursor: !videoUrl ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isPlaying ? '[pause]' : '[play_selection]'}
              </button>
            </div>
          </NodeField>
        </div>

        <NodeInfo>
          mode: data_only | selection: {formatTimecode(safeEndTime - safeStartTime)} | fps: 30
        </NodeInfo>
      </BaseNode>
    </div>
  );
};

export default memo(TrimVideoNode);