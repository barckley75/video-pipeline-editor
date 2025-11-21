// src/nodes/InfoVideoNode.tsx
import React, { memo, useState, useEffect } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeButton, NodeInfo, NodeField } from '../components/NodeUI';
import { invoke } from '@tauri-apps/api/core';

interface VideoMetadata {
  path: string;
  format: string;
  width: number;
  height: number;
  duration: number;
  bitrate?: number;
  fps?: number;
  codec?: string;
  size?: number;
  audioCodec?: string;
  audioSampleRate?: number;
  audioChannels?: number;
  // Extended metadata fields
  profile?: string;
  level?: string;
  pixelFormat?: string;
  colorSpace?: string;
  transferCharacteristics?: string;
  colorPrimaries?: string;
  chromaLocation?: string;
  aspectRatio?: string;
  startTime?: number;
  totalFrames?: number;
  keyframeInterval?: number;
  bFrames?: number;
  hasSubtitles?: boolean;
  metadata?: Record<string, any>;
  streams?: Array<any>;
}

interface InfoVideoData {
  videoPath?: string;
  metadata?: VideoMetadata;
  isAnalyzing?: boolean;
  error?: string | null;
}

interface InfoVideoNodeProps {
  id: string;
  data: InfoVideoData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<InfoVideoData>) => void;
}

type InfoSection = 'overview' | 'video' | 'audio' | 'technical' | 'streams' | 'metadata' | 'quality';

