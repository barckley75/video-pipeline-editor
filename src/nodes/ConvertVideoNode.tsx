// src/nodes/ConvertVideoNode.tsx
import React, { memo, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeLabel, NodeGlassySelect, NodeInfo, NodeField, NodeInput, NodeButton } from '../components/NodeUI';
import { save } from '@tauri-apps/plugin-dialog';

interface ConvertVideoData {
  format: string;
  quality: string;
  outputPath: string;
  useGPU: boolean;
  gpuType: string;
  // Enhanced options
  bitrate: string;
  bitrateMode: 'auto' | 'custom' | 'crf';
  customBitrate: string;
  crfValue: string;
  resolution: string;
  customResolution: {
    width: string;
    height: string;
  };
  aspectRatio: string;
  framerate: string;
  audioCodec: string;
  audioBitrate: string;
  videoPath?: string;
  trimParams?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

interface ConvertVideoNodeProps {
  id: string;
  data: ConvertVideoData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<ConvertVideoData>) => void;
}

const ConvertVideoNode: React.FC<ConvertVideoNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    
    // 🔧 FIX: Auto-select compatible audio codec for WebM
    let updates: Partial<ConvertVideoData> = { format: newFormat };
    
    if (newFormat === 'webm') {
      // WebM only supports Vorbis or Opus - switch to Opus for better quality
      if (data?.audioCodec === 'aac' || data?.audioCodec === 'mp3' || !data?.audioCodec) {
        updates.audioCodec = 'opus';
        console.log('🌐 WebM selected: switching audio codec to Opus');
      }
    } else if (newFormat === 'mp4' && (data?.audioCodec === 'opus' || data?.audioCodec === 'vorbis')) {
      // Switch back to AAC for MP4 if coming from WebM codecs
      updates.audioCodec = 'aac';
      console.log('📦 MP4 selected: switching audio codec to AAC');
    }
    
    onDataUpdate?.(id, updates);
    
    // Auto-update output path extension if path exists
    if (data?.outputPath && data.outputPath !== '$ auto_generate') {
      const pathWithoutExt = data.outputPath.replace(/\.[^/.]+$/, '');
      onDataUpdate?.(id, { outputPath: `${pathWithoutExt}.${newFormat}` });
    }
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { quality: e.target.value });
  };

  const handleBitrateModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { bitrateMode: e.target.value as 'auto' | 'custom' | 'crf' });
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resolution = e.target.value;
    onDataUpdate?.(id, { resolution });
    
    // Auto-fill custom resolution fields for common presets
    if (resolution === 'custom') return;
    
    const resolutionMap: Record<string, { width: string; height: string }> = {
      '480p': { width: '854', height: '480' },
      '720p': { width: '1280', height: '720' },
      '1080p': { width: '1920', height: '1080' },
      '1440p': { width: '2560', height: '1440' },
      '4k': { width: '3840', height: '2160' },
      'original': { width: '', height: '' }
    };
    
    if (resolutionMap[resolution]) {
      onDataUpdate?.(id, { 
        customResolution: resolutionMap[resolution]
      });
    }
  };

  const selectOutputPath = useCallback(async () => {
    try {
      const format = data?.format || 'mp4';
      const selected = await save({
        defaultPath: `converted_video.${format}`,
        filters: [{
          name: 'Video Files',
          extensions: [format]
        }]
      });
      
      if (selected) {
        console.log('Selected output path:', selected);
        onDataUpdate?.(id, { outputPath: selected });
      }
    } catch (error) {
      console.error('Error selecting output path:', error);
    }
  }, [id, onDataUpdate, data?.format]);

  const openOutputFolder = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      if (data?.outputPath && data.outputPath !== '') {
        const outputDir = data.outputPath.includes('/') || data.outputPath.includes('\\')
          ? data.outputPath.substring(0, Math.max(
              data.outputPath.lastIndexOf('/'),
              data.outputPath.lastIndexOf('\\')
            ))
          : '.';
        
        await invoke('open_specific_folder', { path: outputDir });
      } else {
        await invoke('open_output_folder');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  }, [data?.outputPath]);

  const handleGPUChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataUpdate?.(id, { useGPU: e.target.checked });
  };

  const handleGPUTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { gpuType: e.target.value });
  };

  // Format time as HH:MM:SS
  const formatTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get estimated bitrate based on resolution and quality
  const getEstimatedBitrate = (): string => {
    if (data?.bitrateMode === 'custom' && data?.customBitrate) {
      return `${data.customBitrate} Mbps`;
    }
    if (data?.bitrateMode === 'crf') {
      return `CRF ${data?.crfValue || '23'}`;
    }
    
    const resolution = data?.resolution || '1080p';
    const quality = data?.quality || 'medium';
    
    const bitrateMap: Record<string, Record<string, string>> = {
      '480p': { low: '1', medium: '2.5', high: '4', ultra: '6' },
      '720p': { low: '2.5', medium: '5', high: '7.5', ultra: '10' },
      '1080p': { low: '4', medium: '8', high: '12', ultra: '16' },
      '1440p': { low: '8', medium: '16', high: '24', ultra: '32' },
      '4k': { low: '15', medium: '25', high: '45', ultra: '65' }
    };
    
    return `~${bitrateMap[resolution]?.[quality] || '8'} Mbps`;
  };

  // Get compatible audio codecs for selected format
  const getCompatibleAudioCodecs = (): Array<{value: string, label: string}> => {
    const format = data?.format || 'mp4';
    
    switch (format) {
      case 'webm':
        return [
          { value: 'opus', label: 'Opus (recommended)' },
          { value: 'vorbis', label: 'Vorbis' },
          { value: 'copy', label: 'Copy Original' },
          { value: 'none', label: 'No Audio' }
        ];
      case 'mp4':
      case 'mov':
      case 'mkv':
      case 'avi':
      default:
        return [
          { value: 'aac', label: 'AAC (recommended)' },
          { value: 'mp3', label: 'MP3' },
          { value: 'opus', label: 'Opus' },
          { value: 'copy', label: 'Copy Original' },
          { value: 'none', label: 'No Audio' }
        ];
    }
  };

  // Get GPU compatibility warning
  const getGPUWarning = (): string | null => {
    if (data?.useGPU && data?.format === 'webm') {
      return 'GPU acceleration not available for WebM/VP9';
    }
    return null;
  };

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="processing_units"
      title='CONVERT_VIDEO'
      hasInput={true}
      hasDataInput={true}
      hasOutput={true}
      hasDataOutput={false}
      onDataUpdate={onDataUpdate}
    >
      <div className="nodrag">
        {/* Input video info */}
        {data?.videoPath && (
          <NodeField>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '9px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#60a5fa', fontWeight: '600', marginBottom: '2px' }}>
                VIDEO_INPUT:
              </div>
              <div style={{ color: 'rgba(224, 242, 254, 0.8)' }}>
                {data.videoPath.split('/').pop() || data.videoPath}
              </div>
            </div>
          </NodeField>
        )}

        {/* Trim info */}
        {data?.trimParams && (
          <NodeField>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '9px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#34d399', fontWeight: '600', marginBottom: '2px' }}>
                TRIM_APPLIED:
              </div>
              <div>
                {formatTimecode(data.trimParams.startTime)} → {formatTimecode(data.trimParams.endTime)}
              </div>
              <div style={{ color: 'rgba(224, 242, 254, 0.7)' }}>
                duration: {formatTimecode(data.trimParams.endTime - data.trimParams.startTime)}
              </div>
            </div>
          </NodeField>
        )}

        {/* Hardware Acceleration */}
        <NodeField>
          <NodeLabel>hardware_accel:</NodeLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <input
              type="checkbox"
              checked={data?.useGPU || false}
              onChange={handleGPUChange}
              style={{
                width: '12px',
                height: '12px',
                accentColor: 'rgba(59, 130, 246, 0.8)'
              }}
            />
            <span style={{ fontSize: '10px', color: 'rgba(224, 242, 254, 0.8)' }}>
              use_gpu_acceleration
            </span>
          </div>
          {data?.useGPU && (
            <NodeGlassySelect value={data?.gpuType || 'auto'} onChange={handleGPUTypeChange}>
              <option value="auto">auto_detect</option>
              <option value="nvenc">nvidia_nvenc</option>
              <option value="qsv">intel_quicksync</option>
              <option value="videotoolbox">apple_videotoolbox</option>
              <option value="vaapi">linux_vaapi</option>
            </NodeGlassySelect>
          )}
          {/* GPU Warning */}
          {getGPUWarning() && (
            <div style={{
              marginTop: '4px',
              fontSize: '8px',
              color: '#fbbf24',
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '2px 4px',
              borderRadius: '3px'
            }}>
              ⚠️ {getGPUWarning()}
            </div>
          )}
        </NodeField>

        {/* Output Format */}
        <NodeField>
          <NodeLabel>output_format:</NodeLabel>
          <NodeGlassySelect value={data?.format || 'mp4'} onChange={handleFormatChange}>
            <option value="mp4">mp4 (H264/AAC)</option>
            <option value="webm">webm (VP9/Opus)</option>
            <option value="avi">avi</option>
            <option value="mov">mov</option>
            <option value="mkv">mkv</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Resolution */}
        <NodeField>
          <NodeLabel>resolution:</NodeLabel>
          <NodeGlassySelect value={data?.resolution || '1080p'} onChange={handleResolutionChange}>
            <option value="original">original</option>
            <option value="480p">480p (854×480)</option>
            <option value="720p">720p (1280×720)</option>
            <option value="1080p">1080p (1920×1080)</option>
            <option value="1440p">1440p (2560×1440)</option>
            <option value="4k">4K (3840×2160)</option>
            <option value="custom">custom</option>
          </NodeGlassySelect>
          
          {data?.resolution === 'custom' && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <NodeInput
                type="number"
                placeholder="width"
                value={data?.customResolution?.width || ''}
                onChange={(e) => onDataUpdate?.(id, { 
                  customResolution: { 
                    ...data?.customResolution, 
                    width: e.target.value 
                  } 
                })}
                style={{ flex: 1, fontSize: '9px' }}
              />
              <span style={{ color: 'rgba(224, 242, 254, 0.6)', fontSize: '10px', alignSelf: 'center' }}>×</span>
              <NodeInput
                type="number"
                placeholder="height"
                value={data?.customResolution?.height || ''}
                onChange={(e) => onDataUpdate?.(id, { 
                  customResolution: { 
                    ...data?.customResolution, 
                    height: e.target.value 
                  } 
                })}
                style={{ flex: 1, fontSize: '9px' }}
              />
            </div>
          )}
        </NodeField>

        {/* Bitrate Control */}
        <NodeField>
          <NodeLabel>bitrate_mode:</NodeLabel>
          <NodeGlassySelect 
            value={data?.bitrateMode || 'auto'} 
            onChange={handleBitrateModeChange}
          >
            <option value="auto">auto_quality</option>
            <option value="crf">constant_quality</option>
            <option value="custom">custom_bitrate</option>
          </NodeGlassySelect>
          
          {data?.bitrateMode === 'custom' && (
            <div style={{ marginTop: '4px' }}>
              <NodeInput
                type="number"
                placeholder="Mbps"
                value={data?.customBitrate || ''}
                onChange={(e) => onDataUpdate?.(id, { customBitrate: e.target.value })}
                style={{ fontSize: '9px' }}
              />
            </div>
          )}
          
          {data?.bitrateMode === 'crf' && (
            <div style={{ marginTop: '4px' }}>
              <NodeInput
                type="number"
                placeholder="CRF (0-51, lower=better)"
                value={data?.crfValue || ''}
                onChange={(e) => onDataUpdate?.(id, { crfValue: e.target.value })}
                style={{ fontSize: '9px' }}
                min="0"
                max="51"
              />
            </div>
          )}
        </NodeField>

        {/* Quality Preset */}
        <NodeField>
          <NodeLabel>quality_preset:</NodeLabel>
          <NodeGlassySelect value={data?.quality || 'medium'} onChange={handleQualityChange}>
            <option value="low">low_fast</option>
            <option value="medium">medium_balanced</option>
            <option value="high">high_quality</option>
            <option value="ultra">ultra_slow</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Frame Rate */}
        <NodeField>
          <NodeLabel>framerate:</NodeLabel>
          <NodeGlassySelect 
            value={data?.framerate || 'original'} 
            onChange={(e) => onDataUpdate?.(id, { framerate: e.target.value })}
          >
            <option value="original">original</option>
            <option value="23.976">23.976fps</option>
            <option value="24">24fps</option>
            <option value="25">25fps</option>
            <option value="29.97">29.97fps</option>
            <option value="30">30fps</option>
            <option value="50">50fps</option>
            <option value="59.94">59.94fps</option>
            <option value="60">60fps</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Audio Settings - 🔧 FIXED: Format-specific codec options */}
        <NodeField>
          <NodeLabel>audio_codec:</NodeLabel>
          <div style={{ display: 'flex', gap: '4px' }}>
            <NodeGlassySelect 
              value={data?.audioCodec || (data?.format === 'webm' ? 'opus' : 'aac')} 
              onChange={(e) => onDataUpdate?.(id, { audioCodec: e.target.value })}
            >
              {getCompatibleAudioCodecs().map(codec => (
                <option key={codec.value} value={codec.value}>
                  {codec.label}
                </option>
              ))}
            </NodeGlassySelect>
            <NodeGlassySelect 
              value={data?.audioBitrate || '128'} 
              onChange={(e) => onDataUpdate?.(id, { audioBitrate: e.target.value })}
            >
              <option value="96">96k</option>
              <option value="128">128k</option>
              <option value="192">192k</option>
              <option value="256">256k</option>
              <option value="320">320k</option>
            </NodeGlassySelect>
          </div>
        </NodeField>

        {/* Output Path */}
        <NodeField>
          <NodeLabel>output_path:</NodeLabel>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <NodeInput
              type="text"
              value={data?.outputPath || ''}
              placeholder="Select output file..."
              readOnly
              style={{ flex: 1, fontSize: '9px' }}
            />
            <NodeButton onClick={selectOutputPath} style={{ fontSize: '9px', padding: '4px 8px' }}>
              [...]
            </NodeButton>
          </div>
          <NodeButton 
            onClick={openOutputFolder} 
            disabled={!data?.outputPath || data.outputPath === ''}
            style={{
              color:'#fff',
              width: '100%', 
              fontSize: '9px', 
              padding: '4px 8px',
              background: (!data?.outputPath || data.outputPath === '') 
                ? 'rgba(107, 114, 128, 0.3)'
                : 'rgba(34, 197, 94, 0.2)',
              borderColor: (!data?.outputPath || data.outputPath === '') 
                ? 'rgba(107, 114, 128, 0.5)'
                : 'rgba(34, 197, 94, 0.4)',
              cursor: (!data?.outputPath || data.outputPath === '') 
                ? 'not-allowed' 
                : 'pointer'
            }}
          >
            [open_folder]
          </NodeButton>
        </NodeField>

        {/* Info Display */}
        <NodeInfo>
          codec: {data?.useGPU ? 'hw_accelerated' : 'software'} | bitrate: {getEstimatedBitrate()} | audio: {data?.audioCodec || (data?.format === 'webm' ? 'opus' : 'aac')}
        </NodeInfo>
      </div>
    </BaseNode>
  );
};

export default memo(ConvertVideoNode);