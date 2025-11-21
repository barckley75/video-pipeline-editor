// src/nodes/InputVideoNode.tsx
import React, { memo, useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeLabel, NodeInput, NodeButton, NodeInfo, NodeField } from '../components/NodeUI';
import { open } from '@tauri-apps/plugin-dialog';

interface InputVideoData {
  filePath: string;
}

interface InputVideoNodeProps {
  id: string;
  data: InputVideoData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<InputVideoData>) => void;
}

const InputVideoNode: React.FC<InputVideoNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  const selectFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Video Files',
          extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv', '3gp']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        console.log('Selected file:', selected);
        onDataUpdate?.(id, { filePath: selected });
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  }, [id, onDataUpdate]);

  // Helper function to extract filename from full path (without extension)
  const getFileName = (filePath: string): string => {
    if (!filePath || filePath === '$ null' || filePath.trim() === '') {
      return '$ null';
    }
    
    // Handle both Windows and Unix-style paths
    const fullFileName = filePath.split(/[/\\]/).pop() || filePath;
    
    // Remove extension from filename since we show it in the badge
    const lastDot = fullFileName.lastIndexOf('.');
    if (lastDot > 0) {
      return fullFileName.substring(0, lastDot);
    }
    
    return fullFileName;
  };

  // Helper function to get file extension
  const getFileExtension = (filePath: string): string => {
    if (!filePath || filePath === '$ null' || filePath.trim() === '') {
      return '';
    }
    
    const fullFileName = filePath.split(/[/\\]/).pop() || filePath;
    const lastDot = fullFileName.lastIndexOf('.');
    return lastDot > 0 ? fullFileName.substring(lastDot + 1).toUpperCase() : '';
  };

  const fileName = getFileName(data?.filePath || '');
  const fileExtension = getFileExtension(data?.filePath || '');

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="input"
      title='INPUT_VIDEO'
      hasOutput={true}
      onDataUpdate={onDataUpdate}
    >
      <NodeField>
        <NodeLabel>file_name:</NodeLabel>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <NodeInput
            type="text"
            value={fileName}
            readOnly
            style={{ 
              flex: 1,
              fontWeight: fileName !== '$ null' ? 'bold' : 'normal',
              color: fileName !== '$ null' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(156, 163, 175, 0.8)'
            }}
          />
          {fileExtension && (
            <div style={{
              padding: '6px 8px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'rgba(16, 185, 129, 0.9)',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {fileExtension}
            </div>
          )}
          <NodeButton onClick={selectFile}>
            [...]
          </NodeButton>
        </div>
      </NodeField>

      <NodeField>
        <NodeLabel>file_path:</NodeLabel>
        <NodeInput
          type="text"
          value={data?.filePath || '$ null'}
          readOnly
          style={{ 
            fontSize: '9px',
            color: 'rgba(156, 163, 175, 0.7)'
          }}
        />
      </NodeField>

      <NodeInfo>
        [MP4 | AVI | MOV | MKV | WEBM]
      </NodeInfo>
    </BaseNode>
  );
};

export default memo(InputVideoNode);