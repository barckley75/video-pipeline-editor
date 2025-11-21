// src/components/layout/NodeMenu.tsx

/**
 * 📋 NODE CREATION MENU
 * 
 * Categorized menu for creating new nodes. Shows on TAB key press.
 * Displays blueprints on hover for visual preview.
 * 
 * COMMUNICATES WITH:
 * ├── hooks/useNodeManagement.tsx - createNode() callback
 * ├── constants/nodeTypes.tsx - NODE_MENU_ITEMS, NODE_CATEGORIES
 * ├── All blueprint components - Visual previews
 * └── App.tsx - Visibility state
 * 
 * CATEGORIES:
 * - INPUT: Video and audio source nodes
 * - PROCESSING: Converters, trimmers, extractors
 * - OUTPUT: Preview and display nodes
 * - ANALYSIS: Metadata and quality analysis nodes
 * 
 * INTERACTION:
 * - TAB: Open menu
 * - ESC: Close menu
 * - Click category: Expand/collapse
 * - Click node: Create and close
 * - Hover node: Show blueprint preview
 */

import React, { useState } from 'react';
import { NODE_MENU_ITEMS, FONT_FAMILY } from '../../constants/nodeTypes';
import { ConvertNodeBlueprint } from '../blueprints/ConvertNodeBlueprint';
import { ConvertAudioNodeBlueprint } from '../blueprints/ConvertAudioNodeBlueprint';
import { InputNodeBlueprint } from '../blueprints/InputNodeBlueprint';
import { InputNodeAudioBlueprint } from '../blueprints/InputNodeAudioBlueprint';
import { SequenceExtractBlueprint } from '../blueprints/SequenceExtractBlueprint';
import { TrimNodeBlueprint } from '../blueprints/TrimNodeBlueprint';
import { TrimAudioNodeBlueprint } from '../blueprints/TrimAudioNodeBlueprint';
import { ViewNodeBlueprint } from '../blueprints/ViewNodeBlueprint';
import { VideoPreview2Blueprint } from '../blueprints/VideoPreview2Blueprint';
import { InfoVideoNodeBlueprint } from '../blueprints/InfoVideoNodeBlueprint';
import { InfoAudioNodeBlueprint } from '../blueprints/InfoAudioNodeBlueprint';
import { VmafAnalysisBlueprint } from '../blueprints/VmafAnalysisBlueprint';
import { SpectrumAnalyzerBlueprint } from '../blueprints/SpectrumAnalyzerBlueprint';
import type { MousePosition } from '../../types/pipeline';

interface NodeMenuProps {
  isVisible: boolean;
  mousePosition: MousePosition;
  onCreateNode: (menuItem: typeof NODE_MENU_ITEMS[number]) => void;
}

// Enhanced node data with categories and descriptions - UPDATED INPUT AND ANALYSIS SECTIONS
const NODE_CATEGORIES = {
  INPUT: {
    name: 'INPUT_SOURCES',
    color: 'rgba(16, 185, 129, 0.8)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    nodes: ['input', 'input_audio']
  },
  PROCESSING: {
    name: 'PROCESSING_UNITS',
    color: 'rgba(59, 130, 246, 0.8)', 
    glowColor: 'rgba(59, 130, 246, 0.4)',
    nodes: ['convert', 'convert_audio', 'sequence', 'trim', 'trim_audio']
  },
  OUTPUT: {
    name: 'OUTPUT_DISPLAYS',
    color: 'rgba(168, 85, 247, 0.8)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    nodes: ['view', 'grid']
  },
  ANALYSIS: {
    name: 'ANALYSIS_TOOLS',
    color: 'rgba(245, 101, 101, 0.8)',
    glowColor: 'rgba(245, 101, 101, 0.4)',
    nodes: ['info', 'info_audio', 'vmaf', 'spectrum']
  }
};

