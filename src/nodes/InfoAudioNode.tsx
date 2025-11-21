// src/nodes/InfoAudioNode.tsx
import React, { memo, useState, useEffect } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeButton, NodeInfo, NodeField } from '../components/NodeUI';
import { invoke } from '@tauri-apps/api/core';

interface AudioMetadata {
  path: string;
  format: string;
  duration: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
  codec?: string;
  size?: number;
  // Extended audio metadata fields
  bitsPerSample?: number;
  channelLayout?: string;
  encoder?: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  totalSamples?: number;
  peakLevel?: number;
  rmsLevel?: number;
  dynamicRange?: number;
  lufsIntegrated?: number;
  lufsRange?: number;
  truePeak?: number;
  hasMetadata?: boolean;
  metadata?: Record<string, any>;
  streams?: Array<any>;
}

interface InfoAudioData {
  audioPath?: string;
  metadata?: AudioMetadata;
  isAnalyzing?: boolean;
  error?: string | null;
}

interface InfoAudioNodeProps {
  id: string;
  data: InfoAudioData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<InfoAudioData>) => void;
}

type InfoSection = 'overview' | 'audio' | 'technical' | 'quality' | 'metadata' | 'streams';

const InfoAudioNode: React.FC<InfoAudioNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(data.metadata || null);
  const [error, setError] = useState<string | null>(data.error || null);
  const [selectedSection, setSelectedSection] = useState<InfoSection>('overview');

  // When audio path changes, analyze the file
  useEffect(() => {
    if (data.audioPath && data.audioPath !== '$ null' && data.audioPath !== metadata?.path) {
      analyzeAudio(data.audioPath);
    }
  }, [data.audioPath]);

  const analyzeAudio = async (audioPath: string) => {
    if (!audioPath || audioPath === '$ null') return;

    console.log('🎵 Starting audio analysis for:', audioPath);
    
    setIsAnalyzing(true);
    setError(null);
    setMetadata(null);
    onDataUpdate?.(id, { isAnalyzing: true, error: null, metadata: undefined });

    try {
      // Call backend to get audio metadata (we'll implement this in backend later)
      const audioData = await invoke<AudioMetadata>('get_audio_metadata', { 
        filePath: audioPath 
      });

      console.log('✅ Audio metadata received:', audioData);
      
      // Validate the received data
      if (!audioData || !audioData.path) {
        throw new Error('Invalid metadata received from backend');
      }
      
      setMetadata(audioData);
      onDataUpdate?.(id, { 
        metadata: audioData, 
        isAnalyzing: false,
        error: null
      });
      
    } catch (err: any) {
      console.error('❌ Error analyzing audio:', err);
      
      // Better error message handling
      let errorMsg = 'Audio analysis failed';
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
    if (data.audioPath && data.audioPath !== '$ null') {
      analyzeAudio(data.audioPath);
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

  const calculateAudioQualityScore = (metadata: AudioMetadata): number => {
    let score = 0;
    
    // Sample rate score (0-30)
    if (metadata.sampleRate) {
      if (metadata.sampleRate >= 192000) score += 30; // Ultra high
      else if (metadata.sampleRate >= 96000) score += 28; // Very high
      else if (metadata.sampleRate >= 48000) score += 25; // High
      else if (metadata.sampleRate >= 44100) score += 20; // Standard
      else score += 10; // Lower
    }
    
    // Bitrate score (0-25)
    if (metadata.bitrate) {
      const kbps = metadata.bitrate / 1000;
      if (kbps >= 1000) score += 25; // Lossless/very high
      else if (kbps >= 320) score += 22; // High
      else if (kbps >= 256) score += 18; // Good
      else if (kbps >= 128) score += 15; // Standard
      else score += 8; // Low
    }
    
    // Bit depth score (0-25) - estimated from format/codec
    if (metadata.codec) {
      const codec = metadata.codec.toLowerCase();
      if (codec.includes('flac') || codec.includes('pcm')) score += 25; // Lossless
      else if (codec.includes('aac') || codec.includes('opus')) score += 20; // Modern
      else if (codec.includes('mp3')) score += 15; // Standard
      else score += 10; // Other
    }
    
    // Channel configuration score (0-20)
    if (metadata.channels) {
      if (metadata.channels >= 6) score += 20; // Surround
      else if (metadata.channels === 2) score += 18; // Stereo
      else score += 12; // Mono
    }
    
    return Math.min(100, score);
  };

  const infoSections: Array<{ key: InfoSection; label: string; color: string }> = [
    { key: 'overview', label: 'OVERVIEW', color: '#ec4899' },
    { key: 'audio', label: 'AUDIO', color: '#8b5cf6' },
    { key: 'technical', label: 'TECH', color: '#fbbf24' },
    { key: 'quality', label: 'QUALITY', color: '#06d6a0' },
    { key: 'metadata', label: 'META', color: '#f87171' },
    { key: 'streams', label: 'STREAMS', color: '#60a5fa' }
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
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(236, 72, 153, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#ec4899', fontWeight: '600', letterSpacing: '0.5px' }}>FILE_OVERVIEW:</div>
              <div>name: {metadata.path.split('/').pop() || metadata.path.split('\\').pop() || metadata.path}</div>
              <div>format: {metadata.format.toUpperCase()}</div>
              {metadata.size && <div>size: {formatFileSize(metadata.size)}</div>}
              <div>duration: {formatDuration(metadata.duration)}</div>
            </div>
            
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(236, 72, 153, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>AUDIO_SPECS:</div>
              {metadata.sampleRate && <div>sample_rate: {metadata.sampleRate.toLocaleString()} Hz</div>}
              {metadata.channels && <div>channels: {metadata.channels} ({metadata.channels === 1 ? 'mono' : metadata.channels === 2 ? 'stereo' : 'surround'})</div>}
              {metadata.codec && <div>codec: {metadata.codec.toUpperCase()}</div>}
              {metadata.bitrate && <div>bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>}
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>COMPUTED:</div>
              {metadata.sampleRate && metadata.duration && (
                <div>total_samples: {Math.round(metadata.sampleRate * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.bitrate && metadata.duration && (
                <div>total_bits: {Math.round(metadata.bitrate * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.bitrate && metadata.size && (
                <div>efficiency: {((metadata.size * 8) / (metadata.bitrate * metadata.duration) * 100).toFixed(1)}%</div>
              )}
              <div>quality_class: {metadata.sampleRate && metadata.sampleRate >= 48000 ? 'HIGH_DEFINITION' : 'STANDARD_DEFINITION'}</div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>AUDIO_STREAM:</div>
              {metadata.sampleRate && <div>sample_rate: {metadata.sampleRate.toLocaleString()} Hz</div>}
              {metadata.channels && <div>channels: {metadata.channels}</div>}
              {metadata.channelLayout && <div>layout: {metadata.channelLayout}</div>}
              {metadata.bitsPerSample && <div>bit_depth: {metadata.bitsPerSample} bits</div>}
              {metadata.codec && <div>codec: {metadata.codec.toUpperCase()}</div>}
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#ec4899', fontWeight: '600', letterSpacing: '0.5px' }}>ENCODING:</div>
              {metadata.bitrate && <div>bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>}
              {metadata.encoder && <div>encoder: {metadata.encoder}</div>}
              <div>compression: {metadata.codec?.toLowerCase().includes('flac') || metadata.codec?.toLowerCase().includes('pcm') ? 'LOSSLESS' : 'LOSSY'}</div>
              <div>type: {metadata.codec?.toLowerCase().includes('pcm') ? 'UNCOMPRESSED' : 'COMPRESSED'}</div>
            </div>

            <div>
              <div style={{ color: '#06d6a0', fontWeight: '600', letterSpacing: '0.5px' }}>PROPERTIES:</div>
              <div>duration: {formatDuration(metadata.duration)}</div>
              {metadata.totalSamples && <div>total_samples: {metadata.totalSamples.toLocaleString()}</div>}
              <div>dynamic_range: {metadata.dynamicRange ? `${metadata.dynamicRange.toFixed(2)} dB` : 'unknown'}</div>
              <div>peak_level: {metadata.peakLevel ? `${metadata.peakLevel.toFixed(2)} dBFS` : 'unknown'}</div>
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
              {metadata.sampleRate && <div>nyquist_freq: {Math.round(metadata.sampleRate / 2).toLocaleString()} Hz</div>}
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>COMPUTED_METRICS:</div>
              {metadata.sampleRate && metadata.duration && (
                <div>total_samples: {Math.round(metadata.sampleRate * metadata.duration).toLocaleString()}</div>
              )}
              {metadata.sampleRate && (
                <div>sample_interval: {(1000000 / metadata.sampleRate).toFixed(2)} μs</div>
              )}
              {metadata.bitrate && metadata.duration && (
                <div>total_data: {((metadata.bitrate * metadata.duration) / 8 / 1024 / 1024).toFixed(2)} MB</div>
              )}
              {metadata.channels && metadata.sampleRate && (
                <div>data_rate: {Math.round((metadata.channels * metadata.sampleRate * (metadata.bitsPerSample || 16)) / 1000)} kbps</div>
              )}
            </div>

            <div>
              <div style={{ color: '#ec4899', fontWeight: '600', letterSpacing: '0.5px' }}>EFFICIENCY:</div>
              {metadata.bitrate && metadata.sampleRate && metadata.channels && (
                <div>compression_ratio: {((metadata.channels * metadata.sampleRate * 16) / metadata.bitrate).toFixed(2)}:1</div>
              )}
              <div>format_efficiency: {metadata.format.toLowerCase() === 'flac' ? 'OPTIMAL' : metadata.format.toLowerCase() === 'mp3' ? 'GOOD' : 'STANDARD'}</div>
              <div>storage_class: {metadata.codec?.toLowerCase().includes('flac') ? 'ARCHIVAL' : 'STREAMING'}</div>
            </div>
          </div>
        );

      case 'quality':
        const qualityScore = calculateAudioQualityScore(metadata);
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(6, 214, 160, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#06d6a0', fontWeight: '600', letterSpacing: '0.5px' }}>QUALITY_SCORE:</div>
              <div style={{ color: qualityScore >= 80 ? '#10b981' : qualityScore >= 60 ? '#fbbf24' : '#ef4444' }}>
                overall: {qualityScore}/100 ({qualityScore >= 80 ? 'AUDIOPHILE' : qualityScore >= 60 ? 'GOOD' : 'BASIC'})
              </div>
              <div>sample_rate_grade: {(metadata.sampleRate || 0) >= 96000 ? 'A+' : (metadata.sampleRate || 0) >= 48000 ? 'A' : 'B'}</div>
              <div>codec_efficiency: {metadata.codec?.toLowerCase().includes('flac') ? 'LOSSLESS' : metadata.codec?.toLowerCase().includes('aac') ? 'MODERN' : 'STANDARD'}</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(6, 214, 160, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>ANALYSIS:</div>
              {metadata.bitrate && (
                <div>bitrate_class: {metadata.bitrate > 500000 ? 'LOSSLESS' : metadata.bitrate > 256000 ? 'HIGH' : metadata.bitrate > 128000 ? 'STANDARD' : 'BASIC'}</div>
              )}
              <div>channel_config: {(metadata.channels || 0) >= 6 ? 'SURROUND' : (metadata.channels || 0) === 2 ? 'STEREO' : 'MONO'}</div>
              <div>frequency_range: {(metadata.sampleRate || 0) >= 48000 ? 'EXTENDED' : 'STANDARD'}</div>
              {metadata.dynamicRange && (
                <div>dynamic_range: {metadata.dynamicRange > 20 ? 'EXCELLENT' : metadata.dynamicRange > 12 ? 'GOOD' : 'LIMITED'}</div>
              )}
            </div>

            <div>
              <div style={{ color: '#fbbf24', fontWeight: '600', letterSpacing: '0.5px' }}>RECOMMENDATIONS:</div>
              {qualityScore < 60 && <div>• Consider higher quality source</div>}
              {(metadata.sampleRate || 0) < 48000 && <div>• Upsampling recommended</div>}
              {(metadata.bitrate || 0) < 256000 && <div>• Higher bitrate suggested</div>}
              {metadata.channels === 1 && <div>• Stereo version preferred</div>}
              {qualityScore >= 80 && <div>• Audio quality is excellent</div>}
            </div>
          </div>
        );

      case 'metadata':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(248, 113, 113, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#f87171', fontWeight: '600', letterSpacing: '0.5px' }}>FILE_METADATA:</div>
              <div>title: {metadata.title || 'untitled'}</div>
              <div>artist: {metadata.artist || 'unknown'}</div>
              <div>album: {metadata.album || 'unknown'}</div>
              <div>year: {metadata.year || 'unknown'}</div>
              <div>genre: {metadata.genre || 'unknown'}</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(248, 113, 113, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>CONTAINER_INFO:</div>
              <div>format_name: {metadata.format}</div>
              <div>format_long: {metadata.format.toUpperCase()} Container</div>
              <div>has_metadata: {metadata.hasMetadata ? 'YES' : 'NO'}</div>
              <div>nb_streams: {metadata.streams?.length || 1}</div>
            </div>

            <div>
              <div style={{ color: '#ec4899', fontWeight: '600', letterSpacing: '0.5px' }}>CUSTOM_DATA:</div>
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

      case 'streams':
        return (
          <div style={sectionStyle}>
            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(96, 165, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_INFO:</div>
              <div>total_streams: {metadata.streams?.length || 1}</div>
              <div>audio_streams: 1</div>
              <div>data_streams: 0</div>
              <div>attachment_streams: 0</div>
            </div>

            <div style={{ marginBottom: '6px', borderBottom: '1px solid rgba(96, 165, 250, 0.3)', paddingBottom: '4px' }}>
              <div style={{ color: '#8b5cf6', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_0_AUDIO:</div>
              <div>codec: {metadata.codec || 'unknown'}</div>
              {metadata.sampleRate && <div>sample_rate: {metadata.sampleRate} Hz</div>}
              {metadata.channels && <div>channels: {metadata.channels}</div>}
              {metadata.bitrate && <div>bitrate: {Math.round(metadata.bitrate / 1000)} kbps</div>}
              <div>duration: {formatDuration(metadata.duration)}</div>
            </div>

            <div>
              <div style={{ color: '#ec4899', fontWeight: '600', letterSpacing: '0.5px' }}>STREAM_DETAILS:</div>
              {metadata.bitsPerSample && <div>bit_depth: {metadata.bitsPerSample} bits</div>}
              {metadata.channelLayout && <div>channel_layout: {metadata.channelLayout}</div>}
              <div>compression: {metadata.codec?.toLowerCase().includes('flac') ? 'LOSSLESS' : 'LOSSY'}</div>
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
        title='INFO_AUDIO_METADATA'
        hasAudioInput={true}
        hasOutput={false}
        onDataUpdate={onDataUpdate}
      >
        {/* Analysis Status */}
        <NodeField>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
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
                🎵 ANALYZING_AUDIO...
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
                color: '#ec4899',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                AUDIO_ANALYSIS_COMPLETE
              </div>
            ) : (
              <div style={{ 
                fontSize: '10px', 
                color: 'rgba(224, 242, 254, 0.6)',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                AWAITING_AUDIO_INPUT
              </div>
            )}
          </div>
        </NodeField>

        {/* Audio path display for debugging */}
        <NodeField>
          <div style={{
            fontSize: '8px',
            color: 'rgba(236, 72, 153, 0.7)',
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '4px',
            padding: '4px 6px',
            marginBottom: '8px',
            wordBreak: 'break-all'
          }}>
            DEBUG_PATH: {data.audioPath || '$ null'}
          </div>
        </NodeField>

        {/* Info Section Selector */}
        {metadata && (
          <NodeField>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
              marginBottom: '8px'
            }}>
              {infoSections.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setSelectedSection(key)}
                  style={{
                    background: selectedSection === key 
                      ? `rgba(${color === '#ec4899' ? '236, 72, 153' : 
                          color === '#8b5cf6' ? '139, 92, 246' :
                          color === '#fbbf24' ? '251, 191, 36' :
                          color === '#06d6a0' ? '6, 214, 160' :
                          color === '#f87171' ? '248, 113, 113' :
                          '96, 165, 250'}, 0.3)` 
                      : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${selectedSection === key ? color : 'rgba(236, 72, 153, 0.3)'}`,
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

        {/* Audio Information Display */}
        {metadata && (
          <NodeField>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
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
            disabled={isAnalyzing || !data.audioPath || data.audioPath === '$ null'}
            style={{ 
              width: '100%',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}
          >
            {isAnalyzing ? '[analyzing_audio...]' : '[refresh_audio_info]'}
          </NodeButton>
        </NodeField>

        <NodeInfo>
          probe: ffprobe | output: {selectedSection}_audio_display
        </NodeInfo>
      </BaseNode>
    </div>
  );
};

export default memo(InfoAudioNode);