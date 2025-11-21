// src/constants/nodeTypes.ts

/**
 * 🎯 GLOBAL CONSTANTS & CONFIGURATION
 * 
 * Central configuration file for node types, menu items, styling, and layout.
 * Single source of truth for all node definitions.
 * 
 * USED BY:
 * ├── ALL node components - Type constants
 * ├── hooks/useNodeManagement.tsx - Node registration
 * ├── components/layout/NodeMenu.tsx - Menu items
 * ├── components/layout/FlowCanvas.tsx - Validation rules
 * ├── services/nodeDataPropagation.tsx - Type checking
 * ├── services/pipelineExecution.tsx - Validation
 * └── All layout components - Theme and sizing
 * 
 * EXPORTS:
 * - NODE_TYPES: Type string constants
 * - NODE_MENU_ITEMS: Node creation definitions
 * - INITIAL_NODES/EDGES: Default canvas state
 * - LAYOUT_CONFIG: Dimensions and viewport
 * - THEME_COLORS: Color schemes and gradients
 * - FONT_FAMILY: Monospace font stack
 * - KEYBOARD_SHORTCUTS: Shortcut key definitions
 */

import type { Node, Edge } from '@xyflow/react';

// Node type constants
export const NODE_TYPES = {
  INPUT_VIDEO: 'inputVideo',
  INPUT_AUDIO: 'inputAudio',
  VIEW_VIDEO: 'viewVideo',
  CONVERT_VIDEO: 'convertVideo',
  CONVERT_AUDIO: 'convertAudio',
  INFO_VIDEO: 'infoVideo',
  INFO_AUDIO: 'infoAudio',
  GRID_VIEW: 'gridView',
  SEQUENCE_EXTRACT: 'sequenceExtract',
  TRIM_VIDEO: 'trimVideo',
  TRIM_AUDIO: 'trimAudio',
  VMAF_ANALYSIS: 'vmafAnalysis',
  SPECTRUM_ANALYZER: 'spectrumAnalyzer'
} as const;

