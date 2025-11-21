// src/components/blueprints/SequenceExtractBlueprint.tsx
import React from 'react';

interface SequenceExtractBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const SequenceExtractBlueprint: React.FC<SequenceExtractBlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 220 * scale;
  const nodeHeight = 260 * scale; // Tallest node due to many options
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 60 * scale;

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
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path 
            d="M 10 0 L 0 0 0 10" 
            fill="none" 
            stroke="rgba(251, 191, 36, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Extract gradient */}
        <linearGradient id="extractGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.1)" />
          <stop offset="100%" stopColor="rgba(245, 101, 101, 0.05)" />
        </linearGradient>

        {/* Frame pattern */}
        <pattern id="frame-pattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="rgba(251, 191, 36, 0.05)"/>
          <rect width="2" height="2" fill="rgba(251, 191, 36, 0.3)" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="0.5"/>
          <rect x="3" y="3" width="2" height="2" fill="rgba(251, 191, 36, 0.3)" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="0.5"/>
        </pattern>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="15" 
        textAnchor="middle" 
        fill="rgba(251, 191, 36, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        SEQUENCE_EXTRACT_NODE - FRAME_EXTRACTION_SPEC
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#extractGrad)"
          stroke="rgba(251, 191, 36, 0.8)" 
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
          stroke="rgba(251, 191, 36, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        <text x="24" y="32" fill="rgba(251, 191, 36, 0.9)" fontSize="6" fontFamily="monospace">
          &gt; SEQUENCE_EXTRACT
        </text>

        {/* Format Selection Row */}
        <g transform="translate(16, 50)">
          <rect width="85" height="20" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="5" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">FORMAT</text>
          
          <rect x="103" width="85" height="20" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="108" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">COMPRESS</text>
        </g>

        {/* Size/Quality Row */}
        <g transform="translate(16, 80)">
          <rect width="85" height="20" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="5" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">SIZE</text>
          
          <rect x="103" width="85" height="20" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="108" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">QUALITY</text>
        </g>

        {/* FPS Control */}
        <g transform="translate(16, 110)">
          <rect width={nodeWidth - 32} height="20" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="4" strokeDasharray="2,1"/>
          <text x="5" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
            FRAME_RATE: [ORIGINAL|1|2|5|10|15|24|30] fps
          </text>
        </g>

        {/* Extraction Pipeline */}
        <g transform="translate(16, 140)">
          <rect width={nodeWidth - 32} height="60" fill="url(#frame-pattern)" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" rx="6"/>
          <text x="5" y="12" fill="rgba(251, 191, 36, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
            EXTRACTION_PIPELINE:
          </text>
          
          {/* Pipeline stages */}
          <g transform="translate(5, 20)">
            {/* Stage 1: Decode */}
            <rect width="30" height="12" fill="none" stroke="rgba(245, 101, 101, 0.6)" strokeWidth="1" rx="2"/>
            <text x="15" y="8" textAnchor="middle" fill="rgba(245, 101, 101, 0.8)" fontSize="4" fontFamily="monospace">
              DECODE
            </text>
            
            {/* Arrow */}
            <line x1="30" y1="6" x2="40" y2="6" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
            <polygon points="38,4 42,6 38,8" fill="rgba(0, 255, 255, 0.6)"/>
            
            {/* Stage 2: Scale */}
            <rect x="40" width="30" height="12" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1" rx="2"/>
            <text x="55" y="8" textAnchor="middle" fill="rgba(59, 130, 246, 0.8)" fontSize="4" fontFamily="monospace">
              SCALE
            </text>
            
            {/* Arrow */}
            <line x1="70" y1="6" x2="80" y2="6" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
            <polygon points="78,4 82,6 78,8" fill="rgba(0, 255, 255, 0.6)"/>
            
            {/* Stage 3: Format */}
            <rect x="80" width="30" height="12" fill="none" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1" rx="2"/>
            <text x="95" y="8" textAnchor="middle" fill="rgba(168, 85, 247, 0.8)" fontSize="4" fontFamily="monospace">
              FORMAT
            </text>
            
            {/* Arrow */}
            <line x1="110" y1="6" x2="120" y2="6" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1"/>
            <polygon points="118,4 122,6 118,8" fill="rgba(0, 255, 255, 0.6)"/>
            
            {/* Stage 4: Save */}
            <rect x="120" width="30" height="12" fill="none" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1" rx="2"/>
            <text x="135" y="8" textAnchor="middle" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
              SAVE
            </text>
          </g>

          {/* Frame counter */}
          <text x="5" y="45" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
            FRAMES_EXTRACTED: 0000 / 2876 [████████░░] 80%
          </text>
          
          {/* Throughput */}
          <text x="5" y="55" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
            THROUGHPUT: 24.3 fps | ETA: 00:02:14
          </text>
        </g>

        {/* Output Path */}
        <rect 
          x="16" 
          y="210" 
          width={nodeWidth - 32} 
          height="25"
          fill="none"
          stroke="rgba(251, 191, 36, 0.4)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="4,2"
        />
        <text x="20" y="218" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUT_PATH:
        </text>
        <text x="20" y="228" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          /frames/sequence_001/frame_%04d.png
        </text>

        {/* Input Handles */}
        <circle cx="0" cy="80" r="7" fill="none" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2"/>
        <text x="-35" y="84" fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>
        
        <circle cx="0" cy="120" r="7" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2"/>
        <text x="-35" y="124" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
          TRIM_DATA
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(251, 191, 36, 0.8)" fontSize="6" fontFamily="monospace">
          220px
        </text>
      </g>

      <g transform={`translate(${offsetX - 30}, ${offsetY})`}>
        <line x1="0" y1="0" x2="0" y2={nodeHeight} stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1={nodeHeight} x2="5" y2={nodeHeight} stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1"/>
        <text x="-15" y={nodeHeight/2 + 5} textAnchor="middle" fill="rgba(251, 191, 36, 0.8)" fontSize="6" fontFamily="monospace" transform={`rotate(-90, -15, ${nodeHeight/2 + 5})`}>
          260px
        </text>
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(${width - 180}, 30)`}>
        <rect width="170" height="120" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(251, 191, 36, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          EXTRACTION_SPECIFICATIONS:
        </text>
        <text x="5" y="22" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • FORMATS: PNG, JPG, JPEG, TIFF, BMP
        </text>
        <text x="5" y="32" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • COMPRESSION: None→Maximum (9 levels)
        </text>
        <text x="5" y="42" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • RESOLUTIONS: Original, 4K, 1080p, 720p, 480p
        </text>
        <text x="5" y="52" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • FRAME_RATES: 1-30fps or Original
        </text>
        <text x="5" y="62" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • QUALITY: Low→Ultra (4 levels)
        </text>
        <text x="5" y="72" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • NAMING: Sequential (%04d pattern)
        </text>
        <text x="5" y="82" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • TRIM_SUPPORT: Start/End time ranges
        </text>
        <text x="5" y="92" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • OUTPUT: Image sequence files
        </text>
        <text x="5" y="102" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • PERFORMANCE: ~24fps extraction rate
        </text>
        <text x="5" y="112" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          • METADATA: Frame timing preserved
        </text>
      </g>

      {/* Format Comparison Table */}
      <g transform={`translate(${width - 180}, 160)`}>
        <rect width="170" height="80" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(251, 191, 36, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          FORMAT_COMPARISON:
        </text>
        
        <text x="5" y="24" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          PNG: Lossless, Large, Alpha Support
        </text>
        <text x="5" y="34" fill="rgba(59, 130, 246, 0.8)" fontSize="5" fontFamily="monospace">
          JPG: Lossy, Small, No Alpha
        </text>
        <text x="5" y="44" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          TIFF: Lossless, Huge, Professional
        </text>
        <text x="5" y="54" fill="rgba(245, 101, 101, 0.8)" fontSize="5" fontFamily="monospace">
          BMP: Uncompressed, Large, Simple
        </text>
        
        <text x="5" y="68" fill="rgba(251, 191, 36, 0.8)" fontSize="5" fontFamily="monospace">
          RECOMMENDED: PNG (best quality/size ratio)
        </text>
      </g>

      {/* Node Info */}
      <g transform={`translate(15, 30)`}>
        <rect width="140" height="60" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="15" fill="rgba(251, 191, 36, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          NODE_TYPE: EXTRACTOR
        </text>
        <text x="5" y="26" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          CATEGORY: PROCESSING
        </text>
        <text x="5" y="37" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          INPUTS: 2 (video + trim data)
        </text>
        <text x="5" y="48" fill="rgba(251, 191, 36, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUTS: Image sequence files
        </text>
      </g>
    </svg>
  );
};