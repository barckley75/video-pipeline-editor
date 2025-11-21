// src/components/blueprints/InfoAudioNodeBlueprint.tsx
import React from 'react';

interface InfoAudioNodeBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const InfoAudioNodeBlueprint: React.FC<InfoAudioNodeBlueprintProps> = ({ 
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
        background: 'rgba(40, 0, 20, 0.9)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="audio-info-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(236, 72, 153, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Audio info gradient */}
        <linearGradient id="audioInfoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(236, 72, 153, 0.1)" />
          <stop offset="100%" stopColor="rgba(219, 39, 119, 0.05)" />
        </linearGradient>

        {/* Waveform pattern for data display */}
        <pattern id="audio-data-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="rgba(0, 0, 0, 0.6)"/>
          <path d="M 0,5 Q 2.5,2 5,5 T 10,5" fill="none" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="0.5"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#audio-info-grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(236, 72, 153, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        INFO_AUDIO_NODE - AUDIO_METADATA_ANALYSIS_SPECIFICATION
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#audioInfoGrad)"
          stroke="rgba(236, 72, 153, 0.8)" 
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
          stroke="rgba(236, 72, 153, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        <text x="24" y="30" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace">
          &gt; INFO_AUDIO_METADATA
        </text>

        {/* Status Indicator */}
        <rect 
          x="16" 
          y="46" 
          width={nodeWidth - 32} 
          height="28"
          fill="rgba(0, 0, 0, 0.3)"
          stroke="rgba(236, 72, 153, 0.4)" 
          strokeWidth="1"
          rx="6"
        />
        <text x="24" y="60" fill="rgba(236, 72, 153, 0.9)" fontSize="5" fontFamily="monospace">
          STATUS: AUDIO_ANALYSIS_COMPLETE
        </text>
        <text x="24" y="69" fill="rgba(139, 92, 246, 0.8)" fontSize="4" fontFamily="monospace">
          audio: sample_audio.mp3 | 44.1kHz | 320kbps
        </text>

        {/* Tab Selector - 6 sections in 2 rows */}
        <g transform="translate(16, 84)">
          {/* First row - 3 tabs */}
          <rect width="94" height="14" fill="rgba(236, 72, 153, 0.3)" stroke="#ec4899" strokeWidth="1" rx="3"/>
          <text x="47" y="9" textAnchor="middle" fill="#ec4899" fontSize="4" fontFamily="monospace" fontWeight="600">OVERVIEW</text>
          
          <rect x="98" width="94" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" rx="3"/>
          <text x="145" y="9" textAnchor="middle" fill="rgba(139, 92, 246, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">AUDIO</text>
          
          <rect x="196" width="92" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" rx="3"/>
          <text x="242" y="9" textAnchor="middle" fill="rgba(251, 191, 36, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">TECH</text>
          
          {/* Second row - 3 tabs */}
          <rect y="18" width="94" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(6, 214, 160, 0.3)" strokeWidth="1" rx="3"/>
          <text x="47" y="27" textAnchor="middle" fill="rgba(6, 214, 160, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">QUALITY</text>
          
          <rect x="98" y="18" width="94" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(248, 113, 113, 0.3)" strokeWidth="1" rx="3"/>
          <text x="145" y="27" textAnchor="middle" fill="rgba(248, 113, 113, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">META</text>
          
          <rect x="196" y="18" width="92" height="14" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="1" rx="3"/>
          <text x="242" y="27" textAnchor="middle" fill="rgba(96, 165, 250, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="600">STREAMS</text>
        </g>

        {/* Info Display Panel */}
        <rect 
          x="16" 
          y="122" 
          width={nodeWidth - 32} 
          height="150"
          fill="url(#audio-data-pattern)"
          stroke="rgba(236, 72, 153, 0.3)" 
          strokeWidth="1"
          rx="6"
        />

        {/* Sample info content - OVERVIEW section */}
        <g transform="translate(20, 130)">
          <text x="0" y="8" fill="#ec4899" fontSize="5" fontFamily="monospace" fontWeight="600">FILE_OVERVIEW:</text>
          <text x="0" y="16" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            name: sample_audio.mp3
          </text>
          <text x="0" y="23" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            format: MP3 | size: 8.7 MB
          </text>
          <text x="0" y="30" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            duration: 00:03:45
          </text>

          <text x="0" y="44" fill="#8b5cf6" fontSize="5" fontFamily="monospace" fontWeight="600">AUDIO_SPECS:</text>
          <text x="0" y="52" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            sample_rate: 44,100 Hz
          </text>
          <text x="0" y="59" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            channels: 2 (stereo)
          </text>
          <text x="0" y="66" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            codec: MP3 (LAME)
          </text>
          <text x="0" y="73" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            bitrate: 320 kbps
          </text>

          <text x="0" y="87" fill="#fbbf24" fontSize="5" fontFamily="monospace" fontWeight="600">COMPUTED:</text>
          <text x="0" y="95" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            total_samples: 9,922,500
          </text>
          <text x="0" y="102" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            total_bits: 180,000,000
          </text>
          <text x="0" y="109" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            efficiency: 92.3%
          </text>
          <text x="0" y="116" fill="rgba(224, 242, 254, 0.9)" fontSize="4" fontFamily="monospace">
            quality_class: HIGH_DEFINITION
          </text>

          {/* Scroll indicator */}
          <rect x="270" y="0" width="3" height="140" fill="rgba(236, 72, 153, 0.2)" rx="1.5"/>
          <rect x="270" y="0" width="3" height="35" fill="rgba(236, 72, 153, 0.6)" rx="1.5"/>
        </g>

        {/* Refresh Button */}
        <rect 
          x="16" 
          y="282" 
          width={nodeWidth - 32} 
          height="20"
          fill="rgba(236, 72, 153, 0.2)"
          stroke="rgba(236, 72, 153, 0.6)" 
          strokeWidth="1"
          rx="6"
        />
        <text x={nodeWidth/2} y="295" textAnchor="middle" fill="rgba(236, 72, 153, 0.9)" fontSize="5" fontFamily="monospace" fontWeight="600">
          [refresh_audio_info]
        </text>

        {/* Input Handle */}
        <circle cx="0" cy={nodeHeight/2} r="7" fill="none" stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2"/>
        <text x="-40" y={nodeHeight/2 + 3} fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          AUDIO_IN
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(236, 72, 153, 0.7)" fontSize="6" fontFamily="monospace">
          320px - AUDIO_ANALYSIS_WIDTH
        </text>
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(${width - 180}, 50)`}>
        <rect width="170" height="130" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          AUDIO_INFO_SPECIFICATIONS:
        </text>
        
        <text x="5" y="24" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          • 6 Info Sections (Audio-focused)
        </text>
        <text x="5" y="32" fill="rgba(139, 92, 246, 0.8)" fontSize="5" fontFamily="monospace">
          • FFprobe Audio Analysis
        </text>
        <text x="5" y="40" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          • Sample Rate Detection
        </text>
        <text x="5" y="48" fill="rgba(6, 214, 160, 0.8)" fontSize="5" fontFamily="monospace">
          • Quality Scoring System
        </text>
        <text x="5" y="56" fill="rgba(248, 113, 113, 0.8)" fontSize="5" fontFamily="monospace">
          • Channel Layout Analysis
        </text>
        <text x="5" y="64" fill="rgba(96, 165, 250, 0.8)" fontSize="5" fontFamily="monospace">
          • Codec Information
        </text>
        <text x="5" y="72" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          • Bitrate & Compression
        </text>
        <text x="5" y="80" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Dynamic Range Metrics
        </text>
        
        <text x="5" y="94" fill="rgba(0, 255, 255, 0.9)" fontSize="5" fontFamily="monospace" fontWeight="bold">
          DISPLAY_SECTIONS:
        </text>
        <text x="5" y="103" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          1. OVERVIEW - File & Audio Specs
        </text>
        <text x="5" y="110" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          2. AUDIO - Stream & Encoding
        </text>
        <text x="5" y="117" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          3. TECHNICAL - Computed Metrics
        </text>
        <text x="5" y="124" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          4. QUALITY - Score & Analysis
        </text>
      </g>

      {/* Analysis Pipeline */}
      <g transform="translate(20, 280)">
        <rect width="160" height="110" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(139, 92, 246, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          AUDIO_ANALYSIS_PIPELINE:
        </text>
        
        <text x="5" y="26" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          [AUDIO_INPUT] → [FFPROBE]
        </text>
        <text x="5" y="34" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="42" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          [CODEC_PARSER] → [STREAM_EXTRACTOR]
        </text>
        <text x="5" y="50" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
                    ↓
        </text>
        <text x="5" y="58" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          [QUALITY_CALC] → [UI_DISPLAY]
        </text>
        
        <text x="5" y="72" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          PROBE: ffprobe -show_format -show_streams
        </text>
        <text x="5" y="80" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          OUTPUT: Audio metadata + quality score
        </text>
        <text x="5" y="88" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          DISPLAY: 6-section tabbed interface
        </text>
        <text x="5" y="96" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          FEATURES: Quality analysis + recommendations
        </text>
        <text x="5" y="104" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          FORMATS: MP3, WAV, FLAC, AAC, OGG, etc.
        </text>
      </g>

      {/* Node Info */}
      <g transform={`translate(15, 40)`}>
        <rect width="140" height="55" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="15" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          NODE_TYPE: ANALYZER
        </text>
        <text x="5" y="26" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          CATEGORY: AUDIO_INFO_TOOLS
        </text>
        <text x="5" y="37" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          INPUTS: 1 (audio stream)
        </text>
        <text x="5" y="48" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUTS: 0 (analysis node)
        </text>
      </g>
    </svg>
  );
};
