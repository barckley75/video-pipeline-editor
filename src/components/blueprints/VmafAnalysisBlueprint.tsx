// src/components/blueprints/VmafAnalysisBlueprint.tsx
import React from 'react';

interface VmafAnalysisBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const VmafAnalysisBlueprint: React.FC<VmafAnalysisBlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 260 * scale; // Wider for dual inputs
  const nodeHeight = 200 * scale;
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 30 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(40, 0, 20, 0.9)',
        border: '1px solid rgba(255, 20, 147, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path 
            d="M 12 0 L 0 0 0 12" 
            fill="none" 
            stroke="rgba(255, 20, 147, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* VMAF gradient */}
        <linearGradient id="vmafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 20, 147, 0.1)" />
          <stop offset="100%" stopColor="rgba(245, 101, 101, 0.05)" />
        </linearGradient>

        {/* Quality meter gradient */}
        <linearGradient id="qualityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)"/>
          <stop offset="25%" stopColor="rgba(251, 191, 36, 0.8)"/>
          <stop offset="75%" stopColor="rgba(34, 197, 94, 0.8)"/>
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.8)"/>
        </linearGradient>

        {/* Analysis pattern */}
        <pattern id="analysis-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(255, 20, 147, 0.05)"/>
          <circle cx="2" cy="2" r="0.5" fill="rgba(255, 20, 147, 0.3)"/>
          <circle cx="6" cy="6" r="0.5" fill="rgba(255, 20, 147, 0.3)"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(255, 20, 147, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        VMAF_ANALYSIS_NODE - QUALITY_ASSESSMENT_SPECIFICATION_CREATED_BY_NETFLIX
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#vmafGrad)"
          stroke="rgba(255, 20, 147, 0.8)" 
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
          stroke="rgba(255, 20, 147, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        <text x="24" y="32" fill="rgba(255, 20, 147, 0.9)" fontSize="6" fontFamily="monospace">
          &gt; VMAF_QUALITY_ANALYSIS
        </text>

        {/* Input Status Indicators */}
        <g transform="translate(16, 50)">
          <rect width={nodeWidth - 32} height="25" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255, 20, 147, 0.4)" strokeWidth="1" rx="4"/>
          
          {/* Reference Input Status */}
          <text x="5" y="12" fill="rgba(16, 185, 129, 0.8)" fontSize="5" fontFamily="monospace">
            REF: [●] reference_video.mp4 ✓
          </text>
          <text x="5" y="20" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
            TEST: [●] compressed_video.mp4 ✓
          </text>
        </g>

        {/* VMAF Score Display */}
        <g transform="translate(16, 85)">
          <rect width="120" height="80" fill="url(#analysis-pattern)" stroke="rgba(255, 20, 147, 0.6)" strokeWidth="2" rx="8"/>
          
          {/* Score */}
          <text x="60" y="25" textAnchor="middle" fill="rgba(255, 20, 147, 1)" fontSize="14" fontFamily="monospace" fontWeight="bold">
            94.73
          </text>
          <text x="60" y="35" textAnchor="middle" fill="rgba(255, 20, 147, 0.8)" fontSize="5" fontFamily="monospace">
            EXCELLENT
          </text>
          
          {/* Quality Bar */}
          <rect x="10" y="45" width="100" height="8" fill="url(#qualityGrad)" rx="4"/>
          <rect x="10" y="45" width="94.73" height="8" fill="rgba(255, 255, 255, 0.3)" rx="4"/>
          
          {/* Detailed Stats */}
          <text x="10" y="62" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            MIN: 87.234 | MAX: 99.876
          </text>
          <text x="10" y="70" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            HARMONIC: 94.156 | FRAMES: 4,284
          </text>
        </g>

        {/* Analysis Progress */}
        <g transform="translate(145, 85)">
          <rect width="99" height="80" fill="rgba(0, 0, 0, 0.5)" stroke="rgba(255, 20, 147, 0.4)" strokeWidth="1" rx="6"/>
          
          <text x="5" y="12" fill="rgba(255, 20, 147, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
            ANALYSIS:
          </text>
          
          {/* Progress Bar */}
          <text x="5" y="24" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
            [████████████] 100%
          </text>
          
          {/* Model Info */}
          <text x="5" y="34" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            MODEL: vmaf_v0.6.1
          </text>
          <text x="5" y="42" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            POOLING: harmonic_mean
          </text>
          <text x="5" y="50" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            DEVICE: default_tv
          </text>
          
          {/* Performance */}
          <text x="5" y="62" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            THROUGHPUT: 15.3 fps
          </text>
          <text x="5" y="70" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
            ELAPSED: 00:04:42
          </text>
        </g>

        {/* Configuration Section */}
        <g transform="translate(16, 175)">
          <rect width="110" height="20" fill="none" stroke="rgba(255, 20, 147, 0.4)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="5" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
            MODEL: [default_tv ▼]
          </text>
          
          <rect x="118" width="110" height="20" fill="none" stroke="rgba(255, 20, 147, 0.4)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="123" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
            POOLING: [harmonic ▼]
          </text>
        </g>

        {/* Input Handles */}
        <circle cx="0" cy="70" r="7" fill="none" stroke="rgba(16, 185, 129, 0.8)" strokeWidth="2"/>
        <text x="-45" y="66" fill="rgba(16, 185, 129, 0.8)" fontSize="4" fontFamily="monospace">
          REF_VIDEO
        </text>
        
        <circle cx="0" cy="110" r="7" fill="none" stroke="rgba(251, 191, 36, 0.8)" strokeWidth="2"/>
        <text x="-45" y="114" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
          TEST_VIDEO
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(255, 20, 147, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(255, 20, 147, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(255, 20, 147, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(255, 20, 147, 0.7)" fontSize="4" fontFamily="monospace">
          WIDTH: {nodeWidth.toFixed(0)}px
        </text>
      </g>

      {/* Technical Specifications Panel */}
      <g transform={`translate(${width - 200}, 260)`}>
        <rect width="190" height="120" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(255, 20, 147, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(255, 20, 147, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          TECHNICAL_SPECIFICATIONS:
        </text>
        
        <text x="5" y="24" fill="rgba(16, 185, 129, 0.8)" fontSize="5" fontFamily="monospace">
          INPUT_A: [REF] Reference video stream
        </text>
        <text x="5" y="34" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          INPUT_B: [TEST] Compressed video stream
        </text>
        <text x="5" y="44" fill="rgba(255, 20, 147, 0.8)" fontSize="5" fontFamily="monospace">
          OUTPUT: [SCORE] Quality metrics (0-100)
        </text>
        
        <text x="5" y="56" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          ALGORITHM: Video Multi-method Assessment
        </text>
        <text x="5" y="66" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          MODELS: TV/Mobile/4K viewing conditions
        </text>
        <text x="5" y="76" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          POOLING: Arithmetic/Harmonic/Minimum
        </text>
        
        <text x="5" y="88" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          RESOLUTION: Match input streams
        </text>
        <text x="5" y="98" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          FRAMERATE: Auto-sync temporal alignment
        </text>
        <text x="5" y="108" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          THREADING: Multi-core parallel processing
        </text>
      </g>

      {/* Connection Flow Diagram */}
      <g transform="translate(20, 260)">
        <rect width="150" height="90" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(0, 255, 255, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          DATA_FLOW_DIAGRAM:
        </text>
        
        {/* Flow arrows and connections */}
        <text x="5" y="26" fill="rgba(16, 185, 129, 0.8)" fontSize="4" fontFamily="monospace">
          [REF_VIDEO] ─┐
        </text>
        <text x="5" y="34" fill="rgba(251, 191, 36, 0.8)" fontSize="4" fontFamily="monospace">
          [TEST_VIDEO] ─┤ → [VMAF_ENGINE]
        </text>
        <text x="5" y="42" fill="rgba(255, 20, 147, 0.8)" fontSize="4" fontFamily="monospace">
                       └─→ [QUALITY_SCORE]
        </text>
        
        <text x="5" y="54" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          FRAME_SYNC: Temporal alignment
        </text>
        <text x="5" y="62" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          ANALYSIS: Per-frame + pooled metrics
        </text>
        <text x="5" y="70" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          OUTPUT: JSON report + live score
        </text>
        <text x="5" y="78" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          REALTIME: Progress updates via WebSocket
        </text>
      </g>
    </svg>
  );
};