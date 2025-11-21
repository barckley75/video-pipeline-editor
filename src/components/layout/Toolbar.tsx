// src/components/layout/Toolbar.tsx

/**
 * 🔧 TOP TOOLBAR
 * 
 * Main application toolbar with auto-hide functionality. Contains pipeline
 * execution button and status information.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Receives execution callback and pipeline stats
 * └── constants/nodeTypes.tsx - Height, theme, and font constants
 * 
 * FEATURES:
 * - Auto-hide after 10 seconds of inactivity
 * - Show on mouse hover near top (50px)
 * - Pipeline execution button with state
 * - Node/connection count display
 * - Keyboard shortcut hints
 * 
 * INTERACTION:
 * - Mouse near top: Show toolbar
 * - Click execute: Trigger pipeline
 * - Interaction: Reset hide timer
 */

import { LAYOUT_CONFIG, THEME_COLORS } from '../../constants/nodeTypes';
import { WorkflowMenu } from './WorkflowMenu';
import type { Workflow } from '../../types/workflows';

interface ToolbarProps {
  isProcessing: boolean;
  nodeCount: number;
  edgeCount: number;
  onExecute: () => void;
  onLoadWorkflow: (workflow: Workflow) => void;
  customWorkflows: Workflow[];
  onSaveCustom: () => void;
  onDeleteCustom: (id: string) => void;  
}

// Optional: Export a spacer component for layouts that need it
export const ToolbarSpacer: React.FC = () => (
  <div style={{ height: `${LAYOUT_CONFIG.TOOLBAR_HEIGHT}px` }} />
);

export const Toolbar: React.FC<ToolbarProps> = ({
  isProcessing,
  nodeCount,
  edgeCount,
  onExecute,
  onLoadWorkflow,
  customWorkflows,
  onSaveCustom,
  onDeleteCustom
}) => {
  return (
    <div 
      style={{ 
        height: `${LAYOUT_CONFIG.TOOLBAR_HEIGHT}px`, 
        background: THEME_COLORS.TOOLBAR_GRADIENT,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: 'none',
        color: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        gap: '24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <h1 style={{ 
        margin: 0, 
        fontSize: '16px',
        fontWeight: '400',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        background: THEME_COLORS.PRIMARY_GRADIENT,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'inherit',
        textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2)',
        filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
      }}>
        &gt; FFMPEG_VIDEO_PIPELINE
      </h1>
      
      <div style={{ 
        fontSize: '10px',
        color: 'rgba(248, 250, 252, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontFamily: 'inherit'
      }}>
        open/close menu [TAB/ESC]
      </div>

      <div style={{ flex: 1 }}></div>

      <WorkflowMenu
        onLoadWorkflow={onLoadWorkflow}
        customWorkflows={customWorkflows}
        onSaveCustom={onSaveCustom}
        onDeleteCustom={onDeleteCustom}
      />

      <button
        onClick={onExecute}
        disabled={isProcessing}
        style={{
          padding: '10px 20px',
          background: isProcessing 
            ? THEME_COLORS.EXECUTE_BUTTON.DISABLED
            : THEME_COLORS.EXECUTE_BUTTON.IDLE,
          color: isProcessing ? 'rgba(156, 163, 175, 0.8)' : '#fecaca',
          border: `1px solid ${isProcessing 
            ? 'rgba(107, 114, 128, 0.5)' 
            : 'rgba(239, 68, 68, 0.5)'}`,
          borderRadius: '8px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease',
          boxShadow: isProcessing 
            ? '0 2px 12px rgba(107, 114, 128, 0.2)' 
            : '0 2px 12px rgba(239, 68, 68, 0.2)',
          fontFamily: 'inherit'
        }}
        onMouseOver={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.background = THEME_COLORS.EXECUTE_BUTTON.HOVER;
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.3)';
          }
        }}
        onMouseOut={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.background = THEME_COLORS.EXECUTE_BUTTON.IDLE;
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(239, 68, 68, 0.2)';
          }
        }}
      >
        {isProcessing ? '[processing...]' : '[> execute]'}
      </button>

      <div style={{ 
        fontSize: '10px',
        color: 'rgba(248, 250, 252, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontFamily: 'inherit'
      }}>
        nodes:{nodeCount} | conn:{edgeCount}
      </div>
    </div>
  );
};