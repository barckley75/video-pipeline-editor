// src/components/blueprints/InputNodeAudioBlueprint.tsx
import React from 'react';

interface InputNodeAudioBlueprintProps {
  width: number;
  height: number;
  scale?: number;
}

export const InputNodeAudioBlueprint: React.FC<InputNodeAudioBlueprintProps> = ({ 
  width, 
  height, 
  scale = 1.0 
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const nodeWidth = 200 * scale;
  const nodeHeight = 120 * scale;

  return (
    <div style={{
      width,
      height,
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Grid Background */}
        <defs>
          <pattern id="audio-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(236, 72, 153, 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
          
          {/* Audio Wave Gradient */}
          <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.8)" />
            <stop offset="50%" stopColor="rgba(219, 39, 119, 0.6)" />
            <stop offset="100%" stopColor="rgba(190, 24, 93, 0.4)" />
          </linearGradient>
          
          {/* Audio Glow Effect */}
          <filter id="audioGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width={width} height={height} fill="url(#audio-grid)" />
        
        {/* Main Node Container */}
        <g transform={`translate(${centerX - nodeWidth/2}, ${centerY - nodeHeight/2})`}>
          {/* Node Background */}
          <rect
            width={nodeWidth}
            height={nodeHeight}
            rx="12"
            fill="rgba(236, 72, 153, 0.1)"
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
            filter="url(#audioGlow)"
          />
          
          {/* Header */}
          <rect
            x="8"
            y="8"
            width={nodeWidth - 16}
            height="24"
            rx="6"
            fill="rgba(236, 72, 153, 0.2)"
            stroke="rgba(236, 72, 153, 0.4)"
          />
          
          <text
            x={nodeWidth/2}
            y="24"
            textAnchor="middle"
            fill="rgba(236, 72, 153, 0.9)"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="600"
          >
            &gt; AUDIO_INPUT_SOURCE
          </text>
          
          {/* Audio Waveform Visualization */}
          <g transform="translate(16, 45)">
            {/* Audio file icon */}
            <rect
              x="0"
              y="0"
              width="40"
              height="30"
              rx="4"
              fill="rgba(236, 72, 153, 0.3)"
              stroke="rgba(236, 72, 153, 0.6)"
            />
            
            <text
              x="20"
              y="20"
              textAnchor="middle"
              fill="rgba(236, 72, 153, 0.9)"
              fontSize="8"
              fontFamily="monospace"
            >
              🎵
            </text>
            
            {/* Waveform bars */}
            {[...Array(12)].map((_, i) => {
              const barHeight = 4 + Math.sin(i * 0.8) * 8 + Math.cos(i * 1.2) * 4;
              return (
                <rect
                  key={i}
                  x={50 + i * 10}
                  y={15 - barHeight/2}
                  width="6"
                  height={Math.abs(barHeight)}
                  rx="1"
                  fill="url(#audioGradient)"
                  opacity="0.8"
                >
                  <animate
                    attributeName="height"
                    values={`${Math.abs(barHeight)};${Math.abs(barHeight * 1.5)};${Math.abs(barHeight)}`}
                    dur={`${1.5 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </rect>
              );
            })}
          </g>
          
          {/* Connection Point (Audio Output) */}
          <circle
            cx={nodeWidth - 8}
            cy={nodeHeight/2}
            r="6"
            fill="rgba(236, 72, 153, 0.8)"
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
          />
          
          {/* Format Labels */}
          <g transform={`translate(16, ${nodeHeight - 25})`}>
            <text
              x="0"
              y="0"
              fill="rgba(236, 72, 153, 0.7)"
              fontSize="8"
              fontFamily="monospace"
            >
              [MP3 | WAV | FLAC | M4A | AAC | OGG]
            </text>
          </g>
        </g>
        
        {/* Data Flow Arrow */}
        <g transform={`translate(${centerX + nodeWidth/2 + 20}, ${centerY})`}>
          <path
            d="M 0 0 L 30 0 M 25 -5 L 30 0 L 25 5"
            stroke="rgba(236, 72, 153, 0.8)"
            strokeWidth="2"
            fill="none"
            filter="url(#audioGlow)"
          />
          
          <text
            x="35"
            y="0"
            fill="rgba(236, 72, 153, 0.8)"
            fontSize="9"
            fontFamily="monospace"
            dominantBaseline="middle"
          >
            audio_stream
          </text>
        </g>
        
        {/* Corner Accents */}
        <g transform={`translate(${centerX - nodeWidth/2}, ${centerY - nodeHeight/2})`}>
          <path
            d="M 8 8 L 8 20 M 8 8 L 20 8"
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={`M ${nodeWidth - 8} 8 L ${nodeWidth - 8} 20 M ${nodeWidth - 8} 8 L ${nodeWidth - 20} 8`}
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={`M 8 ${nodeHeight - 8} L 8 ${nodeHeight - 20} M 8 ${nodeHeight - 8} L 20 ${nodeHeight - 8}`}
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d={`M ${nodeWidth - 8} ${nodeHeight - 8} L ${nodeWidth - 8} ${nodeHeight - 20} M ${nodeWidth - 8} ${nodeHeight - 8} L ${nodeWidth - 20} ${nodeHeight - 8}`}
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};