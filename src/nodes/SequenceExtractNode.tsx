// src/nodes/SequenceExtractNode.tsx
import React, { memo, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeLabel, NodeGlassySelect, NodeInfo, NodeField, NodeInput, NodeButton } from '../components/NodeUI';
import { save } from '@tauri-apps/plugin-dialog';

interface SequenceExtractData {
  format: string;
  compression: string;
  size: string;
  outputPath: string;
  fps: string;
  quality: string;
  videoPath?: string;
  trimParams?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

interface SequenceExtractNodeProps {
  id: string;
  data: SequenceExtractData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<SequenceExtractData>) => void;
}

const SequenceExtractNode: React.FC<SequenceExtractNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    onDataUpdate?.(id, { format: newFormat });
    
    // Auto-update output path extension if path exists
    if (data?.outputPath && data.outputPath !== '$ auto_generate') {
      const pathWithoutExt = data.outputPath.replace(/\/[^/]*$/, '');
      onDataUpdate?.(id, { outputPath: `${pathWithoutExt}/frame_%04d.${newFormat}` });
    }
  };

  const handleCompressionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { compression: e.target.value });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { size: e.target.value });
  };

  const handleFpsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { fps: e.target.value });
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { quality: e.target.value });
  };

  const selectOutputPath = useCallback(async () => {
    try {
      const format = data?.format || 'png';
      const selected = await save({
        defaultPath: `frames/frame_%04d.${format}`,
        filters: [{
          name: 'Image Sequence',
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
        // Extract directory from the output path pattern
        const outputDir = data.outputPath.includes('/') 
          ? data.outputPath.substring(0, data.outputPath.lastIndexOf('/'))
          : '.';
        
        // Open the folder
        await invoke('open_specific_folder', { path: outputDir });
      } else {
        // If no path set, open current directory
        await invoke('open_output_folder');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  }, [data?.outputPath]);

  // Format time as HH:MM:SS
  const formatTimecode = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="processing_units"
      title='SEQUENCE_FRAMES_EXTRACTOR'
      hasInput={true}       // Video input
      hasDataInput={true}   // Trim params input from Trim node
      hasOutput={false}     // No video output (endpoint node)
      hasDataOutput={false} // No data output
      onDataUpdate={onDataUpdate}
    >
      {/* Wrap all interactive content in nodrag class */}
      <div className="nodrag">
        {/* Show trim info if available */}
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
                frames from: {formatTimecode(data.trimParams.endTime - data.trimParams.startTime)}
              </div>
            </div>
          </NodeField>
        )}

        <NodeField>
          <NodeLabel>image_format:</NodeLabel>
          <NodeGlassySelect value={data?.format || 'png'} onChange={handleFormatChange}>
            <option value="png">png</option>
            <option value="jpg">jpg</option>
            <option value="jpeg">jpeg</option>
            <option value="tiff">tiff</option>
            <option value="bmp">bmp</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>compression:</NodeLabel>
          <NodeGlassySelect value={data?.compression || 'medium'} onChange={handleCompressionChange}>
            <option value="none">none_lossless</option>
            <option value="low">low_compression</option>
            <option value="medium">medium_balance</option>
            <option value="high">high_compression</option>
            <option value="maximum">maximum_size</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>output_size:</NodeLabel>
          <NodeGlassySelect value={data?.size || 'original'} onChange={handleSizeChange}>
            <option value="original">original_size</option>
            <option value="4k">4k_3840x2160</option>
            <option value="1080p">1080p_1920x1080</option>
            <option value="720p">720p_1280x720</option>
            <option value="480p">480p_854x480</option>
            <option value="custom">custom_size</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>frame_rate:</NodeLabel>
          <NodeGlassySelect value={data?.fps || 'original'} onChange={handleFpsChange}>
            <option value="original">original_fps</option>
            <option value="1">1_fps</option>
            <option value="2">2_fps</option>
            <option value="5">5_fps</option>
            <option value="10">10_fps</option>
            <option value="15">15_fps</option>
            <option value="24">24_fps</option>
            <option value="30">30_fps</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>quality_level:</NodeLabel>
          <NodeGlassySelect value={data?.quality || 'high'} onChange={handleQualityChange}>
            <option value="low">low_fast</option>
            <option value="medium">medium_balanced</option>
            <option value="high">high_quality</option>
            <option value="ultra">ultra_detailed</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>output_path:</NodeLabel>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <NodeInput
              type="text"
              value={data?.outputPath || ''}
              placeholder="Select output directory..."
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

        <NodeInfo>
          extract: frame_sequence | format: {data?.format || 'png'} | compression: {data?.compression || 'medium'}
        </NodeInfo>
      </div>
    </BaseNode>
  );
};

export default memo(SequenceExtractNode);