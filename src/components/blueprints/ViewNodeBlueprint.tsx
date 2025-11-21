// src/components/blueprints/ViewNodeBlueprint.tsx
import React from 'react';

interface ViewNodeBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const ViewNodeBlueprint: React.FC<ViewNodeBlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 240 * scale; // Wider for video preview
  const nodeHeight = 200 * scale; // Taller for video area
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 30 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(20, 0, 40, 0.9)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(168, 85, 247, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Display gradient */}
        <linearGradient id="viewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.12)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
        </linearGradient>

        {/* Video screen pattern */}
        <pattern id="screen-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(0, 0, 0, 0.8)"/>
          <rect width="1" height="1" fill="rgba(168, 85, 247, 0.3)"/>
          <rect x="2" y="2" width="1" height="1" fill="rgba(168, 85, 247, 0.3)"/>
        </pattern>

        {/* Scanline effect */}
        <pattern id="scanlines" x="0" y="0" width="100%" height="2" patternUnits="userSpaceOnUse">
          <rect width="100%" height="1" fill="rgba(168, 85, 247, 0.1)"/>
          <rect y="1" width="100%" height="1" fill="transparent"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(168, 85, 247, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        VIDEO_PREVIEW_NODE - DISPLAY_SPECIFICATION
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#viewGrad)"
          stroke="rgba(168, 85, 247, 0.8)" 
          strokeWidth="2"
          rx="12"
        />

        {/* Header Section */}
        <rect 
          x="16" 
          y="16" 
          width={nodeWidth - 32} 
          height="24"
          fill="none"
          stroke="rgba(168, 85, 247, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        {/* Header Text */}
        <text 
          x="24" 
          y="32" 
          fill="rgba(168, 85, 247, 0.9)"
          fontSize="6"
          fontFamily="monospace"
        >
          &gt; VIDEO_PREVIEW
        </text>

        {/* Video Display Area */}
        <rect 
          x="16" 
          y="50" 
          width={nodeWidth - 32} 
          height="90"
          fill="url(#screen-pattern)"
          stroke="rgba(168, 85, 247, 0.6)" 
          strokeWidth="2"
          rx="8"
        />
        
        {/* Scanlines overlay */}
        <rect 
          x="18" 
          y="52" 
          width={nodeWidth - 36} 
          height="86"
          fill="url(#scanlines)"
          opacity="0.6"
        />

        {/* Video screen bezel */}
        <rect 
          x="20" 
          y="54" 
          width={nodeWidth - 40} 
          height="82"
          fill="none"
          stroke="rgba(0, 255, 255, 0.4)" 
          strokeWidth="1"
          rx="4"
          strokeDasharray="1,1"
        />

        {/* Video info overlay */}
        <text x="25" y="68" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          RESOLUTION: 1920x1080@30fps
        </text>
        <text x="25" y="78" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          CODEC: H.264/AVC
        </text>
        <text x="25" y="88" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          BITRATE: 5.2 Mbps
        </text>
        <text x="25" y="98" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          DURATION: 02:34:18
        </text>

        {/* Playback indicator */}
        <circle cx="150" cy="95" r="8" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2"/>
        <polygon points="146,90 146,100 154,95" fill="rgba(34, 197, 94, 0.8)"/>

        {/* Control Buttons */}
        <rect 
          x="16" 
          y="150" 
          width="45" 
          height="20"
          fill="none"
          stroke="rgba(168, 85, 247, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        <text x="25" y="162" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          [PLAY]
        </text>
        
        <rect 
          x="70" 
          y="150" 
          width="45" 
          height="20"
          fill="none"
          stroke="rgba(168, 85, 247, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        <text x="80" y="162" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          [STOP]
        </text>

        {/* Format Compatibility Indicator */}
        <rect 
          x="125" 
          y="150" 
          width={nodeWidth - 145} 
          height="20"
          fill="none"
          stroke="rgba(34, 197, 94, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="1,2"
        />
        <text x="130" y="157" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
          HTML5_COMPATIBLE
        </text>
        <text x="130" y="166" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
          WEBCODECS_READY
        </text>

        {/* Input Handle */}
        <circle 
          cx="0" 
          cy={nodeHeight/2}
          r="7"
          fill="none"
          stroke="rgba(249, 115, 22, 0.8)" 
          strokeWidth="2"
        />
        <text x="-35" y={nodeHeight/2 + 2} fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 25})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(168, 85, 247, 0.8)" fontSize="6" fontFamily="monospace">
          240px
        </text>
      </g>

      <g transform={`translate(${offsetX - 30}, ${offsetY})`}>
        <line x1="0" y1="0" x2="0" y2={nodeHeight} stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1={nodeHeight} x2="5" y2={nodeHeight} stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1"/>
        <text x="-15" y={nodeHeight/2 + 5} textAnchor="middle" fill="rgba(168, 85, 247, 0.8)" fontSize="6" fontFamily="monospace" transform={`rotate(-90, -15, ${nodeHeight/2 + 5})`}>
          200px
        </text>
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(15, ${height - 110})`}>
        <text x="0" y="0" fill="rgba(168, 85, 247, 0.9)" fontSize="7" fontFamily="monospace" fontWeight="bold">
          DISPLAY_SPECIFICATIONS:
        </text>
        <text x="0" y="12" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • THEME_COLOR: rgba(168, 85, 247, 0.6)
        </text>
        <text x="0" y="22" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • DISPLAY_ENGINE: HTML5 Video Element
        </text>
        <text x="0" y="32" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • SUPPORTED_CODECS: H.264, WebM, Ogg
        </text>
        <text x="0" y="42" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • MAX_RESOLUTION: 4K@60fps (Hardware Dependent)
        </text>
        <text x="0" y="52" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • CONTROLS: Play/Pause, Stop, Seek
        </text>
        <text x="0" y="62" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          • COMPATIBILITY: Chrome 90+, Firefox 88+, Safari 14+
        </text>
      </g>

      {/* Browser Compatibility Matrix */}
      <g transform={`translate(${width - 200}, 40)`}>
        <rect width="190" height="100" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(168, 85, 247, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          BROWSER_COMPATIBILITY_MATRIX:
        </text>
        
        {/* Chrome */}
        <text x="5" y="24" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          CHROME: [████████████] 100% ✓
        </text>
        <text x="10" y="32" fill="rgba(34, 197, 94, 0.6)" fontSize="4" fontFamily="monospace">
          H.264, WebM, AV1, HDR Support
        </text>
        
        {/* Firefox */}
        <text x="5" y="44" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          FIREFOX: [██████████░░] 85% ✓
        </text>
        <text x="10" y="52" fill="rgba(251, 191, 36, 0.6)" fontSize="4" fontFamily="monospace">
          H.264, WebM, Limited AV1
        </text>
        
        {/* Safari */}
        <text x="5" y="64" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          SAFARI: [████████░░░░] 70% ⚠
        </text>
        <text x="10" y="72" fill="rgba(251, 191, 36, 0.6)" fontSize="4" fontFamily="monospace">
          H.264, HEVC, No WebM/AV1
        </text>
        
        {/* Edge */}
        <text x="5" y="84" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          EDGE: [███████████░] 95% ✓
        </text>
        <text x="10" y="92" fill="rgba(34, 197, 94, 0.6)" fontSize="4" fontFamily="monospace">
          Chromium-based, Full Support
        </text>
      </g>

      {/* Video Analysis Panel */}
      <g transform={`translate(${width - 200}, 150)`}>
        <rect width="190" height="70" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(168, 85, 247, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          PLAYBACK_ANALYSIS:
        </text>
        
        {/* Decode Performance */}
        <text x="5" y="24" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          DECODE_PERF: Hardware Accelerated
        </text>
        
        {/* Buffer Health */}
        <text x="5" y="34" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          BUFFER: [██████████░░] 4.2s / 6.0s
        </text>
        
        {/* Network Usage */}
        <text x="5" y="44" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          NETWORK: [███░░░░░░░░░] 2.1 Mbps
        </text>
        
        {/* Dropped Frames */}
        <text x="5" y="54" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          DROPPED: 0 frames (0.00%)
        </text>
        
        {/* Playback State */}
        <text x="5" y="64" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          STATE: PLAYING | POS: 00:42:18 / 02:34:18
        </text>
      </g>

      {/* Component Labels */}
      <g>
        {/* Video Display Label */}
        <line 
          x1={offsetX + 30} 
          y1={offsetY + 95} 
          x2={offsetX - 20} 
          y2={offsetY + 70}
          stroke="rgba(168, 85, 247, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX - 25} 
          y={offsetY + 68} 
          fill="rgba(168, 85, 247, 0.8)"
          fontSize="5"
          fontFamily="monospace"
          textAnchor="end"
        >
          VIDEO_DISPLAY_AREA
        </text>

        {/* Controls Label */}
        <line 
          x1={offsetX + 90} 
          y1={offsetY + 160} 
          x2={offsetX + nodeWidth + 20} 
          y2={offsetY + 140}
          stroke="rgba(168, 85, 247, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX + nodeWidth + 25} 
          y={offsetY + 138} 
          fill="rgba(168, 85, 247, 0.8)"
          fontSize="5"
          fontFamily="monospace"
        >
          PLAYBACK_CONTROLS
        </text>
      </g>

      {/* Node Info Box */}
      <g transform={`translate(15, 40)`}>
        <rect 
          width="150" 
          height="70"
          fill="rgba(0, 0, 0, 0.6)"
          stroke="rgba(168, 85, 247, 0.4)" 
          strokeWidth="1"
          rx="4"
        />
        <text x="5" y="15" fill="rgba(168, 85, 247, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          NODE_TYPE: PREVIEW
        </text>
        <text x="5" y="26" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          CATEGORY: OUTPUT_DISPLAY
        </text>
        <text x="5" y="37" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          INPUTS: 1 (video stream)
        </text>
        <text x="5" y="48" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUTS: 0 (terminal node)
        </text>
        <text x="5" y="59" fill="rgba(168, 85, 247, 0.7)" fontSize="5" fontFamily="monospace">
          PURPOSE: Real-time preview
        </text>
      </g>
    </svg>
  );
};