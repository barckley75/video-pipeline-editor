// src/nodes/ConvertAudioNode.tsx
import React, { memo, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeLabel, NodeGlassySelect, NodeInfo, NodeField, NodeInput, NodeButton } from '../components/NodeUI';
import { save } from '@tauri-apps/plugin-dialog';

interface ConvertAudioData {
  format: string;
  quality: string;
  outputPath: string;
  // Audio-specific options
  sampleRate: string;
  bitrate: string;
  bitrateMode: 'auto' | 'custom' | 'vbr';
  customBitrate: string;
  vbrQuality: string;
  channels: string;
  codec: string;
  normalize: boolean;
  volumeGain: string;
  audioPath?: string;
  trimParams?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

interface ConvertAudioNodeProps {
  id: string;
  data: ConvertAudioData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<ConvertAudioData>) => void;
}

const ConvertAudioNode: React.FC<ConvertAudioNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    
    // Auto-select compatible codec for format
    let updates: Partial<ConvertAudioData> = { format: newFormat };
    
    if (newFormat === 'mp3') {
      updates.codec = 'mp3';
    } else if (newFormat === 'aac' || newFormat === 'm4a') {
      updates.codec = 'aac';
    } else if (newFormat === 'ogg') {
      updates.codec = 'vorbis';
    } else if (newFormat === 'flac') {
      updates.codec = 'flac';
    } else if (newFormat === 'wav') {
      updates.codec = 'pcm';
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
    onDataUpdate?.(id, { bitrateMode: e.target.value as 'auto' | 'custom' | 'vbr' });
  };

  const selectOutputPath = useCallback(async () => {
    try {
      const format = data?.format || 'mp3';
      const selected = await save({
        defaultPath: `converted_audio.${format}`,
        filters: [{
          name: 'Audio Files',
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

  const handleNormalizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataUpdate?.(id, { normalize: e.target.checked });
  };

  // Format time as HH:MM:SS
  const formatTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get estimated file size based on settings
  const getEstimatedBitrate = (): string => {
    if (data?.bitrateMode === 'custom' && data?.customBitrate) {
      return `${data.customBitrate} kbps`;
    }
    if (data?.bitrateMode === 'vbr') {
      return `VBR Q${data?.vbrQuality || '5'}`;
    }
    
    const format = data?.format || 'mp3';
    const quality = data?.quality || 'medium';
    
    const bitrateMap: Record<string, Record<string, string>> = {
      'mp3': { low: '128', medium: '192', high: '256', ultra: '320' },
      'aac': { low: '96', medium: '128', high: '192', ultra: '256' },
      'm4a': { low: '96', medium: '128', high: '192', ultra: '256' },
      'ogg': { low: '96', medium: '128', high: '192', ultra: '256' },
      'flac': { low: 'lossless', medium: 'lossless', high: 'lossless', ultra: 'lossless' },
      'wav': { low: '1411', medium: '1411', high: '1411', ultra: '1411' }
    };
    
    return format === 'flac' || format === 'wav' 
      ? bitrateMap[format]?.[quality] || 'lossless'
      : `${bitrateMap[format]?.[quality] || '192'} kbps`;
  };

  // Get compatible codecs for selected format
  const getCompatibleCodecs = (): Array<{value: string, label: string}> => {
    const format = data?.format || 'mp3';
    
    switch (format) {
      case 'mp3':
        return [
          { value: 'mp3', label: 'MP3 (LAME)' },
          { value: 'copy', label: 'Copy Original' }
        ];
      case 'aac':
      case 'm4a':
        return [
          { value: 'aac', label: 'AAC' },
          { value: 'copy', label: 'Copy Original' }
        ];
      case 'ogg':
        return [
          { value: 'vorbis', label: 'Vorbis' },
          { value: 'opus', label: 'Opus' },
          { value: 'copy', label: 'Copy Original' }
        ];
      case 'flac':
        return [
          { value: 'flac', label: 'FLAC' },
          { value: 'copy', label: 'Copy Original' }
        ];
      case 'wav':
        return [
          { value: 'pcm', label: 'PCM' },
          { value: 'copy', label: 'Copy Original' }
        ];
      default:
        return [
          { value: 'copy', label: 'Copy Original' }
        ];
    }
  };

  // Check if format supports quality settings
  const supportsQuality = (): boolean => {
    const format = data?.format || 'mp3';
    return !['flac', 'wav'].includes(format);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="processing_units"
      title='CONVERT_AUDIO'
      hasAudioInput={true}
      hasDataInput={true}
      hasAudioOutput={true}
      onDataUpdate={onDataUpdate}
    >
      <div className="nodrag">
        {/* Input audio info */}
        {data?.audioPath && (
          <NodeField>
            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '9px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#ec4899', fontWeight: '600', marginBottom: '2px' }}>
                AUDIO_INPUT:
              </div>
              <div style={{ color: 'rgba(224, 242, 254, 0.8)' }}>
                {data.audioPath.split('/').pop() || data.audioPath}
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

        {/* Output Format */}
        <NodeField>
          <NodeLabel>output_format:</NodeLabel>
          <NodeGlassySelect value={data?.format || 'mp3'} onChange={handleFormatChange}>
            <option value="mp3">MP3 (MPEG Audio)</option>
            <option value="aac">AAC (Advanced Audio)</option>
            <option value="m4a">M4A (iTunes AAC)</option>
            <option value="ogg">OGG (Vorbis/Opus)</option>
            <option value="flac">FLAC (Lossless)</option>
            <option value="wav">WAV (Uncompressed)</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Codec Selection */}
        <NodeField>
          <NodeLabel>codec:</NodeLabel>
          <NodeGlassySelect 
            value={data?.codec || 'mp3'} 
            onChange={(e) => onDataUpdate?.(id, { codec: e.target.value })}
          >
            {getCompatibleCodecs().map(codec => (
              <option key={codec.value} value={codec.value}>
                {codec.label}
              </option>
            ))}
          </NodeGlassySelect>
        </NodeField>

        {/* Sample Rate */}
        <NodeField>
          <NodeLabel>sample_rate:</NodeLabel>
          <NodeGlassySelect 
            value={data?.sampleRate || 'original'} 
            onChange={(e) => onDataUpdate?.(id, { sampleRate: e.target.value })}
          >
            <option value="original">original</option>
            <option value="22050">22.05 kHz</option>
            <option value="44100">44.1 kHz (CD)</option>
            <option value="48000">48 kHz (Studio)</option>
            <option value="96000">96 kHz (Hi-Res)</option>
            <option value="192000">192 kHz (Ultra)</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Channels */}
        <NodeField>
          <NodeLabel>channels:</NodeLabel>
          <NodeGlassySelect 
            value={data?.channels || 'original'} 
            onChange={(e) => onDataUpdate?.(id, { channels: e.target.value })}
          >
            <option value="original">original</option>
            <option value="1">Mono (1.0)</option>
            <option value="2">Stereo (2.0)</option>
            <option value="6">5.1 Surround</option>
            <option value="8">7.1 Surround</option>
          </NodeGlassySelect>
        </NodeField>

        {/* Bitrate Control - Only show for lossy formats */}
        {supportsQuality() && (
          <NodeField>
            <NodeLabel>bitrate_mode:</NodeLabel>
            <NodeGlassySelect 
              value={data?.bitrateMode || 'auto'} 
              onChange={handleBitrateModeChange}
            >
              <option value="auto">auto_quality</option>
              <option value="vbr">variable_bitrate</option>
              <option value="custom">constant_bitrate</option>
            </NodeGlassySelect>
            
            {data?.bitrateMode === 'custom' && (
              <div style={{ marginTop: '4px' }}>
                <NodeInput
                  type="number"
                  placeholder="kbps"
                  value={data?.customBitrate || ''}
                  onChange={(e) => onDataUpdate?.(id, { customBitrate: e.target.value })}
                  style={{ fontSize: '9px' }}
                />
              </div>
            )}
            
            {data?.bitrateMode === 'vbr' && (
              <div style={{ marginTop: '4px' }}>
                <NodeInput
                  type="number"
                  placeholder="Quality (0-10, higher=better)"
                  value={data?.vbrQuality || ''}
                  onChange={(e) => onDataUpdate?.(id, { vbrQuality: e.target.value })}
                  style={{ fontSize: '9px' }}
                  min="0"
                  max="10"
                />
              </div>
            )}
          </NodeField>
        )}

        {/* Quality Preset - Only show for lossy formats */}
        {supportsQuality() && (
          <NodeField>
            <NodeLabel>quality_preset:</NodeLabel>
            <NodeGlassySelect value={data?.quality || 'medium'} onChange={handleQualityChange}>
              <option value="low">low_fast</option>
              <option value="medium">medium_balanced</option>
              <option value="high">high_quality</option>
              <option value="ultra">ultra_high</option>
            </NodeGlassySelect>
          </NodeField>
        )}

        {/* Audio Processing */}
        <NodeField>
          <NodeLabel>audio_processing:</NodeLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <input
              type="checkbox"
              checked={data?.normalize || false}
              onChange={handleNormalizeChange}
              style={{
                width: '12px',
                height: '12px',
                accentColor: 'rgba(236, 72, 153, 0.8)'
              }}
            />
            <span style={{ fontSize: '10px', color: 'rgba(224, 242, 254, 0.8)' }}>
              normalize_audio
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', color: 'rgba(224, 242, 254, 0.6)' }}>gain:</span>
            <NodeInput
              type="number"
              placeholder="0.0"
              value={data?.volumeGain || ''}
              onChange={(e) => onDataUpdate?.(id, { volumeGain: e.target.value })}
              style={{ flex: 1, fontSize: '9px' }}
              step="0.1"
            />
            <span style={{ fontSize: '9px', color: 'rgba(224, 242, 254, 0.6)' }}>dB</span>
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
          format: {data?.format || 'mp3'} | quality: {getEstimatedBitrate()} | channels: {data?.channels || 'original'} | {data?.normalize ? 'normalized' : 'raw'}
        </NodeInfo>
      </div>
    </BaseNode>
  );
};

export default memo(ConvertAudioNode);