const InfoVideoNode: React.FC<InfoVideoNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(data.metadata || null);
  const [error, setError] = useState<string | null>(data.error || null);
  const [selectedSection, setSelectedSection] = useState<InfoSection>('overview');

  // When video path changes, analyze the file
  useEffect(() => {
    if (data.videoPath && data.videoPath !== '$ null' && data.videoPath !== metadata?.path) {
      analyzeVideo(data.videoPath);
    }
  }, [data.videoPath]);

  const analyzeVideo = async (videoPath: string) => {
    if (!videoPath || videoPath === '$ null') return;

    console.log('🔍 Starting video analysis for:', videoPath);
    
    setIsAnalyzing(true);
    setError(null);
    setMetadata(null);
    onDataUpdate?.(id, { isAnalyzing: true, error: null, metadata: undefined });

    try {
      // Call backend to get video metadata with better error handling
      const videoData = await invoke<VideoMetadata>('get_video_metadata', { 
        filePath: videoPath 
      });

      console.log('✅ Video metadata received:', videoData);
      
      // Validate the received data
      if (!videoData || !videoData.path) {
        throw new Error('Invalid metadata received from backend');
      }
      
      setMetadata(videoData);
      onDataUpdate?.(id, { 
        metadata: videoData, 
        isAnalyzing: false,
        error: null
      });
      
    } catch (err: any) {
      console.error('❌ Error analyzing video:', err);
      
      // Better error message handling
      let errorMsg = 'Analysis failed';
      if (typeof err === 'string') {
        errorMsg = err;
      } else if (err?.message) {
        errorMsg = err.message;
      } else if (err?.toString) {
        errorMsg = err.toString();
      }
      
      // Truncate very long error messages
      if (errorMsg.length > 200) {
        errorMsg = errorMsg.substring(0, 200) + '...';
      }
      
      setError(errorMsg);
      onDataUpdate?.(id, { 
        error: errorMsg, 
        isAnalyzing: false,
        metadata: undefined
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshAnalysis = () => {
    if (data.videoPath && data.videoPath !== '$ null') {
      analyzeVideo(data.videoPath);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds < 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const calculateQualityScore = (metadata: VideoMetadata): number => {
    let score = 0;
    
    // Resolution score (0-30)
    const pixelCount = (metadata.width || 0) * (metadata.height || 0);
    if (pixelCount >= 3840 * 2160) score += 30; // 4K+
    else if (pixelCount >= 1920 * 1080) score += 25; // 1080p
    else if (pixelCount >= 1280 * 720) score += 20; // 720p
    else score += 10; // Lower
    
    // Bitrate score (0-25)
    if (metadata.bitrate) {
      const kbps = metadata.bitrate / 1000;
      if (kbps >= 8000) score += 25;
      else if (kbps >= 4000) score += 20;
      else if (kbps >= 2000) score += 15;
      else score += 10;
    }
    
    // Framerate score (0-20)
    if (metadata.fps) {
      if (metadata.fps >= 60) score += 20;
      else if (metadata.fps >= 30) score += 15;
      else if (metadata.fps >= 24) score += 12;
      else score += 8;
    }
    
    // Codec score (0-25)
    if (metadata.codec) {
      const codec = metadata.codec.toLowerCase();
      if (codec.includes('h265') || codec.includes('hevc')) score += 25;
      else if (codec.includes('h264') || codec.includes('avc')) score += 20;
      else if (codec.includes('vp9')) score += 22;
      else score += 10;
    }
    
    return Math.min(100, score);
  };

  const infoSections: Array<{ key: InfoSection; label: string; color: string }> = [
    { key: 'overview', label: 'OVERVIEW', color: '#60a5fa' },
    { key: 'video', label: 'VIDEO', color: '#34d399' },
    { key: 'audio', label: 'AUDIO', color: '#a78bfa' },
    { key: 'technical', label: 'TECH', color: '#fbbf24' },
    { key: 'streams', label: 'STREAMS', color: '#f87171' },
    { key: 'metadata', label: 'META', color: '#fb7185' },
    { key: 'quality', label: 'QUALITY', color: '#06d6a0' }
  ];

  const renderInfoSection = () => {
    if (!metadata) return null;

    const sectionStyle = {
      fontSize: '9px',
      fontFamily: 'inherit',
      color: 'rgba(224, 242, 254, 0.9)',
      lineHeight: '1.4',
      maxHeight: '220px',
      overflowY: 'auto' as const
    };

    switch (selectedSection) {
      case 'overview':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(96, 165, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px' }}>FILE_OVERVIEW:</div>
              <div>name: {metadata.path.split('/').pop() || metadata.path.split('\\').pop() || metadata.path}</div>
              <div>format: {metadata.format.toUpperCase()}</div>
              {metadata.size && <div>size: {formatFileSize(metadata.size)}</div>}
              <div>duration: {formatDuration(metadata.duration)}</div>
            </div>
            
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(96, 165, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>QUICK_SPECS:</div>
              <div>resolution: {metadata.width || 0}x{metadata.height || 0}</div>
              {metadata.fps && <div>framerate: {metadata.fps.toFixed(2)} fps</div>}
              {metadata.codec && <div>video_codec: {metadata.codec}</div>}
              {metadata.audioCodec && <div>audio_codec: {metadata.audioCodec}</div>}
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>COMPUTED:</div>
              <div>aspect_ratio: {metadata.width && metadata.height ? (metadata.width / metadata.height).toFixed(3) + ':1' : 'unknown'}</div>
              <div>megapixels: {metadata.width && metadata.height ? ((metadata.width * metadata.height) / 1000000).toFixed(2) + 'MP' : '0.00MP'}</div>
              {metadata.fps && metadata.duration && (
                <div>total_frames: {Math.round(metadata.fps * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.bitrate && (
                <div>data_rate: {(metadata.bitrate / 8 / 1024 / 1024).toFixed(2)} MB/s</div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(52, 211, 153, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>VIDEO_STREAM:</div>
              <div>resolution: {metadata.width || 0}x{metadata.height || 0}</div>
              <div>aspect_ratio: {metadata.width && metadata.height ? (metadata.width / metadata.height).toFixed(3) + ':1' : 'unknown'}</div>
              {metadata.fps && <div>framerate: {metadata.fps.toFixed(3)} fps</div>}
              {metadata.codec && <div>codec: {metadata.codec.toUpperCase()}</div>}
              {metadata.profile && <div>profile: {metadata.profile}</div>}
              {metadata.level && <div>level: {metadata.level}</div>}
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(52, 211, 153, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px' }}>ENCODING:</div>
              {metadata.bitrate && <div>bitrate: {Math.round(metadata.bitrate / 1000).toLocaleString()} kbps</div>}
              {metadata.pixelFormat && <div>pixel_format: {metadata.pixelFormat}</div>}
              {metadata.colorSpace && <div>color_space: {metadata.colorSpace}</div>}
              {metadata.transferCharacteristics && <div>transfer: {metadata.transferCharacteristics}</div>}
              {metadata.colorPrimaries && <div>primaries: {metadata.colorPrimaries}</div>}
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>STRUCTURE:</div>
              {metadata.totalFrames && <div>total_frames: {metadata.totalFrames.toLocaleString()}</div>}
              {metadata.keyframeInterval && <div>keyframe_interval: {metadata.keyframeInterval}</div>}
              {metadata.bFrames !== undefined && <div>b_frames: {metadata.bFrames}</div>}
              {metadata.startTime && <div>start_time: {metadata.startTime.toFixed(3)}s</div>}
            </div>
          </div>
        );

      case 'audio':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#a78bfa', fontWeight: '600', letterSpacing: '0.5px' }}>AUDIO_STREAM:</div>
              {metadata.audioCodec && <div>codec: {metadata.audioCodec.toUpperCase()}</div>}
              {metadata.audioChannels && <div>channels: {metadata.audioChannels}</div>}
              {metadata.audioSampleRate && <div>sample_rate: {metadata.audioSampleRate.toLocaleString()} Hz</div>}
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>PROPERTIES:</div>
              {metadata.audioChannels === 1 && <div>layout: mono</div>}
              {metadata.audioChannels === 2 && <div>layout: stereo</div>}
              {metadata.audioChannels && metadata.audioChannels > 2 && (
                <div>layout: {metadata.audioChannels}.1 surround</div>
              )}
              {metadata.audioSampleRate && (
                <div>bit_depth: {metadata.audioSampleRate >= 48000 ? '24-bit' : '16-bit'} (estimated)</div>
              )}
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>ANALYSIS:</div>
              <div>duration: {formatDuration(metadata.duration)}</div>
              {metadata.audioSampleRate && metadata.duration && (
                <div>total_samples: {(metadata.audioSampleRate * metadata.duration).toLocaleString()}</div>
              )}
              <div>quality: {metadata.audioSampleRate && metadata.audioSampleRate >= 48000 ? 'HIGH' : 'STANDARD'}</div>
            </div>
          </div>
        );

      case 'technical':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>TECHNICAL_DATA:</div>
              <div>container: {metadata.format.toUpperCase()}</div>
              {metadata.size && <div>file_size: {formatFileSize(metadata.size)}</div>}
              {metadata.bitrate && <div>overall_bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>}
              <div>pixel_count: {((metadata.width || 0) * (metadata.height || 0)).toLocaleString()}</div>
              <div>megapixels: {((metadata.width || 0) * (metadata.height || 0) / 1000000).toFixed(2)}MP</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px' }}>COMPUTED_METRICS:</div>
              {metadata.fps && metadata.duration && (
                <div>total_frames: {Math.round(metadata.fps * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.bitrate && metadata.duration && (
                <div>total_bits: {Math.round(metadata.bitrate * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.fps && (
                <div>frame_interval: {(1000 / metadata.fps).toFixed(2)}ms</div>
              )}
              <div>storage_aspect: {metadata.width && metadata.height ? (metadata.width / metadata.height).toFixed(6) + ':1' : 'unknown'}</div>
            </div>

            <div>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>EFFICIENCY:</div>
              {metadata.bitrate && metadata.width && metadata.height && metadata.fps && (
                <div>bits_per_pixel: {(metadata.bitrate / (metadata.width * metadata.height * metadata.fps)).toFixed(4)}</div>
              )}
              {metadata.size && metadata.duration && (
                <div>storage_rate: {(metadata.size / metadata.duration / 1024).toFixed(2)} KB/s</div>
              )}
              <div>compression: {metadata.codec?.toLowerCase().includes('h265') ? 'ADVANCED' : 'STANDARD'}</div>
            </div>
          </div>
        );

      case 'streams':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(248, 113, 113, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#f87171', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_INFO:</div>
              <div>total_streams: {(metadata.streams?.length || 2)}</div>
              <div>video_streams: 1</div>
              <div>audio_streams: 1</div>
              <div>subtitle_streams: {metadata.hasSubtitles ? '1+' : '0'}</div>
              <div>data_streams: 0</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(248, 113, 113, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_0_VIDEO:</div>
              <div>codec: {metadata.codec || 'unknown'}</div>
              <div>resolution: {metadata.width || 0}x{metadata.height || 0}</div>
              {metadata.fps && <div>framerate: {metadata.fps.toFixed(2)} fps</div>}
              {metadata.bitrate && <div>bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>}
              <div>duration: {formatDuration(metadata.duration)}</div>
            </div>

            <div>
              <div style={{ color: '#a78bfa', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_1_AUDIO:</div>
              <div>codec: {metadata.audioCodec || 'unknown'}</div>
              {metadata.audioChannels && <div>channels: {metadata.audioChannels}</div>}
              {metadata.audioSampleRate && <div>sample_rate: {metadata.audioSampleRate} Hz</div>}
              <div>duration: {formatDuration(metadata.duration)}</div>
            </div>
          </div>
        );

      case 'metadata':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(251, 113, 133, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#fb7185', fontWeight: '600', letterSpacing: '0.5px' }}>FILE_METADATA:</div>
              <div>creation_time: {metadata.metadata?.creation_time || 'unknown'}</div>
              <div>encoder: {metadata.metadata?.encoder || 'unknown'}</div>
              <div>title: {metadata.metadata?.title || 'untitled'}</div>
              <div>comment: {metadata.metadata?.comment || 'none'}</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(251, 113, 133, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px' }}>CONTAINER_INFO:</div>
              <div>format_name: {metadata.format}</div>
              <div>format_long: {metadata.format.toUpperCase()} Container</div>
              {metadata.startTime && <div>start_time: {metadata.startTime.toFixed(6)}s</div>}
              <div>nb_streams: {metadata.streams?.length || 2}</div>
            </div>

            <div>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>CUSTOM_DATA:</div>
              {metadata.metadata && Object.keys(metadata.metadata).length > 0 ? (
                Object.entries(metadata.metadata).slice(0, 3).map(([key, value]) => (
                  <div key={key}>{key}: {String(value).substring(0, 30)}</div>
                ))
              ) : (
                <div>no_custom_metadata</div>
              )}
            </div>
          </div>
        );

      case 'quality':
        const qualityScore = calculateQualityScore(metadata);
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(6, 214, 160, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#06d6a0', fontWeight: '600', letterSpacing: '0.5px' }}>QUALITY_SCORE:</div>
              <div style={{ color: qualityScore >= 80 ? '#10b981' : qualityScore >= 60 ? '#fbbf24' : '#ef4444' }}>
                overall: {qualityScore}/100 ({qualityScore >= 80 ? 'EXCELLENT' : qualityScore >= 60 ? 'GOOD' : 'POOR'})
              </div>
              <div>resolution_grade: {(metadata.width || 0) >= 1920 ? 'A+' : (metadata.width || 0) >= 1280 ? 'B+' : 'C'}</div>
              <div>codec_efficiency: {metadata.codec?.toLowerCase().includes('h265') ? 'ADVANCED' : 'STANDARD'}</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(6, 214, 160, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#34d399', fontWeight: '600', letterSpacing: '0.5px' }}>ANALYSIS:</div>
              {metadata.bitrate && (
                <div>bitrate_class: {metadata.bitrate > 8000000 ? 'HIGH' : metadata.bitrate > 4000000 ? 'MEDIUM' : 'LOW'}</div>
              )}
              <div>framerate_class: {(metadata.fps || 0) >= 60 ? 'SMOOTH' : (metadata.fps || 0) >= 30 ? 'STANDARD' : 'CINEMATIC'}</div>
              <div>audio_quality: {(metadata.audioSampleRate || 0) >= 48000 ? 'HIGH' : 'STANDARD'}</div>
              <div>compression: {metadata.codec?.toLowerCase().includes('h265') ? 'EFFICIENT' : 'LEGACY'}</div>
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>RECOMMENDATIONS:</div>
              {qualityScore < 60 && <div>• Consider re-encoding</div>}
              {(metadata.width || 0) < 1920 && <div>• Upscale resolution</div>}
              {(metadata.fps || 0) < 30 && <div>• Increase framerate</div>}
              {!metadata.codec?.toLowerCase().includes('h265') && (metadata.width || 0) >= 1920 && <div>• Use H.265 codec</div>}
              {qualityScore >= 80 && <div>• Quality is excellent</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ width: '320px', maxWidth: '320px' }}>
      <BaseNode
        id={id}
        data={data}
        isConnectable={isConnectable}
        theme="analysis_tools"
        title='INFO_VIDEO_METADATA'
        hasInput={true}
        hasOutput={false}
        onDataUpdate={onDataUpdate}
      >
      {/* Analysis Status */}
      <NodeField>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(245, 101, 101, 0.4)',
          borderRadius: '6px',
          padding: '8px',
          marginBottom: '8px'
        }}>
          {isAnalyzing ? (
            <div style={{ 
              fontSize: '10px', 
              color: '#fbbf24',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              ⚡ ANALYZING...
            </div>
          ) : error ? (
            <div style={{ 
              fontSize: '9px', 
              color: '#f87171',
              textAlign: 'center',
              letterSpacing: '0.3px',
              lineHeight: '1.3'
            }}>
              ⚠ {error}
            </div>
          ) : metadata ? (
            <div style={{ 
              fontSize: '10px', 
              color: '#34d399',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              ANALYSIS_COMPLETE
            </div>
          ) : (
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(224, 242, 254, 0.6)',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              AWAITING_INPUT
            </div>
          )}
        </div>
      </NodeField>

      {/* Info Section Selector */}
      {metadata && (
        <NodeField>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2px',
            marginBottom: '8px'
          }}>
            {infoSections.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setSelectedSection(key)}
                style={{
                  background: selectedSection === key 
                    ? `rgba(${color === '#60a5fa' ? '96, 165, 250' : 
                        color === '#34d399' ? '52, 211, 153' :
                        color === '#a78bfa' ? '167, 139, 250' :
                        color === '#fbbf24' ? '251, 191, 36' :
                        color === '#f87171' ? '248, 113, 113' :
                        color === '#fb7185' ? '251, 113, 133' :
                        '6, 214, 160'}, 0.3)` 
                    : 'rgba(0, 0, 0, 0.2)',
                  border: `1px solid ${selectedSection === key ? color : 'rgba(245, 101, 101, 0.3)'}`,
                  borderRadius: '4px',
                  padding: '4px 2px',
                  fontSize: '8px',
                  fontWeight: '600',
                  letterSpacing: '0.3px',
                  color: selectedSection === key ? color : 'rgba(224, 242, 254, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </NodeField>
      )}

      {/* Video Information Display */}
      {metadata && (
        <NodeField>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(245, 101, 101, 0.3)',
            borderRadius: '6px',
            padding: '8px'
          }}>
            {renderInfoSection()}
          </div>
        </NodeField>
      )}

      {/* Control Button */}
      <NodeField>
        <NodeButton 
          onClick={refreshAnalysis}
          disabled={isAnalyzing || !data.videoPath || data.videoPath === '$ null'}
          style={{ 
            width: '100%',
            fontSize: '10px',
            letterSpacing: '0.5px'
          }}
        >
          {isAnalyzing ? '[analyzing...]' : '[refresh_info]'}
        </NodeButton>
      </NodeField>

      <NodeInfo>
        probe: ffprobe | output: {selectedSection}_display
      </NodeInfo>
    </BaseNode>
    </div>
  );
};

export default memo(InfoVideoNode);