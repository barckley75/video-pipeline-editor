// src/components/blueprints/TrimAudioNodeBlueprint.tsx
import React, { useEffect, useState } from 'react';

interface TrimAudioNodeBlueprintProps {
  width?: number;
  height?: number;
  scale?: number;
}

export const TrimAudioNodeBlueprint: React.FC<TrimAudioNodeBlueprintProps> = ({ 
  width = 500, 
  height = 400, 
  scale = 1 
}) => {
  const nodeWidth = 400 * scale;
  const nodeHeight = 220 * scale;
  const offsetX = (width - nodeWidth) / 2;
  const offsetY = 20 * scale;

  // Random data for HUD effects
  const [randomHex, setRandomHex] = useState('0xA3F2');
  const [cpuLoad, setCpuLoad] = useState(42);
  const [bufferStatus, setBufferStatus] = useState(87);
  const [timestamp, setTimestamp] = useState('00:00:00.000');
  
  useEffect(() => {
    // Random hex codes
    const hexInterval = setInterval(() => {
      setRandomHex(`0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`);
    }, 150);
    
    // CPU load fluctuation
    const cpuInterval = setInterval(() => {
      setCpuLoad(prev => Math.max(35, Math.min(95, prev + (Math.random() - 0.5) * 10)));
    }, 200);
    
    // Buffer status
    const bufferInterval = setInterval(() => {
      setBufferStatus(prev => Math.max(75, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 300);
    
    // Timestamp
    const timeInterval = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toISOString().substr(11, 12));
    }, 100);
    
    return () => {
      clearInterval(hexInterval);
      clearInterval(cpuInterval);
      clearInterval(bufferInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        background: 'rgba(40, 0, 40, 0.9)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        borderRadius: '8px'
      }}
    >
      {/* Grid Pattern */}
      <defs>
        <pattern id="audio-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path 
            d="M 8 0 L 0 0 0 8" 
            fill="none" 
            stroke="rgba(236, 72, 153, 0.15)" 
            strokeWidth="0.5"
          />
        </pattern>
        
        {/* Audio trim gradient */}
        <linearGradient id="audioTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(236, 72, 153, 0.1)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
        </linearGradient>

        {/* Waveform pattern */}
        <pattern id="waveform-bg" x="0" y="0" width="4" height="20" patternUnits="userSpaceOnUse">
          <rect width="4" height="20" fill="rgba(107, 114, 128, 0.2)"/>
          <rect width="1" height="20" fill="rgba(236, 72, 153, 0.2)"/>
        </pattern>

        {/* Selection pattern */}
        <pattern id="audio-selection-bg" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(236, 72, 153, 0.3)"/>
          <rect width="1" height="1" fill="rgba(236, 72, 153, 0.6)"/>
          <rect x="2" y="2" width="1" height="1" fill="rgba(236, 72, 153, 0.6)"/>
        </pattern>

        {/* Scanline effect */}
        <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(0, 255, 255, 0.6)" />
          <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Strong glow */}
        <filter id="strong-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#audio-grid)" />

      {/* Animated corner brackets */}
      <g opacity="0.6">
        <path d="M 10 10 L 10 30 M 10 10 L 30 10" stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" fill="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d={`M ${width-10} 10 L ${width-10} 30 M ${width-10} 10 L ${width-30} 10`} stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" fill="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </path>
        <path d={`M 10 ${height-10} L 10 ${height-30} M 10 ${height-10} L 30 ${height-10}`} stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" fill="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1s" repeatCount="indefinite"/>
        </path>
        <path d={`M ${width-10} ${height-10} L ${width-10} ${height-30} M ${width-10} ${height-10} L ${width-30} ${height-10}`} stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" fill="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </path>
      </g>

      {/* Title with glitch effect */}
      <text 
        x={width/2} 
        y="15" 
        textAnchor="middle" 
        fill="rgba(236, 72, 153, 0.9)"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="1px"
        filter="url(#glow)"
      >
        TRIM_AUDIO_NODE - WAVEFORM_CONTROL_SPECIFICATION
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze"/>
        <animate attributeName="opacity" values="1;0.8;1" dur="0.1s" begin="1s" repeatCount="2"/>
      </text>

      {/* Data stream - top right */}
      <g transform="translate(10, 25)">
        <rect width="120" height="30" fill="rgba(0, 0, 0, 0.7)" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="1" rx="3">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.3s" fill="freeze"/>
        </rect>
        <text x="5" y="10" fill="rgba(0, 255, 255, 0.9)" fontSize="4" fontFamily="monospace">
          SYS_STATUS: ONLINE
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
        </text>
        <text x="5" y="17" fill="rgba(34, 197, 94, 0.8)" fontSize="3" fontFamily="monospace">
          MEM: {randomHex} | CPU: {cpuLoad.toFixed(1)}%
        </text>
        <text x="5" y="23" fill="rgba(251, 191, 36, 0.8)" fontSize="3" fontFamily="monospace">
          BUFF: {bufferStatus.toFixed(1)}% | TIME: {timestamp}
        </text>
      </g>

      {/* Main Node Container */}
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Outer Border with glow */}
        <rect 
          width={nodeWidth} 
          height={nodeHeight}
          fill="url(#audioTrimGrad)"
          stroke="rgba(236, 72, 153, 0.8)" 
          strokeWidth="2"
          rx="12"
          filter="url(#glow)"
        >
          <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze"/>
        </rect>

        {/* Vertical scanning line */}
        <line x1="0" y1="0" x2="0" y2={nodeHeight} stroke="url(#scan-gradient)" strokeWidth="2" opacity="0.5">
          <animate attributeName="x1" from="0" to={nodeWidth} dur="3s" repeatCount="indefinite"/>
          <animate attributeName="x2" from="0" to={nodeWidth} dur="3s" repeatCount="indefinite"/>
        </line>

        {/* Header Section with typing effect */}
        <rect 
          x="16" 
          y="16" 
          width={nodeWidth - 32} 
          height="24"
          fill="none"
          stroke="rgba(236, 72, 153, 0.6)" 
          strokeWidth="1"
          rx="8"
          strokeDasharray="3,2"
        >
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.5s" fill="freeze"/>
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" begin="0.5s" fill="freeze"/>
        </rect>
        
        <text x="24" y="32" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace" filter="url(#glow)">
          &gt; AUDIO_TRIM
          <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.7s" fill="freeze"/>
          <animate attributeName="opacity" values="1;0.7;1;0.8;1" dur="0.08s" begin="1.2s" repeatCount="3"/>
        </text>

        {/* Status indicator with random data */}
        <g transform="translate(260, 20)">
          <text x="0" y="0" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
            [{randomHex}]
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.5s" repeatCount="indefinite"/>
          </text>
        </g>

        {/* Audio Waveform Preview Area */}
        <rect 
          x="16" 
          y="50" 
          width={nodeWidth - 32} 
          height="60"
          fill="rgba(0, 0, 0, 0.4)"
          stroke="rgba(236, 72, 153, 0.6)" 
          strokeWidth="2"
          rx="8"
        >
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.9s" fill="freeze"/>
        </rect>
        
        {/* File info with glitch */}
        <text x="24" y="68" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          🎵 AUDIO_PREVIEW: input_audio.mp3
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze"/>
          <animate attributeName="x" values="24;26;23;24;25;24" dur="0.05s" begin="1.5s" repeatCount="2"/>
        </text>
        
        {/* Specs with flicker */}
        <text x="24" y="78" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          SAMPLE_RATE: 44.1kHz | CHANNELS: 2 (Stereo) | DURATION: 04:32
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.2s" fill="freeze"/>
        </text>
        <text x="24" y="88" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          CODEC: MP3 | BITRATE: 320 kbps | FORMAT: MPEG Layer-3
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.4s" fill="freeze"/>
        </text>
        
        {/* Animated waveform visualization */}
        <g transform="translate(24, 94)">
          {[...Array(28)].map((_, i) => {
            const height = 8 + Math.sin(i * 0.3) * 6;
            return (
              <g key={i}>
                <rect
                  x={i * 12}
                  y={8 - height/2}
                  width="8"
                  height={height}
                  fill="rgba(236, 72, 153, 0.6)"
                  rx="1"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="height"
                    from="0"
                    to={height}
                    dur="0.4s"
                    begin={`${1.6 + i * 0.02}s`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="y"
                    from="8"
                    to={8 - height/2}
                    dur="0.4s"
                    begin={`${1.6 + i * 0.02}s`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    values={`0;1;${0.6 + Math.random() * 0.4}`}
                    dur="0.4s"
                    begin={`${1.6 + i * 0.02}s`}
                    fill="freeze"
                  />
                  {/* Continuous pulse */}
                  <animate
                    attributeName="opacity"
                    values="0.6;0.9;0.6"
                    dur={`${1 + Math.random() * 0.5}s`}
                    begin={`${2.2 + i * 0.02}s`}
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            );
          })}
          
          {/* Scanning line across waveform */}
          <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(0, 255, 255, 0.8)" strokeWidth="2" filter="url(#strong-glow)">
            <animate
              attributeName="x1"
              from="0"
              to="336"
              dur="2s"
              begin="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0"
              to="336"
              dur="2s"
              begin="2.5s"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Timeline Section */}
        <g transform="translate(16, 120)">
          <rect width={nodeWidth - 32} height="40" fill="rgba(0, 0, 0, 0.5)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" rx="6">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="2.2s" fill="freeze"/>
          </rect>
          
          {/* Timeline background with waveform */}
          <rect x="8" y="8" width={nodeWidth - 48} height="8" fill="url(#waveform-bg)" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="1" rx="4">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="2.4s" fill="freeze"/>
          </rect>
          
          {/* Selected range with animation */}
          <rect x={8 + (nodeWidth - 48) * 0.3} y="8" width={(nodeWidth - 48) * 0.4} height="8" fill="url(#audio-selection-bg)" stroke="rgba(236, 72, 153, 0.6)" strokeWidth="1" rx="4">
            <animate attributeName="width" from="0" to={(nodeWidth - 48) * 0.4} dur="0.5s" begin="2.6s" fill="freeze"/>
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" begin="3.1s" repeatCount="indefinite"/>
          </rect>
          
          {/* Start handle with pulse */}
          <rect x={8 + (nodeWidth - 48) * 0.3 - 3} y="5" width="6" height="14" fill="rgba(139, 92, 246, 0.9)" stroke="rgba(139, 92, 246, 0.7)" strokeWidth="1" rx="3" filter="url(#glow)">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="2.8s" fill="freeze"/>
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="3s" repeatCount="indefinite"/>
          </rect>
          
          {/* End handle with pulse (offset) */}
          <rect x={8 + (nodeWidth - 48) * 0.7 - 3} y="5" width="6" height="14" fill="rgba(139, 92, 246, 0.9)" stroke="rgba(139, 92, 246, 0.7)" strokeWidth="1" rx="3" filter="url(#glow)">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3s" fill="freeze"/>
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="3.2s" repeatCount="indefinite"/>
          </rect>
          
          {/* Playhead with strong glow */}
          <line x1={8 + (nodeWidth - 48) * 0.45} y1="3" x2={8 + (nodeWidth - 48) * 0.45} y2="21" stroke="rgba(147, 197, 253, 0.9)" strokeWidth="2" filter="url(#strong-glow)">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.2s" fill="freeze"/>
          </line>
          <circle cx={8 + (nodeWidth - 48) * 0.45} cy="12" r="3" fill="rgba(147, 197, 253, 0.9)" filter="url(#strong-glow)">
            <animate attributeName="r" values="3;4.5;3" dur="1s" begin="3.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" begin="3.4s" repeatCount="indefinite"/>
          </circle>
          
          {/* Time markers with fade in */}
          <text x="8" y="30" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
            00:00
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.4s" fill="freeze"/>
          </text>
          <text x={8 + (nodeWidth - 48) * 0.3} y="30" fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace" filter="url(#glow)">
            01:22 [START]
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.5s" fill="freeze"/>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="3.7s" repeatCount="indefinite"/>
          </text>
          <text x={8 + (nodeWidth - 48) * 0.45} y="30" fill="rgba(147, 197, 253, 0.8)" fontSize="4" fontFamily="monospace">
            02:03 [NOW]
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.6s" fill="freeze"/>
          </text>
          <text x={8 + (nodeWidth - 48) * 0.7} y="30" fill="rgba(139, 92, 246, 0.8)" fontSize="4" fontFamily="monospace" filter="url(#glow)">
            03:11 [END]
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.7s" fill="freeze"/>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="3.9s" repeatCount="indefinite"/>
          </text>
          <text x={nodeWidth - 48} y="30" fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace" textAnchor="end">
            04:32
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="3.8s" fill="freeze"/>
          </text>
        </g>

        {/* Control Section */}
        <g transform="translate(16, 170)">
          <rect width={nodeWidth - 32} height="35" fill="rgba(236, 72, 153, 0.1)" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="1" rx="6">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="3.9s" fill="freeze"/>
          </rect>
          
          <text x="5" y="12" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
            OUTPUT_MODE:
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4s" fill="freeze"/>
          </text>
          
          {/* Animated checkbox */}
          <rect x="5" y="18" width="8" height="8" fill="none" stroke="rgba(236, 72, 153, 0.8)" strokeWidth="1">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.1s" fill="freeze"/>
          </rect>
          <text x="18" y="25" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
            create_trimmed_audio_file
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.2s" fill="freeze"/>
          </text>
          
          {/* Output path with typing effect */}
          <rect x="160" y="15" width="180" height="15" fill="none" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" rx="4" strokeDasharray="2,1">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.3s" fill="freeze"/>
          </rect>
          <text x="165" y="24" fill="rgba(236, 72, 153, 0.7)" fontSize="4" fontFamily="monospace">
            /output/trimmed_audio_001.mp3
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="4.4s" fill="freeze"/>
          </text>
        </g>

        {/* Input Handle with glow */}
        <circle cx="0" cy={nodeHeight/2} r="7" fill="none" stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" filter="url(#glow)">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.5s" fill="freeze"/>
          <animate attributeName="r" values="7;8;7" dur="1.5s" begin="4.7s" repeatCount="indefinite"/>
        </circle>
        <text x="-35" y={nodeHeight/2 + 2} fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          AUDIO_IN
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.6s" fill="freeze"/>
        </text>

        {/* Output Handles with glow */}
        <circle cx={nodeWidth} cy={nodeHeight/2 - 15} r="7" fill="none" stroke="rgba(236, 72, 153, 0.8)" strokeWidth="2" filter="url(#glow)">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.7s" fill="freeze"/>
          <animate attributeName="r" values="7;8;7" dur="1.5s" begin="4.9s" repeatCount="indefinite"/>
        </circle>
        <text x={nodeWidth + 12} y={nodeHeight/2 - 13} fill="rgba(236, 72, 153, 0.8)" fontSize="4" fontFamily="monospace">
          AUDIO_OUT
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.8s" fill="freeze"/>
        </text>
        
        <circle cx={nodeWidth} cy={nodeHeight/2 + 15} r="7" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" filter="url(#glow)">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="4.9s" fill="freeze"/>
          <animate attributeName="r" values="7;8;7" dur="1.5s" begin="5.1s" repeatCount="indefinite"/>
        </circle>
        <text x={nodeWidth + 12} y={nodeHeight/2 + 17} fill="rgba(34, 197, 94, 0.8)" fontSize="4" fontFamily="monospace">
          TRIM_DATA
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="5s" fill="freeze"/>
        </text>
      </g>

      {/* Dimension Lines with animation */}
      <g transform={`translate(${offsetX}, ${offsetY + nodeHeight + 15})`}>
        <line x1="0" y1="0" x2={nodeWidth} y2="0" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1">
          <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="1s" begin="5.1s" fill="freeze"/>
        </line>
        <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <line x1={nodeWidth} y1="-5" x2={nodeWidth} y2="5" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <text x={nodeWidth/2} y="15" textAnchor="middle" fill="rgba(236, 72, 153, 0.8)" fontSize="6" fontFamily="monospace">
          400px
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="5.5s" fill="freeze"/>
        </text>
      </g>

      <g transform={`translate(${offsetX - 30}, ${offsetY})`}>
        <line x1="0" y1="0" x2="0" y2={nodeHeight} stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1">
          <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="1s" begin="5.2s" fill="freeze"/>
        </line>
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <line x1="-5" y1={nodeHeight} x2="5" y2={nodeHeight} stroke="rgba(236, 72, 153, 0.7)" strokeWidth="1"/>
        <text x="-15" y={nodeHeight/2 + 5} textAnchor="middle" fill="rgba(236, 72, 153, 0.8)" fontSize="6" fontFamily="monospace" transform={`rotate(-90, -15, ${nodeHeight/2 + 5})`}>
          220px
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="5.6s" fill="freeze"/>
        </text>
      </g>

      {/* Technical Specifications with sequential fade */}
      <g transform="translate(15, 260)">
        <text x="0" y="0" fill="rgba(236, 72, 153, 0.9)" fontSize="7" fontFamily="monospace" fontWeight="bold" filter="url(#glow)">
          WAVEFORM_SPECIFICATIONS:
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="5.7s" fill="freeze"/>
        </text>
        <text x="0" y="12" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          • PRECISION: Sample-accurate trimming
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="5.9s" fill="freeze"/>
        </text>
        <text x="0" y="22" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          • HANDLES: Draggable start/end markers
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6s" fill="freeze"/>
        </text>
        <text x="0" y="32" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          • PLAYHEAD: Real-time position indicator
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.1s" fill="freeze"/>
        </text>
        <text x="0" y="42" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          • TIMECODE: MM:SS format display
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.2s" fill="freeze"/>
        </text>
        <text x="0" y="52" fill="rgba(236, 72, 153, 0.7)" fontSize="5" fontFamily="monospace">
          • OUTPUT: Audio file + trim parameters
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.3s" fill="freeze"/>
        </text>
      </g>

      {/* Waveform Control Info with animation */}
      <g transform={`translate(${width - 200}, 260)`}>
        <rect width="190" height="90" fill="rgba(0, 0, 0, 0.6)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" rx="4">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="6.4s" fill="freeze"/>
        </rect>
        <text x="5" y="12" fill="rgba(236, 72, 153, 0.9)" fontSize="6" fontFamily="monospace" fontWeight="bold">
          CONTROL_SPECIFICATIONS:
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.5s" fill="freeze"/>
        </text>
        <text x="5" y="24" fill="rgba(34, 197, 94, 0.8)" fontSize="5" fontFamily="monospace">
          START_HANDLE: [████] Trim start point
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.6s" fill="freeze"/>
        </text>
        <text x="5" y="34" fill="rgba(139, 92, 246, 0.8)" fontSize="5" fontFamily="monospace">
          END_HANDLE: [████] Trim end point
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.7s" fill="freeze"/>
        </text>
        <text x="5" y="44" fill="rgba(147, 197, 253, 0.8)" fontSize="5" fontFamily="monospace">
          PLAYHEAD: [●] Current position
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.8s" fill="freeze"/>
        </text>
        <text x="5" y="54" fill="rgba(236, 72, 153, 0.8)" fontSize="5" fontFamily="monospace">
          SELECTION: [████████] Active range
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="6.9s" fill="freeze"/>
        </text>
        <text x="5" y="64" fill="rgba(0, 255, 255, 0.8)" fontSize="5" fontFamily="monospace">
          CONTROLS: Play/Pause/Stop waveform
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="7s" fill="freeze"/>
        </text>
        <text x="5" y="74" fill="rgba(168, 85, 247, 0.8)" fontSize="5" fontFamily="monospace">
          WAVEFORM: Visual audio representation
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="7.1s" fill="freeze"/>
        </text>
        <text x="5" y="84" fill="rgba(245, 101, 101, 0.8)" fontSize="5" fontFamily="monospace">
          OUTPUT_MODE: File + data parameters
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="7.2s" fill="freeze"/>
        </text>
      </g>

      {/* Animated status bar at bottom */}
      <g transform={`translate(${width - 200}, ${height - 20})`}>
        <text x="0" y="0" fill="rgba(0, 255, 255, 0.7)" fontSize="4" fontFamily="monospace">
          STATUS: ONLINE | READY | {randomHex} | {timestamp}
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
        </text>
      </g>
    </svg>
  );
};