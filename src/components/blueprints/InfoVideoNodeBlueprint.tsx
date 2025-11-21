// src/components/blueprints/InfoVideoNodeBlueprint.tsx
import React from 'react';

interface InfoVideoNodeBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const InfoVideoNodeBlueprint: React.FC<InfoVideoNodeBlueprintProps> = ({ 
  width = 520, 
  height = 450, 
  scale = 1 
}) => {
  const nodeWidth = 320 * scale;
  const nodeHeight = 340 * scale;
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 30 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(20, 0, 40, 0.9)',
        border: '1px solid rgba(245, 101, 101, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="info-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(245, 101, 101, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Info gradient */}
        <linearGradient id="infoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(245, 101, 101, 0.1)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
        </linearGradient>

        {/* Data display pattern */}
        <pattern id="data-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(0, 0, 0, 0.6)"/>
          <circle cx="2" cy="2" r="0.5" fill="rgba(245, 101, 101, 0.4)"/>
          <circle cx="6" cy="6" r="0.5" fill="rgba(245, 101, 101, 0.4)"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#info-grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(245, 101, 101, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        INFO_VIDEO_NODE - METADATA_ANALYSIS_SPECIFICATION
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#infoGrad)"
          stroke="rgba(245, 101, 101, 0.8)" 
          strokeWidth="2"
          rx="12"
        />

        {/* Header Section */}
        <rect 
          x="16" 
          y="16" 
          width={nodeWidth - 32} 
          height="20"
          fill="none"
          stroke="rgba(245, 101, 101, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        <text x="24" y="30" fill="rgba(245, 101, 101, 0.9)" fontSize="6" fontFamily="monospace">
          &gt; INFO_VIDEO_METADATA
        </text>

        {/* Status Indicator */}
        <rect 
          x="16" 
          y="46" 
          width={nodeWidth - 32} 
          height="28"
          fill="rgba(0, 0, 0, 0.3)"
          stroke="rgba(245, 101, 101, 0.4)" 
          strokeWidth="1"
          rx="6"
        />
        <text x="24" y="60" fill="rgba(34, 197, 94, 0.9)" fontSize="5" fontFamily="monospace">
          STATUS: ANALYSIS_COMPLETE
        </text>
        <text x="24" y="69" fill="rgba(96, 165, 250, 0.8)" fontSize="4" fontFamily="monospace">
          video: sample_video.mp4 | 1920x1080@30fps
        </text>

        {/* Tab Selector - 7 sections in 2 rows */}
        <g transform="translate(16, 84)">
          {/* First row - 4 tabs */}
          <rect width="70" height="14" fill="rgba(96, 165, 250, 0.3)" stroke="#60a5fa" strokeWidth="1" rx="3"/>
          <text x="35" y="9" textAnchor="middle" fill="#60a5fa" fontSize="4" fontFamily="monospace" fontWeight="600">OVERVIEW</text>
          
          <rect x="74" width="70" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="1" rx="3"/>
          <text x="109" y="9" textAnchor="middle" fill="rgba(52, 211, 153, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">VIDEO</text>
          
          <rect x="148" width="70" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" rx="3"/>
          <text x="183" y="9" textAnchor="middle" fill="rgba(167, 139, 250, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">AUDIO</text>
          
          <rect x="222" width="66" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" rx="3"/>
          <text x="255" y="9" textAnchor="middle" fill="rgba(251, 191, 36, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">TECH</text>
          
          {/* Second row - 3 tabs */}
          <rect y="18" width="70" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(248, 113, 113, 0.3)" strokeWidth="1" rx="3"/>
          <text x="35" y="27" textAnchor="middle" fill="rgba(248, 113, 113, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">STREAMS</text>
          
          <rect x="74" y="18" width="70" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(251, 113, 133, 0.3)" strokeWidth="1" rx="3"/>
          <text x="109" y="27" textAnchor="middle" fill="rgba(251, 113, 133, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">META</text>
          
          <rect x="148" y="18" width="140" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(6, 214, 160, 0.3)" strokeWidth="1" rx="3"/>
          <text x="218" y="27" textAnchor="middle" fill="rgba(6, 214, 160, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">QUALITY</text>
        </g>

        {/* Info Display Panel */}
        <rect 
          x="16" 
          y="122" 
          width={nodeWidth - 32} 
          height="150"
          fill="url(#data-pattern)"
          stroke="rgba(245, 101, 101, 0.3)" 
          strokeWidth="1"
          rx="6"
        />

        {/* Sample info content - OVERVIEW section */}
        <g transform="translate(20, 130)">
          <text x="0" y="8" fill="#60a5fa" fontSize="5" fontFamily="monospace" fontWeight="600">FILE_OVERVIEW:</text>
          <text x="0" y="16" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            name: sample_video.mp4
          </text>
          <text x="0" y="23" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            format: MP4 | size: 45.2 MB
          </text>
          <text x="0" y="30" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            duration: 00:02:34
          </text>

          <text x="0" y="44" fill="#34d399" fontSize="5" fontFamily="monospace" fontWeight="600">QUICK_SPECS:</text>
          <text x="0" y="52" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            resolution: 1920x1080
          </text>
          <text x="0" y="59" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            framerate: 29.97 fps
          </text>
          <text x="0" y="66" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            video_codec: H.264
          </text>
          <text x="0" y="73" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            audio_codec: AAC
          </text>

          <text x="0" y="87" fill="#fbbf24" fontSize="5" fontFamily="monospace" fontWeight="600">COMPUTED:</text>
          <text x="0" y="95" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            aspect_ratio: 1.778:1
          </text>
          <text x="0" y="102" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            megapixels: 2.07MP
          </text>
          <text x="0" y="109" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            total_frames: 4,632
          </text>
          <text x="0" y="116" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            data_rate: 2.91 MB/s
          </text>

          {/* Scroll indicator */}
          <rect x="270" y="0" width="3" height="140" fill="rgba(245, 101, 101, 0.2)" rx="1.5"/>
          <rect x="270" y="0" width="3" height="35" fill="rgba(245, 101, 101, 0.6)" rx="1.5"/>
        </g>

        {/* Refresh Button */}
        <rect 
          x="16" 
          y="282" 
          width={nodeWidth - 32} 
          height="20"
          fill="rgba(245, 101, 101, 0.2)"
          stroke="rgba(245, 101, 101, 0.6)" 
          strokeWidth="1"
          rx="6"
        />
        <text x={nodeWidth/2} y="295" textAnchor="middle" fill="rgba(245, 101, 101, 0.9)" fontSize="5" fontFamily="monospace" fontWeight="600">
          [refresh_info]
        </text>

        {/* Input Handle */}
        <circle cx="0" cy={nodeHeight/2} r="7" fill="none" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2"/>
        <text x="-35" y={nodeHeight/2 + 3} fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(245, 101, 101, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(245, 101, 101, 0.7)" fontSize="6" fontFamily="monospace">
          320px - ANALYSIS_WIDTH
        </text>
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(${width - 180}, 50)`}>
        <rect width="170" height="140" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(245, 101, 101, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(245, 101, 101, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          INFO_NODE_SPECIFICATIONS:
        </text>
        
        <text x="5" y="24" fill="rgba(96, 165, 250, 0.8)" fontSize="5" fontFamily="monospace">
          • 7 Info Sections (Multi-tab)
        </text>
        <text x="5" y="32" fill="rgba(52, 211, 153, 0.8)" fontSize="5" fontFamily="monospace">
          • FFprobe Analysis Backend
        </text>
        <text x="5" y="40" fill="rgba(167, 139, 250, 0.8)" fontSize="5" fontFamily="monospace">
          • Real-time Metadata Parsing
        </text>
        <text x="5" y="48" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          • Quality Score Calculation
        </text>
        <text x="5" y="56" fill="rgba(248, 113, 113, 0.8)" fontSize="5" fontFamily="monospace">
          • Stream Analysis
        </text>
        <text x="5" y="64" fill="rgba(251, 113, 133, 0.8)" fontSize="5" fontFamily="monospace">
          • Container Metadata
        </text>
        <text x="5" y="72" fill="rgba(6, 214, 160, 0.8)" fontSize="5" fontFamily="monospace">
          • Codec Information
        </text>
        <text x="5" y="80" fill="rgba(245, 101, 101, 0.8)" fontSize="5" fontFamily="monospace">
          • Computed Metrics
        </text>
        
        <text x="5" y="94" fill="rgba(0, 255, 255, 0.9)" fontSize="5" fontFamily="monospace" fontWeight="bold">
          DISPLAY_SECTIONS:
        </text>
        <text x="5" y="103" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          1. OVERVIEW - File & Quick Specs
        </text>
        <text x="5" y="110" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          2. VIDEO - Stream & Encoding
        </text>
        <text x="5" y="117" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          3. AUDIO - Audio Properties
        </text>
        <text x="5" y="124" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          4. TECHNICAL - Computed Data
        </text>
        <text x="5" y="131" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          5. STREAMS - Stream Details
        </text>
      </g>

      {/* Analysis Pipeline */}
      <g transform="translate(20, 280)">
        <rect width="160" height="110" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(96, 165, 250, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          ANALYSIS_PIPELINE:
        </text>
        
        <text x="5" y="26" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
          [VIDEO_INPUT] → [FFPROBE]
        </text>
        <text x="5" y="34" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="42" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
          [JSON_PARSER] → [METADATA_EXTRACTOR]
        </text>
        <text x="5" y="50" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="58" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
          [QUALITY_ANALYZER] → [UI_DISPLAY]
        </text>
        
        <text x="5" y="72" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          PROBE: ffprobe -show_format -show_streams
        </text>
        <text x="5" y="80" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          OUTPUT: Comprehensive video metadata
        </text>
        <text x="5" y="88" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          DISPLAY: 7-section tabbed interface
        </text>
        <text x="5" y="96" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          FEATURES: Quality scoring + recommendations
        </text>
        <text x="5" y="104" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          REFRESH: On-demand re-analysis
        </text>
      </g>

      {/* Node Info */}
      <g transform={`translate(15, 40)`}>
        <rect width="140" height="55" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(245, 101, 101, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="15" fill="rgba(245, 101, 101, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          NODE_TYPE: ANALYZER
        </text>
        <text x="5" y="26" fill="rgba(245, 101, 101, 0.7)" fontSize="5" fontFamily="monospace">
          CATEGORY: INFO_TOOLS
        </text>
        <text x="5" y="37" fill="rgba(245, 101, 101, 0.7)" fontSize="5" fontFamily="monospace">
          INPUTS: 1 (video stream)
        </text>
        <text x="5" y="48" fill="rgba(245, 101, 101, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUTS: 0 (analysis node)
        </text>
      </g>
    </svg>
  );
};