// UPDATED: Added info_audio description
const NODE_DESCRIPTIONS = {
  input: {
    title: 'VIDEO_INPUT_SOURCE',
    description: 'Loads video files from disk. Supports MP4, AVI, MOV, MKV formats.',
    blueprint: '🎬 → [INPUT] → 🎬',
    connections: 'OUTPUT: Video stream'
  },
  input_audio: {
    title: 'AUDIO_INPUT_SOURCE',
    description: 'Loads audio files from disk. Supports MP3, WAV, FLAC, M4A, AAC, OGG formats.',
    blueprint: '🎵 → [INPUT] → 📊',
    connections: 'OUTPUT: Audio stream'
  },
  convert: {
    title: 'FORMAT_CONVERTER',
    description: 'Converts video between formats with quality control and GPU acceleration.',
    blueprint: '🎬 → [CONVERT] → 📦',
    connections: 'INPUT: Video | OUTPUT: Converted video'
  },
  convert_audio: {
    title: 'AUDIO_CONVERTER',
    description: 'Converts audio between formats with quality control and processing options.',
    blueprint: '🎵 → [CONVERT] → 🎧',
    connections: 'INPUT: Audio | OUTPUT: Converted audio'
  },
  view: {
    title: 'VIDEO_PREVIEW',
    description: 'Real-time video playback with browser-compatible preview.',
    blueprint: '🎬 → [PREVIEW] → 👁️',
    connections: 'INPUT: Video stream'
  },
  grid: {
    title: 'GRID_DISPLAY',
    description: 'Enhanced video viewer with grid layout and advanced controls.',
    blueprint: '🎬 → [GRID_VIEW] → 📱',
    connections: 'INPUT: Video stream'
  },
  sequence: {
    title: 'FRAME_EXTRACTOR',
    description: 'Extracts individual frames as image sequences with compression options.',
    blueprint: '🎬 → [EXTRACT] → 🖼️',
    connections: 'INPUT: Video | OUTPUT: Image sequence'
  },
  trim: {
    title: 'VIDEO_TRIMMER',
    description: 'Precise video trimming with frame-accurate cutting and preview.',
    blueprint: '🎬 → [TRIM] → ✂️',
    connections: 'INPUT: Video | OUTPUT: Trimmed video'
  },
  trim_audio: {
    title: 'AUDIO_TRIMMER',
    description: 'Precise audio trimming with time-accurate cutting and preview.',
    blueprint: '🎵 → [TRIM] → ✂️',
    connections: 'INPUT: Audio | OUTPUT: Trimmed audio'
  },
  info: {
    title: 'METADATA_ANALYZER',
    description: 'Analyzes video properties including codecs, resolution, bitrate.',
    blueprint: '🎬 → [ANALYZE] → 📊',
    connections: 'INPUT: Video stream'
  },
  info_audio: {
    title: 'AUDIO_METADATA_ANALYZER',
    description: 'Analyzes audio properties including codecs, sample rate, bitrate, and quality metrics.',
    blueprint: '🎵 → [ANALYZE] → 📈',
    connections: 'INPUT: Audio stream'
  },
  vmaf: {
    title: 'QUALITY_ASSESSOR',
    description: 'VMAF perceptual video quality analysis with detailed metrics.',
    blueprint: '🎬 → [VMAF] → 📈',
    connections: 'INPUT: Original & Processed video'
  },
  spectrum: {
    title: 'SPECTRUM_ANALYZER',
    description: 'Audio spectrum analysis with frequency visualization.',
    blueprint: '🎵 → [SPECTRUM] → 📡',
    connections: 'INPUT: Audio stream'
  }
};

