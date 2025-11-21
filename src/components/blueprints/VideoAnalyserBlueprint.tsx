// src/components/blueprints/VideoAnalyserBlueprint.tsx
import React from 'react';

interface VideoAnalyserBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const VideoAnalyserBlueprint: React.FC<VideoAnalyserBlueprintProps> = ({ 
  width = 520, 
  height = 420, 
  scale = 1 
}) => {
  const nodeWidth = 220 * scale; // Matches standard BaseNode width
  const nodeHeight = 160 * scale; // Simpler, compact height
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 40 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(0, 20, 40, 0.9)',
        border: '1px solid rgba(245, 101, 101, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="grid-analyser" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(245, 101, 101, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Info gradient - red theme matching actual node */}
        <linearGradient id="analyserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(245, 101, 101, 0.1)" />
          <stop offset="100%" stopColor="rgba(220, 38, 127, 0.05)" />
        </linearGradient>

        {/* Simple data pattern */}
        <pattern id="data-simple" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(0, 0, 0, 0.4)"/>
          <rect width="1" height="1" fill="rgba(245, 101, 101, 0.2)"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid-analyser)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="25" 
        textAnchor="middle" 
        fill="rgba(245, 101, 101, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        INFO_VIDEO_NODE - METADATA_ANALYSIS_BLUEPRINT
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#analyserGrad)"
          stroke="rgba(245, 101, 101, 0.8)" 
          strokeWidth="2"
          rx="12"
        />

        {/* Header */}
        <rect 
          x="12" 
          y="12" 
          width={nodeWidth - 24} 
          height="16"
          fill="none"
          stroke="rgba(245, 101, 101, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="3,2"
        />
        
        <text x="18" y="23" fill="rgba(245, 101, 101, 0.9)" fontSize="5" fontFamily="monospace">
          &gt; VIDEO_INFO_ANALYZER
        </text>

        {/* Status Display */}
        <rect 
          x="12" 
          y="36" 
          width={nodeWidth - 24} 
          height="16"
          fill="rgba(0, 0, 0, 0.3)"
          stroke="rgba(52, 211, 153, 0.4)" 
          strokeWidth="1"
          rx="4"
        />
        
        <text x="16" y="47" fill="rgba(52, 211, 153, 0.8)" fontSize="4" fontFamily="monospace">
          ✅ ANALYSIS_COMPLETE
        </text>

        {/* Information Display Area - matches actual node layout */}
        <rect 
          x="12" 
          y="60" 
          width={nodeWidth - 24} 
          height="75"
          fill="url(#data-simple)"
          stroke="rgba(245, 101, 101, 0.3)" 
          strokeWidth="1"
          rx="6"
        />

        {/* Actual Information Layout - matching the real node */}
        <g transform="translate(16, 68)">
          {/* FILE_INFO Section */}
          <text x="0" y="6" fill="rgba(251, 191, 36, 0.9)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            FILE_INFO:
          </text>
          <text x="0" y="12" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            path: sample_video.mp4
          </text>
          <text x="0" y="17" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            format: MP4 | size: 245.7 MB
          </text>
          
          {/* VIDEO_STREAM Section */}
          <text x="0" y="28" fill="rgba(96, 165, 250, 0.9)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            VIDEO_STREAM:
          </text>
          <text x="0" y="34" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            resolution: 1920x1080 | duration: 00:05:23
          </text>
          <text x="0" y="39" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            fps: 29.97 | codec: H.264 | bitrate: 5000 kbps
          </text>

          {/* AUDIO_STREAM Section */}
          <text x="0" y="50" fill="rgba(167, 139, 250, 0.9)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            AUDIO_STREAM:
          </text>
          <text x="0" y="56" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            codec: AAC | sample_rate: 48000 Hz | channels: 2
          </text>

          {/* TECHNICAL Section */}
          <text x="0" y="67" fill="rgba(52, 211, 153, 0.9)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            TECHNICAL:
          </text>
          <text x="0" y="73" fill="rgba(224, 242, 254, 0.8)" fontSize="3" fontFamily="monospace">
            aspect_ratio: 1.78:1 | pixel_count: 2.1MP | total_frames: 9,704
          </text>
        </g>

        {/* Refresh Button - matching actual implementation */}
        <rect 
          x="12" 
          y="143" 
          width={nodeWidth - 24} 
          height="12"
          fill="none"
          stroke="rgba(245, 101, 101, 0.6)" 
          strokeWidth="1"
          rx="4"
          strokeDasharray="2,1"
        />
        
        <text 
          x={nodeWidth/2} 
          y="151" 
          textAnchor="middle"
          fill="rgba(245, 101, 101, 0.8)" 
          fontSize="4" 
          fontFamily="monospace"
        >
          [refresh_info]
        </text>

        {/* Input Handle */}
        <circle cx="0" cy={nodeHeight/2} r="7" fill="none" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2"/>
        <text x="-35" y={nodeHeight/2 + 3} fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 20})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(245, 101, 101, 0.7)" fontSize="6" fontFamily="monospace">
          220px - STANDARD_NODE_WIDTH
        </text>
      </g>

      {/* Current Features Panel - matching actual implementation */}
      <g transform={`translate(${width - 160}, 50)`}>
        <rect width="150" height="90" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(245, 101, 101, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(245, 101, 101, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          CURRENT_FEATURES:
        </text>
        
        <text x="5" y="24" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          • File Information Display
        </text>
        <text x="5" y="32" fill="rgba(96, 165, 250, 0.8)" fontSize="5" fontFamily="monospace">
          • Video Stream Analysis
        </text>
        <text x="5" y="40" fill="rgba(167, 139, 250, 0.8)" fontSize="5" fontFamily="monospace">
          • Audio Stream Details
        </text>
        <text x="5" y="48" fill="rgba(52, 211, 153, 0.8)" fontSize="5" fontFamily="monospace">
          • Technical Calculations
        </text>
        <text x="5" y="56" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          • Real-time FFprobe
        </text>
        <text x="5" y="64" fill="rgba(59, 130, 246, 0.8)" fontSize="5" fontFamily="monospace">
          • Terminal Display Output
        </text>
        <text x="5" y="72" fill="rgba(245, 101, 101, 0.8)" fontSize="5" fontFamily="monospace">
          • Refresh Analysis Button
        </text>
        <text x="5" y="80" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          • Error Handling
        </text>
      </g>

      {/* Simple Analysis Pipeline */}
      <g transform="translate(20, 280)">
        <rect width="180" height="60" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(52, 211, 153, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          ANALYSIS_PIPELINE:
        </text>
        
        <text x="5" y="26" fill="rgba(96, 165, 250, 0.8)" fontSize="4" fontFamily="monospace">
          [VIDEO_INPUT] → [FFPROBE] → [METADATA_PARSE]
        </text>
        <text x="5" y="34" fill="rgba(96, 165, 250, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="42" fill="rgba(96, 165, 250, 0.8)" fontSize="4" fontFamily="monospace">
          [ORGANIZE_DATA] → [TERMINAL_DISPLAY]
        </text>
        
        <text x="5" y="54" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
          OUTPUT: 4 sections (File, Video, Audio, Technical)
        </text>
      </g>

      {/* Node Info */}
      <g transform={`translate(${offsetX + 20}, ${offsetY + nodeHeight + 50})`}>
        <text x="0" y="0" fill="rgba(245, 101, 101, 0.7)" fontSize="4" fontFamily="monospace">
          probe: ffprobe | output: terminal_display
        </text>
      </g>
    </svg>
  );
};