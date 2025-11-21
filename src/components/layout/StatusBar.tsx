// src/components/layout/StatusBar.tsx

/**
 * 📊 BOTTOM STATUS BAR
 * 
 * Minimal status indicator showing pipeline execution state.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Receives isProcessing state
 * └── constants/nodeTypes.tsx - Height configuration
 * 
 * DISPLAYS:
 * - System status: "idle" or "executing..."
 * - FFmpeg settings button
 */

import React from 'react';
import { LAYOUT_CONFIG } from '../../constants/nodeTypes';

interface StatusBarProps {
  isProcessing: boolean;
  onOpenSettings?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isProcessing, onOpenSettings }) => {
  return (
    <div style={{
      height: `${LAYOUT_CONFIG.STATUS_BAR_HEIGHT}px`,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderBottom: 'none',
      color: 'rgba(148, 163, 184, 0.8)',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '16px',
      paddingRight: '16px',
      letterSpacing: '0.5px',
      fontFamily: 'inherit'
    }}>
      <span>
        $ system_ready | pipeline_status: {isProcessing ? 'executing...' : 'idle'}
      </span>
      
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          title="FFmpeg Settings (Ctrl/Cmd + ,)"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(148, 163, 184, 0.9)',
            fontSize: '10px',
            padding: '4px 12px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            fontFamily: 'inherit',
            borderRadius: '2px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m5.66-13.66l-4.24 4.24m-2.83 2.83l-4.24 4.24M23 12h-6m-6 0H1m16.66 5.66l-4.24-4.24m-2.83-2.83l-4.24-4.24" />
          </svg>
          <span>ffmpeg_config</span>
        </button>
      )}
    </div>
  );
};