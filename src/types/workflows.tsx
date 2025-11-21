// src/types/workflows.tsx
import type { Node, Edge } from '@xyflow/react';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  category: 'preset' | 'custom';
  createdAt?: string;
}

export const PRESET_WORKFLOWS: Workflow[] = [
  {
    id: 'quick-convert',
    name: 'Quick Convert',
    description: 'Simple video format conversion',
    category: 'preset',
    nodes: [
      {
        id: 'input-1',
        type: 'inputVideo',
        position: { x: 100, y: 200 },
        data: { filePath: '' }
      },
      {
        id: 'convert-1',
        type: 'convertVideo',
        position: { x: 400, y: 200 },
        data: { 
          format: 'mp4', 
          quality: 'medium', 
          outputPath: '',
          useGPU: false,
          gpuType: 'auto'
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'input-1',
        target: 'convert-1',
        sourceHandle: 'video-output',
        targetHandle: 'video-input'
      }
    ]
  },
  {
    id: 'quality-analysis',
    name: 'Quality Analysis',
    description: 'Compare two videos with VMAF',
    category: 'preset',
    nodes: [
      {
        id: 'ref-1',
        type: 'inputVideo',
        position: { x: 100, y: 150 },
        data: { filePath: '' }
      },
      {
        id: 'test-1',
        type: 'inputVideo',
        position: { x: 100, y: 350 },
        data: { filePath: '' }
      },
      {
        id: 'vmaf-1',
        type: 'vmafAnalysis',
        position: { x: 400, y: 250 },
        data: {
          model: 'default',
          pooling: 'mean',
          outputFormat: 'json',
          confidenceInterval: true
        }
      }
    ],
    edges: [
      {
        id: 'e1-3',
        source: 'ref-1',
        target: 'vmaf-1',
        sourceHandle: 'video-output',
        targetHandle: 'reference-input'
      },
      {
        id: 'e2-3',
        source: 'test-1',
        target: 'vmaf-1',
        sourceHandle: 'video-output',
        targetHandle: 'test-input'
      }
    ]
  },
  {
    id: 'frame-extraction',
    name: 'Frame Extraction',
    description: 'Extract frames from video',
    category: 'preset',
    nodes: [
      {
        id: 'input-1',
        type: 'inputVideo',
        position: { x: 100, y: 200 },
        data: { filePath: '' }
      },
      {
        id: 'sequence-1',
        type: 'sequenceExtract',
        position: { x: 400, y: 200 },
        data: {
          format: 'png',
          compression: 'medium',
          size: 'original',
          outputPath: '',
          fps: 'original',
          quality: 'high'
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'input-1',
        target: 'sequence-1',
        sourceHandle: 'video-output',
        targetHandle: 'video-input'
      }
    ]
  }
];