export const NodeMenu: React.FC<NodeMenuProps> = ({ isVisible, onCreateNode }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [_hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  // Categories start collapsed when opened with TAB
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    INPUT: false,
    PROCESSING: false,
    OUTPUT: false,
    ANALYSIS: false
  });

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        left: 20,
        top: 100,
        zIndex: 1000,
        fontFamily: FONT_FAMILY,
        display: 'flex',
        gap: '24px'
      }}
    >
      {/* Main Menu Panel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        minWidth: '280px',
        boxShadow: '0 12px 48px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated border effect */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)',
          animation: 'hologram-scan 3s forwards',
          pointerEvents: 'none'
        }} />
        
        {/* Holographic corner accents */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          border: '2px solid rgba(0, 255, 255, 0.6)',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: '4px 0 0 0'
        }} />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          border: '2px solid rgba(0, 255, 255, 0.6)',
          borderLeft: 'none',
          borderBottom: 'none',
          borderRadius: '0 4px 0 0'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          border: '2px solid rgba(0, 255, 255, 0.6)',
          borderRight: 'none',
          borderTop: 'none',
          borderRadius: '0 0 0 4px'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          border: '2px solid rgba(0, 255, 255, 0.6)',
          borderLeft: 'none',
          borderTop: 'none',
          borderRadius: '0 0 4px 0'
        }} />

        {/* Header */}
        <div style={{
          fontSize: '12px',
          color: 'rgba(0, 255, 255, 0.9)',
          marginBottom: '20px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 0 12px rgba(0, 255, 255, 0.6)',
          borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
          paddingBottom: '12px'
        }}>
          &gt; FFMPEG_NODE_ASSEMBLY
        </div>

        {/* Categories */}
        {Object.entries(NODE_CATEGORIES).map(([categoryKey, category]) => {
          const isExpanded = expandedCategories[categoryKey];
          
          return (
            <div key={categoryKey} style={{ marginBottom: '16px' }}>
              {/* Clickable Category Header */}
              <div 
                style={{
                  fontSize: '10px',
                  color: category.color,
                  marginBottom: '8px',
                  letterSpacing: '1.2px',
                  textShadow: `0 0 8px ${category.glowColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.3s ease',
                  padding: '4px 0'
                }}
                onMouseEnter={() => setHoveredCategory(categoryKey)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => toggleCategory(categoryKey)}
              >
                {/* Expand/Collapse Arrow */}
                <div style={{
                  fontSize: '8px',
                  color: category.color,
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  width: '10px',
                  textAlign: 'center'
                }}>
                  ▶
                </div>
                
                <div style={{
                  width: '2px',
                  height: '10px',
                  background: `linear-gradient(180deg, ${category.color} 0%, transparent 100%)`,
                  boxShadow: `0 0 4px ${category.glowColor}`
                }} />
                
                {category.name}
                
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: `linear-gradient(90deg, ${category.glowColor} 0%, transparent 100%)`
                }} />
              </div>

              {/* Category Nodes - Conditionally Rendered */}
              {isExpanded && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px',
                  marginLeft: '16px',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  {category.nodes.map((nodeId) => {
                    const item = NODE_MENU_ITEMS.find(i => i.id === nodeId);
                    if (!item) return null;
                    
                    const isHovered = hoveredNode === nodeId;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onCreateNode(item)}
                        onMouseEnter={() => setHoveredNode(nodeId)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          padding: '8px 12px',
                          background: isHovered 
                            ? `linear-gradient(135deg, ${item.color.replace('0.2', '0.3')} 0%, ${item.color.replace('0.2', '0.1')} 100%)`
                            : `linear-gradient(135deg, ${item.color} 0%, transparent 100%)`,
                          color: isHovered ? item.borderColor.replace('0.5', '0.9') : 'rgba(224, 242, 254, 0.9)',
                          border: `1px solid ${isHovered ? item.borderColor : item.borderColor.replace('0.5', '0.3')}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '9px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.3s ease',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          position: 'relative',
                          overflow: 'hidden',
                          textShadow: isHovered ? `0 0 8px ${item.borderColor.replace('0.5', '0.6')}` : 'none',
                          boxShadow: isHovered 
                            ? `0 4px 20px ${item.borderColor.replace('0.5', '0.4')}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                            : '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {/* Holographic scan line on hover */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent 0%, ${item.borderColor.replace('0.5', '0.4')} 50%, transparent 100%)`,
                            animation: 'scan-line 0.6s ease-out'
                          }} />
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          fontSize: '8px',
          color: 'rgba(0, 255, 255, 0.6)',
          marginTop: '16px',
          textAlign: 'center',
          letterSpacing: '0.5px',
          borderTop: '1px solid rgba(0, 255, 255, 0.1)',
          paddingTop: '12px'
        }}>
          [ESC] terminate_session | [CLICK] expand_categories
        </div>
      </div>

      {/* Blueprint Preview Panel */}
      {hoveredNode && (
        <div style={{
          background: 'transparent',
          border: 'none',
          borderRadius: '12px',
          padding: '0',
          width: '500px',
          height: '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {(() => {
            const desc = NODE_DESCRIPTIONS[hoveredNode as keyof typeof NODE_DESCRIPTIONS];
            if (!desc) return null;
            
            return (
              <>
                {/* Blueprint Component */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {hoveredNode === 'input' && (
                    <InputNodeBlueprint width={500} height={400} />
                  )}
                  {hoveredNode === 'input_audio' && (
                    <InputNodeAudioBlueprint width={500} height={400} />
                  )}
                  {hoveredNode === 'info' && (
                    <InfoVideoNodeBlueprint width={520} height={420} scale={1.0} />
                  )}
                  {hoveredNode === 'info_audio' && (  // NEW: Audio info blueprint
                    <InfoAudioNodeBlueprint width={500} height={400} scale={1.0} />
                  )}
                  {hoveredNode === 'convert' && (
                    <ConvertNodeBlueprint width={500} height={400} scale={1.2} />
                  )}
                  {hoveredNode === 'convert_audio' && (
                    <ConvertAudioNodeBlueprint width={500} height={400} scale={1.2} />
                  )}
                  {hoveredNode === 'trim' && (
                    <TrimNodeBlueprint width={500} height={400} scale={1.0} />
                  )}
                  {hoveredNode === 'trim_audio' && (
                    <TrimAudioNodeBlueprint width={500} height={400} scale={1.0} />
                  )}
                  {hoveredNode === 'view' && (
                    <ViewNodeBlueprint width={500} height={400} scale={1.2} />
                  )}
                  {hoveredNode === 'sequence' && (
                    <SequenceExtractBlueprint width={500} height={400} scale={1.0} />
                  )}
                  {hoveredNode === 'grid' && (
                    <VideoPreview2Blueprint width={500} height={400} scale={1.0} />
                  )}
                  {hoveredNode === 'spectrum' && (
                    <SpectrumAnalyzerBlueprint width={520} height={420} scale={1.0} />
                  )}
                  {hoveredNode === 'vmaf' && (
                    <VmafAnalysisBlueprint width={500} height={400} scale={1.0} />
                  )}
                  {/* Fallback for nodes without blueprints */}
                  {!['input', 'input_audio', 'info_audio', 'convert', 'convert_audio', 'trim', 'trim_audio', 'view', 'sequence', 'vmaf', 'grid', 'info', 'spectrum'].includes(hoveredNode) && (
                    <div style={{
                      color: 'rgba(0, 255, 255, 0.6)',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      textAlign: 'center'
                    }}>
                      BLUEPRINT_NOT_AVAILABLE<br />
                      <span style={{ fontSize: '8px' }}>
                        [{hoveredNode.toUpperCase()}_BLUEPRINT.TSX]
                      </span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes hologram-scan {
          0% { transform: translateX(-100%) skewX(-45deg); }
          100% { transform: translateX(300%) skewX(-45deg); }
        }
        
        @keyframes scan-line {
          0% { left: '-100%'; }
          100% { left: '100%'; }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};