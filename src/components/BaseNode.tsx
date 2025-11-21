// src/components/BaseNode.tsx

/**
 * 🧩 BASE NODE COMPONENT
 * 
 * Reusable foundation for all node types. Provides consistent styling, theming,
 * and handle management (video/audio/data inputs and outputs).
 * 
 * USED BY:
 * ├── nodes/InputVideoNode.tsx
 * ├── nodes/InputAudioNode.tsx
 * ├── nodes/ConvertVideoNode.tsx
 * ├── nodes/ConvertAudioNode.tsx
 * ├── nodes/ViewVideoNode.tsx
 * ├── nodes/InfoVideoNode.tsx
 * ├── nodes/InfoAudioNode.tsx
 * ├── nodes/TrimVideoNode.tsx
 * ├── nodes/TrimAudioNode.tsx
 * ├── nodes/SequenceExtractNode.tsx
 * ├── nodes/GridViewNode.tsx
 * ├── nodes/VmafAnalysisNode.tsx
 * └── nodes/SpectrumAnalyzerNode.tsx
 * 
 * FEATURES:
 * - Color-coded handles (orange=video, pink=audio, green=data)
 * - Automatic handle positioning for multiple inputs/outputs
 * - Theme system (NODE_THEMES) for visual consistency
 * - Custom handle support for specialized nodes
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// Theme definitions
export const NODE_THEMES = {
  input: {
    primary: 'rgba(16, 185, 129, 0.6)',
    background: 'rgba(16, 185, 129, 0.1)',
    glow: 'rgba(16, 185, 129, 0.2)'
  },
  processing_units: {
    primary: 'rgba(59, 130, 246, 0.6)',
    background: 'rgba(59, 130, 246, 0.1)',
    glow: 'rgba(59, 130, 246, 0.2)'
  },
  output_dysplays: {
    primary: 'rgba(168, 85, 247, 0.6)',
    background: 'rgba(168, 85, 247, 0.1)',
    glow: 'rgba(168, 85, 247, 0.2)'
  },
  analysis_tools: {
    primary: 'rgba(245, 101, 101, 0.6)',
    background: 'rgba(245, 101, 101, 0.1)',
    glow: 'rgba(245, 101, 101, 0.2)'
  },
  info: {
    primary: 'rgba(245, 101, 101, 0.6)',
    background: 'rgba(245, 101, 101, 0.1)',
    glow: 'rgba(245, 101, 101, 0.2)'
  },
  sequence: {
    primary: 'rgba(251, 191, 36, 0.6)',
    background: 'rgba(251, 191, 36, 0.1)',
    glow: 'rgba(251, 191, 36, 0.2)'
  },
  trim: {
    primary: 'rgba(251, 191, 36, 0.6)',
    background: 'rgba(251, 191, 36, 0.1)',
    glow: 'rgba(251, 191, 36, 0.2)'
  }
};

interface BaseNodeProps {
  id: string;
  data: any;
  isConnectable: boolean;
  theme: keyof typeof NODE_THEMES;
  title: string;
  children: React.ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  hasDataInput?: boolean;
  hasDataOutput?: boolean;
  hasAudioInput?: boolean;
  hasAudioOutput?: boolean;
  customHandles?: boolean;
  onDataUpdate?: (nodeId: string, newData: any) => void;
}

const BaseNode: React.FC<BaseNodeProps> = ({ 
  isConnectable,
  theme,
  title,
  children, 
  hasInput = false,
  hasOutput = false,
  hasDataInput = false,
  hasDataOutput = false,
  hasAudioInput = false,
  hasAudioOutput = false,
  customHandles = false,
}) => {
  const nodeTheme = NODE_THEMES[theme];

  const baseStyles = {
    container: {
      padding: '16px',
      border: `1px solid ${nodeTheme.primary}`,
      borderRadius: '12px',
      background: nodeTheme.background,
      backdropFilter: 'blur(8px)',
      color: '#e0f2fe',
      minWidth: '220px',
      fontSize: '14px',
      boxShadow: `0 4px 24px ${nodeTheme.glow}`,
      transition: 'all 0.3s ease',
      fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      position: 'relative' as const,
    },
    header: {
      fontWeight: '600',
      marginBottom: '12px',
      padding: '8px 12px',
      background: `${nodeTheme.primary.replace('0.6', '0.2')}`,
      backdropFilter: 'blur(4px)',
      border: `1px solid ${nodeTheme.primary.replace('0.6', '0.3')}`,
      borderRadius: '8px',
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      fontFamily: 'inherit'
    },
    // Standardized handle styles
    inputVideoHandle: {
      background: 'rgba(249, 115, 22, 0.8)', // Orange for video input
      border: '2px solid rgba(249, 115, 22, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
      transition: 'all 0.2s ease'
    },
    outputVideoHandle: {
      background: 'rgba(249, 115, 22, 0.8)', // Orange for video output
      border: '2px solid rgba(249, 115, 22, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
      transition: 'all 0.2s ease'
    },
    inputDataHandle: {
      background: 'rgba(34, 197, 94, 0.8)', // Green for data input (trim params, etc)
      border: '2px solid rgba(34, 197, 94, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
      transition: 'all 0.2s ease'
    },
    outputDataHandle: {
      background: 'rgba(34, 197, 94, 0.8)', // Green for data output
      border: '2px solid rgba(34, 197, 94, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
      transition: 'all 0.2s ease'
    },
    // NEW: Audio handle styles
    inputAudioHandle: {
      background: 'rgba(236, 72, 153, 0.8)', // Pink for audio input
      border: '2px solid rgba(236, 72, 153, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(236, 72, 153, 0.4)',
      transition: 'all 0.2s ease'
    },
    outputAudioHandle: {
      background: 'rgba(236, 72, 153, 0.8)', // Pink for audio output
      border: '2px solid rgba(236, 72, 153, 0.6)',
      width: '14px',
      height: '14px',
      boxShadow: '0 0 12px rgba(236, 72, 153, 0.4)',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={baseStyles.container}>
      {/* Only render handles if not using custom handles */}
      {!customHandles && (
        <>
          {/* Input Handles */}
          {hasInput && (
            <Handle
              type="target"
              position={Position.Left}
              id="video-input"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.inputVideoHandle,
                top: getInputHandlePosition('video', { hasInput, hasAudioInput, hasDataInput })
              }}
            />
          )}

          {hasAudioInput && (
            <Handle
              type="target"
              position={Position.Left}
              id="audio-input"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.inputAudioHandle,
                top: getInputHandlePosition('audio', { hasInput, hasAudioInput, hasDataInput })
              }}
            />
          )}

          {hasDataInput && (
            <Handle
              type="target"
              position={Position.Left}
              id="data-input"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.inputDataHandle,
                top: getInputHandlePosition('data', { hasInput, hasAudioInput, hasDataInput })
              }}
            />
          )}

          {/* Output Handles */}
          {hasOutput && (
            <Handle
              type="source"
              position={Position.Right}
              id="video-output"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.outputVideoHandle,
                top: getOutputHandlePosition('video', { hasOutput, hasAudioOutput, hasDataOutput })
              }}
            />
          )}

          {hasAudioOutput && (
            <Handle
              type="source"
              position={Position.Right}
              id="audio-output"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.outputAudioHandle,
                top: getOutputHandlePosition('audio', { hasOutput, hasAudioOutput, hasDataOutput })
              }}
            />
          )}

          {hasDataOutput && (
            <Handle
              type="source"
              position={Position.Right}
              id="data-output"
              isConnectable={isConnectable}
              style={{
                ...baseStyles.outputDataHandle,
                top: getOutputHandlePosition('data', { hasOutput, hasAudioOutput, hasDataOutput })
              }}
            />
          )}
        </>
      )}

      {/* Header */}
      <div style={baseStyles.header}>
        &gt; {title || 'NODE'}
      </div>

      {/* Content */}
      <div style={{ marginBottom: '12px' }}>
        {children}
      </div>
    </div>
  );
};

