// components/blueprints/InputNodeBlueprint.tsx
import React from 'react';

interface InputNodeBlueprintProps {
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
}

export const InputNodeBlueprint: React.FC<InputNodeBlueprintProps> = ({ 
  offsetX = 80, 
  offsetY = 50,
  width = 350,
  height = 280
}) => {
  const nodeWidth = 180;
  const nodeHeight = 140;
  
  return (
    <svg 
      width={width} 
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Grid */}
      <defs>
        <pattern id="inputGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.5"/>
        </pattern>
        
        {/* Input Node Glow Effect */}
        <filter id="inputGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.8)"/>
      <rect width="100%" height="100%" fill="url(#inputGrid)"/>

      {/* Node Structure */}
      <g transform={`translate(${offsetX}, ${offsetY})`} filter="url(#inputGlow)">
        {/* Main Node Body */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="rgba(16, 185, 129, 0.1)"
          stroke="rgba(16, 185, 129, 0.6)" 
          strokeWidth="2"
          rx="12"
          strokeDasharray="0"
        />

        {/* Header Section */}
        <rect 
          x="16" 
          y="16" 
          width={nodeWidth - 32} 
          height="24"
          fill="none"
          stroke="rgba(16, 185, 129, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        />
        
        {/* Header Text */}
        <text 
          x="24" 
          y="32" 
          fill="rgba(0, 255, 255, 0.8)"
          fontSize="6"
          fontFamily="monospace"
        >
          &gt; VIDEO_INPUT
        </text>

        {/* File Name Field */}
        <rect 
          x="16" 
          y="50" 
          width={nodeWidth - 32} 
          height="28"
          fill="none"
          stroke="rgba(16, 185, 129, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        
        {/* File Name Label */}
        <text 
          x="20" 
          y="62" 
          fill="rgba(16, 185, 129, 0.8)"
          fontSize="5"
          fontFamily="monospace"
        >
          file_name:
        </text>
        
        {/* File Name Input - shows name without extension */}
        <rect 
          x="20" 
          y="64" 
          width="100" 
          height="10"
          fill="rgba(16, 185, 129, 0.05)"
          stroke="rgba(16, 185, 129, 0.3)" 
          strokeWidth="1"
          rx="2"
        />
        <text 
          x="22" 
          y="71" 
          fill="rgba(16, 185, 129, 0.9)"
          fontSize="4"
          fontFamily="monospace"
          fontWeight="bold"
        >
          my_sample_video
        </text>
        
        {/* Extension Badge */}
        <rect 
          x="125" 
          y="64" 
          width="20" 
          height="10"
          fill="rgba(16, 185, 129, 0.2)"
          stroke="rgba(16, 185, 129, 0.4)" 
          strokeWidth="1"
          rx="2"
        />
        <text 
          x="135" 
          y="71" 
          fill="rgba(16, 185, 129, 0.9)"
          fontSize="4"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="bold"
        >
          MP4
        </text>
        
        {/* Browse Button */}
        <rect 
          x={nodeWidth - 50} 
          y="64" 
          width="20" 
          height="10"
          fill="none"
          stroke="rgba(16, 185, 129, 0.6)" 
          strokeWidth="1"
          rx="2"
          strokeDasharray="1,1"
        />
        <text 
          x={nodeWidth - 40} 
          y="71" 
          fill="rgba(16, 185, 129, 0.8)"
          fontSize="4"
          fontFamily="monospace"
          textAnchor="middle"
        >
          [...]
        </text>

        {/* File Path Field */}
        <rect 
          x="16" 
          y="82" 
          width={nodeWidth - 32} 
          height="20"
          fill="none"
          stroke="rgba(16, 185, 129, 0.4)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="2,1"
        />
        
        {/* File Path Label */}
        <text 
          x="20" 
          y="90" 
          fill="rgba(16, 185, 129, 0.6)"
          fontSize="4"
          fontFamily="monospace"
        >
          file_path:
        </text>
        
        {/* File Path Input (smaller) */}
        <rect 
          x="20" 
          y="92" 
          width={nodeWidth - 40} 
          height="6"
          fill="rgba(16, 185, 129, 0.03)"
          stroke="rgba(16, 185, 129, 0.2)" 
          strokeWidth="0.5"
          rx="1"
        />

        {/* Info Section */}
        <rect 
          x="16" 
          y="110" 
          width={nodeWidth - 32} 
          height="20"
          fill="none"
          stroke="rgba(16, 185, 129, 0.4)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="4,2"
        />

        {/* Output Handle */}
        <circle 
          cx={nodeWidth} 
          cy={nodeHeight/2}
          r="7"
          fill="none"
          stroke="rgba(249, 115, 22, 0.8)" 
          strokeWidth="2"
        />
        
        {/* Handle Connection Line */}
        <line 
          x1={nodeWidth - 7} 
          y1={nodeHeight/2} 
          x2={nodeWidth} 
          y2={nodeHeight/2}
          stroke="rgba(249, 115, 22, 0.8)" 
          strokeWidth="2"
        />
      </g>

      {/* Technical Specifications */}
      <g transform={`translate(20, ${height - 120})`}>
        <text 
          x="0" 
          y="0" 
          fill="rgba(0, 255, 255, 0.9)"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ENHANCED_FEATURES:
        </text>
        
        <text x="0" y="12" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          • CLEAN_FILENAME: Extension removed from name
        </text>
        <text x="0" y="22" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          • EXTENSION_BADGE: Separate visual format indicator
        </text>
        <text x="0" y="32" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          • FULL_PATH: Complete file location below
        </text>
        <text x="0" y="42" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          • DUAL_DISPLAY: Clean name + Badge system
        </text>
        <text x="0" y="52" fill="rgba(0, 255, 255, 0.7)" fontSize="5" fontFamily="monospace">
          • NO_REDUNDANCY: Extension shown once only
        </text>
      </g>

      {/* Component Labels */}
      <g>
        {/* Header Label */}
        <line 
          x1={offsetX + 30} 
          y1={offsetY + 28} 
          x2={offsetX - 20} 
          y2={offsetY + 10}
          stroke="rgba(0, 255, 255, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX - 25} 
          y={offsetY + 8} 
          fill="rgba(0, 255, 255, 0.8)"
          fontSize="5"
          fontFamily="monospace"
          textAnchor="end"
        >
          HEADER_SECTION
        </text>

        {/* Filename Input Label */}
        <line 
          x1={offsetX + nodeWidth/2} 
          y1={offsetY + 64} 
          x2={offsetX + nodeWidth + 20} 
          y2={offsetY + 30}
          stroke="rgba(0, 255, 255, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX + nodeWidth + 25} 
          y={offsetY + 28} 
          fill="rgba(0, 255, 255, 0.8)"
          fontSize="5"
          fontFamily="monospace"
        >
          FILENAME_DISPLAY
        </text>

        {/* File Path Label */}
        <line 
          x1={offsetX + nodeWidth/2} 
          y1={offsetY + 92} 
          x2={offsetX + nodeWidth + 20} 
          y2={offsetY + 50}
          stroke="rgba(0, 255, 255, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX + nodeWidth + 25} 
          y={offsetY + 48} 
          fill="rgba(0, 255, 255, 0.8)"
          fontSize="5"
          fontFamily="monospace"
        >
          FULL_PATH_DISPLAY
        </text>

        {/* Output Handle Label */}
        <line 
          x1={offsetX + nodeWidth + 7} 
          y1={offsetY + nodeHeight/2} 
          x2={offsetX + nodeWidth + 40} 
          y2={offsetY + nodeHeight/2 - 20}
          stroke="rgba(249, 115, 22, 0.5)" 
          strokeWidth="1"
          strokeDasharray="1,1"
        />
        <text 
          x={offsetX + nodeWidth + 45} 
          y={offsetY + nodeHeight/2 - 22} 
          fill="rgba(249, 115, 22, 0.8)"
          fontSize="5"
          fontFamily="monospace"
        >
          VIDEO_OUTPUT
        </text>
      </g>

      {/* Node Info Box */}
      <g transform={`translate(300, 240)`}>
        <rect 
          width="150" 
          height="80"
          fill="rgba(0, 0, 0, 0.6)"
          stroke="rgba(16, 185, 129, 0.4)" 
          strokeWidth="1"
          rx="4"
        />
        <text x="5" y="15" fill="rgba(16, 185, 129, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          NODE_TYPE: INPUT_VIDEO
        </text>
        <text x="5" y="26" fill="rgba(16, 185, 129, 0.7)" fontSize="5" fontFamily="monospace">
          CATEGORY: INPUT_SOURCE
        </text>
        <text x="5" y="37" fill="rgba(16, 185, 129, 0.7)" fontSize="5" fontFamily="monospace">
          INPUTS: 0 (file browser)
        </text>
        <text x="5" y="48" fill="rgba(16, 185, 129, 0.7)" fontSize="5" fontFamily="monospace">
          OUTPUTS: 1 (video stream)
        </text>
        <text x="5" y="59" fill="rgba(16, 185, 129, 0.7)" fontSize="5" fontFamily="monospace">
          FEATURES: Filename extraction
        </text>
        <text x="5" y="70" fill="rgba(16, 185, 129, 0.7)" fontSize="5" fontFamily="monospace">
          SUPPORTS: Cross-platform paths
        </text>
      </g>
    </svg>
  );
};