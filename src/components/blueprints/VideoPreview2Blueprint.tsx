// src/components/blueprints/VideoPreview2Blueprint.tsx
import React from 'react';

interface VideoPreview2BlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const VideoPreview2Blueprint: React.FC<VideoPreview2BlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 280 * scale;
  const nodeHeight = 220 * scale;
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 25 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(20, 0, 40, 0.9)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="grid-preview2" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(138, 43, 226, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Preview gradient */}
        <linearGradient id="preview2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(138, 43, 226, 0.1)" />
          <stop offset="100%" stopColor="rgba(75, 0, 130, 0.05)" />
        </linearGradient>

        {/* Screen pattern for video display */}
        <pattern id="screen-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(0, 0, 0, 0.8)"/>
          <rect x="0" y="0" width="2" height="2" fill="rgba(138, 43, 226, 0.1)"/>
          <rect x="2" y="2" width="2" height="2" fill="rgba(138, 43, 226, 0.1)"/>
        </pattern>

        {/* Scanline effect */}
        <pattern id="scanlines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
          <rect width="1" height="2" fill="rgba(138, 43, 226, 0.05)"/>
          <rect y="2" width="1" height="2" fill="transparent"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid-preview2)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="18" 
        textAnchor="middle" 
        fill="rgba(138, 43, 226, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        VIDEO_PREVIEW_NODE_V2 - DISPLAY_TERMINAL_SPECIFICATION
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#preview2Grad)"
          stroke="rgba(138, 43, 226, 0.8)" 
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
          stroke="rgba(138, 43, 226, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        <text x="24" y="32" fill="rgba(138, 43, 226, 0.9)" fontSize="6" fontFamily="monospace">
          &gt; VIDEO_DISPLAY_TERMINAL_V2
        </text>

        {/* Video Display Area */}
        <g transform="translate(16, 50)">
          <rect width="140" height="105" fill="url(#screen-pattern)" stroke="rgba(138, 43, 226, 0.6)" strokeWidth="2" rx="8"/>
          <rect width="140" height="105" fill="url(#scanlines)" rx="8"/>
          
          {/* Video Frame Representation */}
          <rect x="10" y="10" width="120" height="67.5" fill="rgba(0, 0, 0, 0.8)" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="4"/>
          
          {/* Sample video content visualization */}
          <rect x="15" y="15" width="110" height="57.5" fill="rgba(138, 43, 226, 0.1)" rx="2"/>
          
          {/* Video info overlay */}
          <text x="20" y="25" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
            1920x1080 @ 30fps | H.264/AVC
          </text>
          <text x="20" y="32" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            BITRATE: 5.2 Mbps | KEYFRAMES: 90
          </text>
          
          {/* Play button overlay */}
          <polygon 
            points="65,45 65,55 75,50" 
            fill="rgba(138, 43, 226, 0.7)" 
            stroke="rgba(255, 255, 255, 0.8)" 
            strokeWidth="1"
          />
          
          {/* Progress bar */}
          <rect x="15" y="82" width="110" height="4" fill="rgba(0, 0, 0, 0.6)" rx="2"/>
          <rect x="15" y="82" width="66" height="4" fill="rgba(138, 43, 226, 0.8)" rx="2"/>
          
          {/* Timecode */}
          <text x="20" y="95" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
            02:15.24 / 05:30.18
          </text>
        </g>

        {/* Control Panel */}
        <g transform="translate(166, 50)">
          <rect width="98" height="105" fill="rgba(0, 0, 0, 0.5)" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="6"/>
          
          <text x="5" y="12" fill="rgba(138, 43, 226, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
            CONTROLS:
          </text>
          
          {/* Transport Controls */}
          <g transform="translate(5, 20)">
            <rect width="88" height="15" fill="rgba(138, 43, 226, 0.1)" stroke="rgba(138, 43, 226, 0.3)" strokeWidth="1" rx="3"/>
            <text x="4" y="9" fill="rgba(255, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
              [◄◄] [►] [■] [►►] [⏸]
            </text>
          </g>
          
          {/* Volume Control */}
          <text x="5" y="48" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            VOLUME: [████████▫▫] 80%
          </text>
          
          {/* Quality Settings */}
          <text x="5" y="58" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            QUALITY: [AUTO] 1080p
          </text>
          <text x="5" y="66" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            SPEED: [1.0x] Normal
          </text>
          
          {/* Display Options */}
          <text x="5" y="78" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            FULLSCREEN: [OFF]
          </text>
          <text x="5" y="86" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            LOOP: [ENABLED]
          </text>
          <text x="5" y="94" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            SUBTITLES: [NONE]
          </text>
        </g>

        {/* Status Bar */}
        <g transform="translate(16, 165)">
          <rect width={nodeWidth - 32} height="20" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="4"/>
          
          <text x="5" y="8" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
            STATUS: [PLAYING] | BUFFER: 98% | DROPPED: 0 frames
          </text>
          <text x="5" y="16" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            RENDERER: WebGL2 | DECODER: Hardware | LATENCY: 16ms
          </text>
        </g>

        {/* Configuration Controls */}
        <g transform="translate(16, 190)">
          <rect width="120" height="15" fill="none" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="5" y="10" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            ASPECT: [16:9 ▼] SCALE: [FIT ▼]
          </text>
          
          <rect x="128" width="120" height="15" fill="none" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="133" y="10" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            FORMAT: [MP4 ▼] AUDIO: [ON ▼]
          </text>
        </g>

        {/* Input Handle */}
        <circle cx="0" cy="110" r="7" fill="none" stroke="rgba(138, 43, 226, 0.8)" strokeWidth="2"/>
        <text x="-35" y="114" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(138, 43, 226, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(138, 43, 226, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(138, 43, 226, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(138, 43, 226, 0.7)" fontSize="4" fontFamily="monospace">
          WIDTH: {nodeWidth.toFixed(0)}px | DISPLAY_TERMINAL
        </text>
      </g>

      {/* Technical Specifications Panel */}
      <g transform={`translate(${width - 180}, 250)`}>
        <rect width="170" height="140" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(138, 43, 226, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(138, 43, 226, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          DISPLAY_SPECIFICATIONS:
        </text>
        
        <text x="5" y="24" fill="rgba(138, 43, 226, 0.8)" fontSize="5" fontFamily="monospace">
          RENDERER: HTML5 Video + WebGL
        </text>
        <text x="5" y="32" fill="rgba(138, 43, 226, 0.8)" fontSize="5" fontFamily="monospace">
          CODECS: H.264, H.265, VP9, AV1
        </text>
        <text x="5" y="40" fill="rgba(138, 43, 226, 0.8)" fontSize="5" fontFamily="monospace">
          AUDIO: AAC, MP3, Opus, Vorbis
        </text>
        
        <text x="5" y="52" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          CONTROLS: Play/Pause/Seek/Volume
        </text>
        <text x="5" y="60" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          TRANSPORT: Timeline scrubbing
        </text>
        <text x="5" y="68" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          SPEED: 0.25x - 4.0x playback
        </text>
        
        <text x="5" y="80" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          SCALING: Fit/Fill/Stretch modes
        </text>
        <text x="5" y="88" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          ASPECT: Auto/4:3/16:9/21:9
        </text>
        <text x="5" y="96" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          FULLSCREEN: Native browser API
        </text>
        
        <text x="5" y="108" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          BUFFER: Adaptive pre-loading
        </text>
        <text x="5" y="116" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          LATENCY: &lt;20ms render pipeline
        </text>
        <text x="5" y="124" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          HARDWARE: GPU-accelerated decode
        </text>
        <text x="5" y="132" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          SYNC: A/V sync compensation
        </text>
      </g>

      {/* Connection Flow Diagram */}
      <g transform="translate(20, 250)">
        <rect width="140" height="110" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(0, 255, 255, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          SIGNAL_FLOW_DIAGRAM:
        </text>
        
        <text x="5" y="26" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
          [VIDEO_INPUT] → [DECODER]
        </text>
        <text x="5" y="34" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="42" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
          [FRAME_BUFFER] → [RENDERER]
        </text>
        <text x="5" y="50" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="58" fill="rgba(138, 43, 226, 0.8)" fontSize="4" fontFamily="monospace">
          [DISPLAY_CANVAS] → [USER_VIEW]
        </text>
        
        <text x="5" y="72" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          DECODE: Hardware accelerated
        </text>
        <text x="5" y="80" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          RENDER: WebGL2 compositing
        </text>
        <text x="5" y="88" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          CONTROLS: DOM event handling
        </text>
        <text x="5" y="96" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          SYNC: RequestAnimationFrame
        </text>
      </g>
    </svg>
  );
};