// Helper functions to calculate handle positions when multiple handles are present
function getInputHandlePosition(
  handleType: 'video' | 'audio' | 'data', 
  hasHandles: { hasInput?: boolean; hasAudioInput?: boolean; hasDataInput?: boolean }
): string {
  const activeHandles = [
    hasHandles.hasInput && 'video',
    hasHandles.hasAudioInput && 'audio', 
    hasHandles.hasDataInput && 'data'
  ].filter(Boolean);
  
  const handleIndex = activeHandles.indexOf(handleType);
  const totalHandles = activeHandles.length;
  
  if (totalHandles === 1) return '50%';
  if (totalHandles === 2) return handleIndex === 0 ? '35%' : '65%';
  if (totalHandles === 3) return ['25%', '50%', '75%'][handleIndex] || '50%';
  
  return '50%';
}

function getOutputHandlePosition(
  handleType: 'video' | 'audio' | 'data', 
  hasHandles: { hasOutput?: boolean; hasAudioOutput?: boolean; hasDataOutput?: boolean }
): string {
  const activeHandles = [
    hasHandles.hasOutput && 'video',
    hasHandles.hasAudioOutput && 'audio',
    hasHandles.hasDataOutput && 'data'
  ].filter(Boolean);
  
  const handleIndex = activeHandles.indexOf(handleType);
  const totalHandles = activeHandles.length;
  
  if (totalHandles === 1) return '50%';
  if (totalHandles === 2) return handleIndex === 0 ? '35%' : '65%';
  if (totalHandles === 3) return ['25%', '50%', '75%'][handleIndex] || '50%';
  
  return '50%';
}

export default memo(BaseNode);