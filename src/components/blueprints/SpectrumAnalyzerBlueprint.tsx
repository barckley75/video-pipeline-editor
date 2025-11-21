// src/components/blueprints/SpectrumAnalyzerBlueprint.tsx
import React from 'react';

interface SpectrumAnalyzerBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const SpectrumAnalyzerBlueprint: React.FC<SpectrumAnalyzerBlueprintProps> = ({ 
  width = 520, 
  height = 420, 
  scale = 1 
}) => {
  const nodeWidth = 280 * scale; // Matches the actual node maxWidth
  const nodeHeight = 220 * scale; // Taller to accommodate all elements
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 30 * scale;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(0, 4, 15, 0.9)', // Cyberpunk dark theme
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="spectrum-grid" width="15" height="15" patternUnits="userSpaceOnUse">
          <path 
            d="M 15 0 L 0 0 0 15" 
            fill="none" 
            stroke="rgba(0, 255, 255, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Cyberpunk gradient */}
        <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0, 255, 255, 0.1)" />
          <stop offset="50%" stopColor="rgba(0, 128, 255, 0.05)" />
          <stop offset="100%" stopColor="rgba(255, 0, 128, 0.1)" />
        </linearGradient>

        {/* Waveform pattern */}
        <pattern id="waveform-bg" x="0" y="0" width="20" height="8" patternUnits="userSpaceOnUse">
          <rect width="20" height="8" fill="rgba(0, 4, 16, 0.8)"/>
          <polyline 
            points="0,4 3,2 6,6 9,1 12,5 15,3 18,7 20,4" 
            fill="none" 
            stroke="rgba(0, 255, 255, 0.3)" 
            strokeWidth="0.5"
          />
        </pattern>

        {/* Spectrum bars pattern */}
        <pattern id="spectrum-bars" x="0" y="0" width="4" height="20" patternUnits="userSpaceOnUse">
          <rect width="4" height="20" fill="rgba(0, 4, 16, 0.8)"/>
          <rect x="0" y="16" width="4" height="4" fill="rgba(0, 255, 255, 0.6)"/>
          <rect x="0" y="12" width="4" height="3" fill="rgba(0, 128, 255, 0.4)"/>
          <rect x="0" y="10" width="4" height="2" fill="rgba(255, 0, 128, 0.3)"/>
        </pattern>

        {/* Scan line effect */}
        <linearGradient id="scan-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(0, 255, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
        </linearGradient>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#spectrum-grid)" />

      {/* Title */}
      <text 
        x={width/2} 
        y="20" 
        textAnchor="middle" 
        fill="rgba(0, 255, 255, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
      >
        SPECTRUM_ANALYZER_NODE - AUDIO_VISUALIZATION_BLUEPRINT
      </text>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#spectrumGrad)"
          stroke="rgba(0, 255, 255, 0.8)" 
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
          stroke="rgba(0, 255, 255, 0.6)" 
          strokeWidth="1"
          rx="6"
          strokeDasharray="3,2"
        />
        
        <text x="18" y="23" fill="rgba(0, 255, 255, 0.9)" fontSize="5" fontFamily="monospace">
          &gt; AUDIO_SPECTRUM_ANALYZER
        </text>

        {/* Video Preview Area */}
        <rect 
          x="12" 
          y="36" 
          width={nodeWidth - 24} 
          height="45"
          fill="rgba(0, 5, 16, 0.8)"
          stroke="rgba(0, 255, 255, 0.4)" 
          strokeWidth="1"
          rx="6"
        />
        
        <text x="16" y="50" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          VIDEO: sample_video.mp4 | 1920x1080 | 29.97fps
        </text>
        <text x="16" y="58" fill="rgba(255, 0, 128, 0.7)" fontSize="4" fontFamily="monospace">
          AUDIO: AAC 2ch 48kHz | STATUS: STREAMING
        </text>
        <text x="16" y="66" fill="rgba(0, 128, 255, 0.7)" fontSize="4" fontFamily="monospace">
          ENGINE: WebAudio API | FFT: 512 | SMOOTHING: 0.85
        </text>
        <text x="16" y="74" fill="rgba(0, 255, 255, 0.6)" fontSize="4" fontFamily="monospace">
          || LOADING_STREAM...
        </text>

        {/* Visualization Canvas Area */}
        <rect 
          x="12" 
          y="88" 
          width={nodeWidth - 24} 
          height="50"
          fill="url(#waveform-bg)"
          stroke="rgba(0, 255, 255, 0.5)" 
          strokeWidth="1"
          rx="6"
        />

        {/* Canvas Content - showing spectrum bars */}
        <g transform="translate(16, 93)">
          {/* Draw spectrum bars */}
          {Array.from({length: 32}, (_, i) => {
            const x = i * 7.5;
            const height = 8 + Math.sin(i * 0.3) * 15 + Math.random() * 10;
            const intensity = height / 40;
            
            // Color based on intensity
            let color = '#004080';
            if (intensity > 0.8) color = '#ff0080';
            else if (intensity > 0.6) color = '#00ffff';
            else if (intensity > 0.3) color = '#0080ff';
            
            return (
              <rect 
                key={i}
                x={x} 
                y={40 - height} 
                width="6" 
                height={height}
                fill={color}
                opacity={0.7 + intensity * 0.3}
              />
            );
          })}
          
          {/* Frequency labels */}
          <text x="5" y="45" fill="rgba(0, 255, 255, 0.6)" fontSize="3" fontFamily="monospace">
            20Hz
          </text>
          <text x="120" y="45" fill="rgba(0, 255, 255, 0.6)" fontSize="3" fontFamily="monospace">
            1kHz
          </text>
          <text x="220" y="45" fill="rgba(0, 255, 255, 0.6)" fontSize="3" fontFamily="monospace">
            20kHz
          </text>
        </g>

        {/* Scan line effect on canvas */}
        <rect 
          x="30" 
          y="88" 
          width="3" 
          height="50"
          fill="url(#scan-line)"
          opacity="0.8"
        />

        {/* View Mode Selector */}
        <g transform="translate(12, 146)">
          <text x="0" y="8" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
            VIEW_MODE:
          </text>
          
          {/* Mode buttons */}
          <rect x="50" y="0" width="48" height="12" fill="rgba(0, 255, 255, 0.3)" stroke="#00ffff" strokeWidth="1" rx="3"/>
          <text x="74" y="8" textAnchor="middle" fill="#00ffff" fontSize="3" fontFamily="monospace" fontWeight="600">SPECTRUM</text>
          
          <rect x="106" y="0" width="48" height="12" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(0, 255, 255, 0.3)" strokeWidth="1" rx="3"/>
          <text x="130" y="8" textAnchor="middle" fill="rgba(0, 255, 255, 0.6)" fontSize="3" fontFamily="monospace" fontWeight="600">WAVEFORM</text>
          
          <rect x="162" y="0" width="52" height="12" fill="rgba(0, 0, 0, 0.2)" stroke="rgba(0, 255, 255, 0.3)" strokeWidth="1" rx="3"/>
          <text x="188" y="8" textAnchor="middle" fill="rgba(0, 255, 255, 0.6)" fontSize="3" fontFamily="monospace" fontWeight="600">SPECTROGRAM</text>
        </g>

        {/* Control Buttons */}
        <g transform="translate(12, 166)">
          {/* Play/Pause Button */}
          <rect x="0" y="0" width="80" height="16" fill="linear-gradient(45deg, #00a0ff, #00ffff)" stroke="#00ffff" strokeWidth="1" rx="4"/>
          <text x="40" y="10" textAnchor="middle" fill="#fff" fontSize="4" fontFamily="monospace" fontWeight="bold">
            [▶ PLAY]
          </text>
          
          {/* Stop Button */}
          <rect x="88" y="0" width="50" height="16" fill="rgba(255, 0, 128, 0.3)" stroke="rgba(255, 0, 128, 0.6)" strokeWidth="1" rx="4"/>
          <text x="113" y="10" textAnchor="middle" fill="rgba(255, 0, 128, 0.8)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            [⏹ STOP]
          </text>
          
          {/* Clear Button */}
          <rect x="146" y="0" width="50" height="16" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" rx="4"/>
          <text x="171" y="10" textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="4" fontFamily="monospace" fontWeight="bold">
            [CLEAR]
          </text>
        </g>

        {/* Debug Info Display */}
        <rect 
          x="12" 
          y="190" 
          width={nodeWidth - 24} 
          height="20"
          fill="rgba(0, 0, 0, 0.4)"
          stroke="rgba(0, 255, 255, 0.3)" 
          strokeWidth="1"
          rx="4"
        />
        
        <text x="16" y="202" fill="rgba(0, 255, 255, 0.8)" fontSize="3" fontFamily="monospace">
          AUDIO: ONLINE | STATE: ACTIVE | FREQ_ANALYSIS | RMS:45.2 | PEAK:1250Hz | CENTROID:890Hz
        </text>

        {/* Input Handle */}
        <circle cx="0" cy={nodeHeight/2} r="7" fill="none" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="2"/>
        <text x="-35" y={nodeHeight/2 + 3} fill="rgba(249, 115, 22, 0.8)" fontSize="4" fontFamily="monospace">
          VIDEO_IN
        </text>

        {/* Output Handle */}
        <circle cx={nodeWidth} cy={nodeHeight/2} r="7" fill="none" stroke="rgba(0, 255, 255, 0.8)" strokeWidth="2"/>
        <text x={nodeWidth + 10} y={nodeHeight/2 + 3} fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
          AUDIO_OUT
        </text>
      </g>

      {/* Dimension Lines */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 20})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(0, 255, 255, 0.7)" strokeWidth="1"/>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(0, 255, 255, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(0, 255, 255, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(0, 255, 255, 0.7)" fontSize="6" fontFamily="monospace">
          280px - ANALYZER_WIDTH
        </text>
      </g>

      {/* Features Panel */}
      <g transform={`translate(${width - 160}, 50)`}>
        <rect width="150" height="110" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(0, 255, 255, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(0, 255, 255, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          ANALYZER_FEATURES:
        </text>
        
        <text x="5" y="24" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Real-time Audio Analysis
        </text>
        <text x="5" y="32" fill="rgba(0, 128, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • 3 Visualization Modes
        </text>
        <text x="5" y="40" fill="rgba(255, 0, 128, 0.8)" fontSize="5" fontFamily="monospace">
          • WebAudio API Engine
        </text>
        <text x="5" y="48" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Interactive Frequency Display
        </text>
        <text x="5" y="56" fill="rgba(0, 128, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • RMS & Peak Detection
        </text>
        <text x="5" y="64" fill="rgba(255, 0, 128, 0.8)" fontSize="5" fontFamily="monospace">
          • Spectral Centroid Analysis
        </text>
        <text x="5" y="72" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Cyberpunk Visual Effects
        </text>
        <text x="5" y="80" fill="rgba(0, 128, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Hover Frequency Info
        </text>
        <text x="5" y="88" fill="rgba(255, 0, 128, 0.8)" fontSize="5" fontFamily="monospace">
          • Configurable FFT Size
        </text>
        <text x="5" y="96" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Audio Context Management
        </text>
        <text x="5" y="104" fill="rgba(0, 128, 255, 0.8)" fontSize="5" fontFamily="monospace">
          • Scan Line Animations
        </text>
      </g>

      {/* Analysis Pipeline */}
      <g transform="translate(20, 300)">
        <rect width="200" height="80" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(255, 0, 128, 0.4)" strokeWidth="1" rx="4"/>
        <text x="5" y="12" fill="rgba(255, 0, 128, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          AUDIO_ANALYSIS_PIPELINE:
        </text>
        
        <text x="5" y="26" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
          [VIDEO_INPUT] → [AUDIO_EXTRACT] → [WEB_AUDIO_API]
        </text>
        <text x="5" y="34" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
                      ↓
        </text>
        <text x="5" y="42" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
          [FFT_ANALYSIS] → [FREQUENCY_DATA] → [VISUALIZATION]
        </text>
        
        <text x="5" y="56" fill="rgba(0, 128, 255, 0.8)" fontSize="4" fontFamily="monospace">
          MODES: Spectrum | Waveform | Spectrogram
        </text>
        <text x="5" y="64" fill="rgba(255, 0, 128, 0.8)" fontSize="4" fontFamily="monospace">
          METRICS: RMS, Peak Frequency, Spectral Centroid
        </text>
        <text x="5" y="72" fill="rgba(0, 255, 255, 0.8)" fontSize="4" fontFamily="monospace">
          OUTPUT: Real-time audio visualization + passthrough
        </text>
      </g>

      {/* Node Info */}
      <g transform={`translate(${offsetX + 20}, ${offsetY + nodeHeight + 50})`}>
        <text x="0" y="0" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          SPECTRUM | STREAMING | AUDIO_READY
        </text>
      </g>
    </svg>
  );
};