// Node menu items configuration
export const NODE_MENU_ITEMS = [
  {
    id: 'input',
    type: NODE_TYPES.INPUT_VIDEO,
    label: 'INPUT_VIDEO',
    color: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    hoverColor: 'rgba(16, 185, 129, 0.3)',
    defaultData: { filePath: '' }
  },
  {
    id: 'input_audio',
    type: NODE_TYPES.INPUT_AUDIO,
    label: 'INPUT_AUDIO',
    color: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    hoverColor: 'rgba(236, 72, 153, 0.3)',
    defaultData: { filePath: '' }
  },
  {
    id: 'convert',
    type: NODE_TYPES.CONVERT_VIDEO,
    label: 'CONVERT_VIDEO',
    color: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    hoverColor: 'rgba(59, 130, 246, 0.3)',
    defaultData: { 
      format: 'mp4', 
      quality: 'medium', 
      outputPath: '', 
      useGPU: false, 
      gpuType: 'auto' 
    }
  },
  {
    id: 'convert_audio',
    type: NODE_TYPES.CONVERT_AUDIO,
    label: 'CONVERT_AUDIO',
    color: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    hoverColor: 'rgba(59, 130, 246, 0.3)',
    defaultData: { 
      format: 'mp3', 
      quality: 'medium', 
      outputPath: '', 
      sampleRate: 'original',
      bitrate: 'auto',
      bitrateMode: 'auto',
      customBitrate: '',
      vbrQuality: '5',
      channels: 'original',
      codec: 'mp3',
      normalize: false,
      volumeGain: '0'
    }
  },
  {
    id: 'sequence',
    type: NODE_TYPES.SEQUENCE_EXTRACT,
    label: 'SEQUENCE_EXTRACT',
    color: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
    hoverColor: 'rgba(251, 191, 36, 0.3)',
    defaultData: {
      format: 'png',
      compression: 'medium',
      size: 'original',
      outputPath: '',
      fps: 'original',
      quality: 'high'
    }
  },
  {
    id: 'view',
    type: NODE_TYPES.VIEW_VIDEO,
    label: 'VIDEO_PREVIEW_01',
    color: 'rgba(168, 85, 247, 0.2)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    hoverColor: 'rgba(168, 85, 247, 0.3)',
    defaultData: { videoPath: undefined }
  },
  {
    id: 'grid',
    type: NODE_TYPES.GRID_VIEW,
    label: 'VIDEO_PREVIEW_02',
    color: 'rgba(245, 101, 101, 0.2)',
    borderColor: 'rgba(245, 101, 101, 0.5)',
    hoverColor: 'rgba(245, 101, 101, 0.3)',
    defaultData: { videoPath: undefined, gridSize: 3 }
  },
  {
    id: 'info',
    type: NODE_TYPES.INFO_VIDEO,
    label: 'VIDEO_METADATA',
    color: 'rgba(245, 101, 101, 0.2)',
    borderColor: 'rgba(245, 101, 101, 0.5)',
    hoverColor: 'rgba(245, 101, 101, 0.3)',
    defaultData: { metadata: null }
  },
  {
    id: 'info_audio',
    type: NODE_TYPES.INFO_AUDIO,
    label: 'AUDIO_METADATA',
    color: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    hoverColor: 'rgba(236, 72, 153, 0.3)',
    defaultData: { metadata: null }
  },
  {
    id: 'trim',
    type: NODE_TYPES.TRIM_VIDEO,
    label: 'VIDEO_TRIM',
    color: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    hoverColor: 'rgba(236, 72, 153, 0.3)',
    
    defaultData: { 
      startTime: 0, 
      endTime: 60, 
      duration: 60 
    }
  },
  {
    id: 'trim_audio',
    type: NODE_TYPES.TRIM_AUDIO,
    label: 'AUDIO_TRIM',
    color: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    hoverColor: 'rgba(236, 72, 153, 0.3)',
    defaultData: { 
      startTime: 0, 
      endTime: 60, 
      duration: 60 
    }
  },
  {
    id: 'vmaf',
    type: NODE_TYPES.VMAF_ANALYSIS,
    label: 'VMAF_QUALITY',
    color: 'rgba(255, 20, 147, 0.2)',
    borderColor: 'rgba(255, 20, 147, 0.5)',
    hoverColor: 'rgba(255, 20, 147, 0.3)',
    defaultData: { 
      model: 'default',
      pooling: 'mean',
      outputFormat: 'json',
      confidenceInterval: true
    }
  },
  {
    id: 'spectrum',
    type: NODE_TYPES.SPECTRUM_ANALYZER,
    label: 'SPECTRUM_ANALYZER',
    color: 'rgba(0, 255, 255, 0.2)',
    borderColor: 'rgba(0, 255, 255, 0.5)',
    hoverColor: 'rgba(0, 255, 255, 0.3)',
    defaultData: { 
      audioFile: '',
      sensitivity: 80,
      smoothing: 0.8,
      barCount: 64,
      showFreqLabels: true,
      gainBoost: 1.5
    }
  }
] as const;

// Initial nodes configuration
export const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: NODE_TYPES.INPUT_VIDEO,
    position: { x: 300, y: 200 },
    data: { filePath: '' },
  },
];

// Initial edges configuration
export const INITIAL_EDGES: Edge[] = [];

// App layout constants
export const LAYOUT_CONFIG = {
  TOOLBAR_HEIGHT: 70,
  STATUS_BAR_HEIGHT: 32,
  NODE_MENU_WIDTH: 220,
  DEFAULT_ZOOM: 0.8,
  DEFAULT_VIEWPORT: { x: 0, y: 0, zoom: 0.8 }
} as const;

// Styling constants
export const THEME_COLORS = {
  PRIMARY_GRADIENT: 'linear-gradient(135deg, #10b981, #06d6a0)',
  BACKGROUND_GRADIENT: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  TOOLBAR_GRADIENT: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)',
  MENU_GRADIENT: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
  EXECUTE_BUTTON: {
    IDLE: 'rgba(239, 68, 68, 0.3)',
    HOVER: 'rgba(239, 68, 68, 0.4)',
    DISABLED: 'rgba(107, 114, 128, 0.3)'
  }
} as const;

// Font configuration
export const FONT_FAMILY = '"JetBrains Mono", "Fira Code", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace';

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CLOSE_NODE_MENU: 'Escape'
} as const;