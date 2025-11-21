// src/hooks/useNodeManagement.tsx

/**
 * 🏗️ NODE TYPE REGISTRY & CREATION
 * 
 * Manages node type registration and node creation logic.
 * Maps node type strings to React components with callbacks.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Provides nodeTypes and createNode
 * ├── ALL node components in nodes/ - Registers each type
 * ├── constants/nodeTypes.tsx - NODE_TYPES and MENU_ITEMS
 * └── hooks/usePipeline.tsx - Uses updateNodeData callback
 * 
 * EXPORTS:
 * - nodeTypes: Map of type → React component
 * - createNode(): Factory function for new nodes
 * 
 * REGISTERED NODES:
 * - inputVideo, inputAudio
 * - convertVideo, convertAudio
 * - viewVideo, gridView
 * - infoVideo, infoAudio
 * - trimVideo, trimAudio
 * - sequenceExtract
 * - vmafAnalysis
 * - spectrumAnalyzer
 */

import { useCallback, useMemo } from 'react';
import type { Node } from '@xyflow/react';

import InputVideoNode from '../nodes/InputVideoNode';
import InputAudioNode from '../nodes/InputAudioNode';
import InfoVideoNode from '../nodes/InfoVideoNode';
import InfoAudioNode from '../nodes/InfoAudioNode';
import ConvertVideoNode from '../nodes/ConvertVideoNode';
import ConvertAudioNode from '../nodes/ConvertAudioNode';
import SequenceExtractNode from '../nodes/SequenceExtractNode';
import ViewVideoNode from '../nodes/ViewVideoNode';
import GridViewNode from '../nodes/GridViewNode';
import TrimVideoNode from '../nodes/TrimVideoNode';
import TrimAudioNode from '../nodes/TrimAudioNode';
import VmafAnalysisNode from '../nodes/VmafAnalysisNode';
import SpectrumAnalyzerNode from '../nodes/SpectrumAnalyzerNode';

import { NODE_TYPES, NODE_MENU_ITEMS } from '../constants/nodeTypes';
import type { MousePosition, NodeUpdateCallback } from '../types/pipeline';

/**
 * Custom hook for managing node creation and node types
 */
export const useNodeManagement = (
  mousePosition: MousePosition,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setShowNodeMenu: (show: boolean) => void,
  updateNodeData: NodeUpdateCallback
) => {
  // Create node types with update callback
  const nodeTypes = useMemo(() => ({
    [NODE_TYPES.INPUT_VIDEO]: (props: any) => <InputVideoNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.INPUT_AUDIO]: (props: any) => <InputAudioNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.INFO_VIDEO]: (props: any) => <InfoVideoNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.INFO_AUDIO]: (props: any) => <InfoAudioNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.CONVERT_VIDEO]: (props: any) => <ConvertVideoNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.CONVERT_AUDIO]: (props: any) => <ConvertAudioNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.SEQUENCE_EXTRACT]: (props: any) => <SequenceExtractNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.VIEW_VIDEO]: (props: any) => <ViewVideoNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.GRID_VIEW]: (props: any) => <GridViewNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.TRIM_VIDEO]: (props: any) => <TrimVideoNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.TRIM_AUDIO]: (props: any) => <TrimAudioNode {...props} onDataUpdate={updateNodeData} />,
    'vmafAnalysis': (props: any) => <VmafAnalysisNode {...props} onDataUpdate={updateNodeData} />,
    [NODE_TYPES.SPECTRUM_ANALYZER]: (props: any) => <SpectrumAnalyzerNode {...props} onDataUpdate={updateNodeData} />,
  }), [updateNodeData]);

  // Generic node creation function
  const createNode = useCallback((menuItem: typeof NODE_MENU_ITEMS[number]) => {
    const id = `${menuItem.id}-${Date.now()}`;
    const newNode: Node = {
      id,
      type: menuItem.type,
      position: { x: mousePosition.x - 110, y: mousePosition.y - 100 },
      data: { ...menuItem.defaultData }, // Spread to avoid reference issues
    };
    setNodes((nds) => [...nds, newNode]); // Use spread instead of concat
    setShowNodeMenu(false);
  }, [setNodes, mousePosition, setShowNodeMenu]);

  return {
    nodeTypes,
    createNode,
  };
};