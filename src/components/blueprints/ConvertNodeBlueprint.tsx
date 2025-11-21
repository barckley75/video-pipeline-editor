// src/components/blueprints/ConvertNodeBlueprint.tsx
import React from 'react';

interface ConvertNodeBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const ConvertNodeBlueprint: React.FC<ConvertNodeBlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 220 * scale;
  const nodeHeight = 180 * scale; // Taller than input node
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 30 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(0, 20, 40, 0.9)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
          <path 
            d="M 15 0 L 0 0 0 15" 
            fill="none" 
            stroke="rgba(59, 130, 246, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Processing unit gradient */}
        <linearGradient id="convertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
        </linearGradient>

        {/* GPU indicator */}
        <pattern id="gpu-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(59, 130, 246, 0.1)"/>
          <rect width="2" height="2" fill="rgba(59, 130, 246, 0.4)"/>
          <rect x="4" y="4" width="2" height="2" fill="rgba(59, 130, 246, 0.4)"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(59, 130, 246, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        CONVERT_ENGINE_NODE - PROCESSING_SPECIFICATION
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#convertGrad)"
          stroke="rgba(59, 130, 246, 0.8)" 
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
          stroke="rgba(59, 130, 246, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        {/* Header Text */}
        <text 
          x="24" 
          y="32" 
          fill="rgba(59, 130, 246, 0.9)"
          fontSize="6"
          fontFamily="monospace"
        >
          &gt; CONVERT_ENGINE
        </text>

        {/* GPU Acceleration Section */}
        <rect 
          x="16" 
          y="50" 
          width={nodeWidth - 32} 
          height="18"
          fill="url(#gpu-pattern)"
          stroke="rgba(59, 130, 246, 0.5)" 
          strokeWidth="1"
          rx="4"
          strokeDasharray="2,1"
        />
        <text x="20" y="62" fill="rgba(59, 130, 246, 0.8)" fontSize="5" fontFamily="monospace">
          GPU_ACCEL: [NVENC|QSV|VIDEOTOOLBOX|VAAPI]
        </text>

        {/* Format Selection */}
        <rect 
          x="16" 
          y="78" 
          width="90" 
          height="22"
          fill="none"
          stroke="rgba(59, 130, 246, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        <text x="20" y="90" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          FORMAT_OUT
        </text>
        
        {/* Quality Selection */}
        <rect 
          x="114" 
          y="78" 
          width="90" 
          height="22"
          fill="none"
          stroke="rgba(59, 130, 246, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        <text x="118" y="90" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          QUALITY_CTRL
        </text>

        {/* Processing Pipeline Diagram */}
        <g transform="translate(20, 110)">
          {/* Input Buffer */}
          <rect width="25" height="15" fill="none" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1" rx="2"/>
          <text x="12.5" y="10" textAnchor="middle" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
            IN_BUF
          </text>
          
          {/* Arrow 1 */}
          <line x1="25" y1="7.5" x2="35" y2="7.5" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1" markerEnd="url(#arrowhead)"/>
          
          {/* Decoder */}
          <rect x="35" width="25" height="15" fill="none" stroke="rgba(245, 101, 101, 0.6)" strokeWidth="1" rx="2"/>
          <text x="47.5" y="10" textAnchor="middle" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
            DECODE
          </text>
          
          {/* Arrow 2 */}
          <line x1="60" y1="7.5" x2="70" y2="7.5" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
          
          {/* Processor */}
          <rect x="70" width="25" height="15" fill="url(#gpu-pattern)" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1" rx="2"/>
          <text x="82.5" y="10" textAnchor="middle" fill="rgba(59, 130, 246, 0.9)" fontSize="4" fontFamily="monospace">
            PROC
          </text>
          
          {/* Arrow 3 */}
          <line x1="95" y1="7.5" x2="105" y2="7.5" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
          
          {/* Encoder */}
          <rect x="105" width="25" height="15" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="2"/>
          <text x="117.5" y="10" textAnchor="middle" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            ENCODE
          </text>
          
          {/* Arrow 4 */}
          <line x1="130" y1="7.5" x2="140" y2="7.5" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
          
          {/* Output Buffer */}
          <rect x="140" width="25" height="15" fill="none" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1" rx="2"/>
          <text x="152.5" y="10" textAnchor="middle" fill="rgba(168, 85, 247, 0.8)" fontSize="4" fontFamily="monospace">
            OUT_BUF
          </text>
        </g>

        {/* Output Path Field */}
        <rect 
          x="16" 
          y="140" 
          width={nodeWidth - 32} 
          height="20"
          fill="none"
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="4,2"
        />
        <text x="20" y="152" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUT_PATH: /dest/converted_video.{'{format}'}
        </text>

        {/* Input Handles */}
        <circle 
          cx="0" 
          cy={60}
          r="7"
          fill="none"
          stroke="rgba(249, 115, 22, 0.8)" 
          strokeWidth="2"
        />
        <text x="-35" y="64" fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
        
        <circle 
          cx="0" 
          cy={100}
          r="7"
          fill="none"
          stroke="rgba(34, 197, 94, 0.8)" 
          strokeWidth="2"
        />
        <text x="-35" y="104" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
          DATA_IN
        </text>

        {/* Output Handle */}
        <circle 
          cx={nodeWidth} 
          cy={nodeHeight/2}
          r="7"
          fill="none"
          stroke="rgba(249, 115, 22, 0.8)" 
          strokeWidth="2"
        />
        <text x={nodeWidth + 12} y={nodeHeight/2 + 2} fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_OUT
        </text>
      </g>

      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 255, 255, 0.6)" />
        </marker>
      </defs>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 25})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(59, 130, 246, 0.8)" fontSize="6" fontFamily="monospace">
          220px
        </text>
      </g>

      <g transform={`translate(${offsetX - 30}, ${offsetY})`}>
        <line x1="0" y1="0" x2="0" y2={nodeHeight} stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1={nodeHeight} x2="5" y2={nodeHeight} stroke="rgba(59, 130, 246, 0.7)" strokeWidth="1"/>
        <text x="-15" y={nodeHeight/2 + 5} textAnchor="middle" fill="rgba(59, 130, 246, 0.8)" fontSize="6" fontFamily="monospace" transform={`rotate(-90, -15, ${nodeHeight/2 + 5})`}>
          180px
        </text>
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(15, ${height - 120})`}>
        <text x="0" y="0" fill="rgba(59, 130, 246, 0.9)" fontSize="7" fontFamily="monospace" fontWeight="bold">
          PROCESSING_SPECIFICATIONS:
        </text>
        <text x="0" y="12" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • THEME_COLOR: rgba(59, 130, 246, 0.6)
        </text>
        <text x="0" y="22" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • CODECS: H.264, H.265, VP9, AV1
        </text>
        <text x="0" y="32" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • GPU_ENGINES: NVENC, QuickSync, VideoToolbox, VAAPI
        </text>
        <text x="0" y="42" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • QUALITY_MODES: CRF, CBR, VBR, Lossless
        </text>
        <text x="0" y="52" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • CONTAINERS: MP4, MKV, WebM, AVI, MOV
        </text>
        <text x="0" y="62" fill="rgba(59, 130, 246, 0.7)" fontSize="5" fontFamily="monospace">
          • PROCESSING_PIPELINE: 5-Stage Architecture
        </text>
      </g>

      {/* Data Flow Diagram */}
      <g transform={`translate(${width - 180}, 40)`}>
        <rect width="170" height="80" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(59, 130, 246, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          DATA_FLOW_MATRIX:
        </text>
        <text x="5" y="24" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          INPUT_A: Video Stream (H.264/HEVC)
        </text>
        <text x="5" y="34" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          INPUT_B: Trim Parameters (Optional)
        </text>
        <text x="5" y="44" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          PROCESS: Decode → Transform → Encode
        </text>
        <text x="5" y="54" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUT: Converted Video Stream
        </text>
        <text x="5" y="64" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          LATENCY: ~0.5x realtime (GPU) / 2x (CPU)
        </text>
        <text x="5" y="74" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          THROUGHPUT: 4K@60fps (NVENC) / 1080p@30fps (x264)
        </text>
      </g>

      {/* Performance Meter */}
      <g transform={`translate(${width - 180}, 130)`}>
        <rect width="170" height="50" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(59, 130, 246, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          PERFORMANCE_METRICS:
        </text>
        
        {/* GPU Usage Bar */}
        <text x="5" y="24" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          GPU: [████████░░] 80%
        </text>
        
        {/* CPU Usage Bar */}
        <text x="5" y="34" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          CPU: [███░░░░░░░] 30%
        </text>
        
        {/* Memory Usage Bar */}
        <text x="5" y="44" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          MEM: [██████░░░░] 60%
        </text>
      </g>
    </svg>
  );
};