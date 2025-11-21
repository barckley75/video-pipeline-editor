// src/hooks/useCopyPaste.tsx

/**
 * 📋 COPY/PASTE FUNCTIONALITY
 * 
 * Manages clipboard operations for nodes and edges. Handles copy, paste,
 * duplicate, and delete operations with ID remapping.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Receives pipeline state and change handlers
 * ├── hooks/useKeyboardShortcuts.tsx - Triggered by keyboard events
 * └── hooks/usePipeline.tsx - Uses nodes/edges state
 * 
 * OPERATIONS:
 * - copySelection(): Copy selected nodes + internal edges
 * - pasteSelection(): Paste with offset and new IDs
 * - duplicateSelection(): Copy + paste in one action
 * - deleteSelection(): Remove nodes and connected edges
 * - hasClipboardData(): Check if clipboard has data
 * 
 * FEATURES:
 * - ID remapping for pasted nodes
 * - Position offset to avoid overlap
 * - Internal edge preservation
 * - Runtime state reset on paste
 */

import { useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface CopyPasteData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface UseCopyPasteProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export const useCopyPaste = ({
  edges,
  selectedNodes,
  selectedEdges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges
}: UseCopyPasteProps) => {
  const clipboardRef = useRef<CopyPasteData | null>(null);

  // Copy selected nodes and their internal connections
  const copySelection = useCallback(() => {
    if (selectedNodes.length === 0) {
      console.log('[Copy] No nodes selected');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    
    // Get edges that connect selected nodes (internal connections)
    const internalEdges = edges.filter(edge => 
      selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
    );

    const copyData: CopyPasteData = {
      nodes: selectedNodes,
      edges: internalEdges,
      timestamp: Date.now()
    };

    clipboardRef.current = copyData;
    
    console.log(`[Copy] Copied ${selectedNodes.length} nodes and ${internalEdges.length} edges`);
    
    return {
      nodeCount: selectedNodes.length,
      edgeCount: internalEdges.length
    };
  }, [selectedNodes, selectedEdges, edges]);

  // Paste nodes with offset and new IDs
  const pasteSelection = useCallback((offsetX: number = 50, offsetY: number = 50) => {
    if (!clipboardRef.current) {
      console.log('[Paste] Nothing in clipboard');
      return;
    }

    const { nodes: copiedNodes, edges: copiedEdges } = clipboardRef.current;
    
    // Generate new IDs for pasted nodes
    const idMapping = new Map<string, string>();
    const timestamp = Date.now();
    
    copiedNodes.forEach(node => {
      const newId = `${node.type}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
      idMapping.set(node.id, newId);
    });

    // Create new nodes with offset positions and new IDs
    const newNodes: Node[] = copiedNodes.map(node => {
      const newId = idMapping.get(node.id)!;
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY
        },
        selected: true,
        data: {
          ...node.data,
          // Reset any runtime state
          videoPath: undefined,
          metadata: undefined,
          isAnalyzing: false,
          error: null
        }
      };
    });

    // Create new edges with updated node IDs
    const newEdges: Edge[] = copiedEdges.map(edge => {
      const newSourceId = idMapping.get(edge.source)!;
      const newTargetId = idMapping.get(edge.target)!;
      const newEdgeId = `${newSourceId}-${newTargetId}-${timestamp}`;
      
      return {
        ...edge,
        id: newEdgeId,
        source: newSourceId,
        target: newTargetId,
        selected: true // Select pasted edges
      };
    });

    // Clear current selection and add new nodes/edges
    setNodes(prevNodes => [
      ...prevNodes.map(node => ({ ...node, selected: false })),
      ...newNodes
    ]);

    setEdges(prevEdges => [
      ...prevEdges.map(edge => ({ ...edge, selected: false })),
      ...newEdges
    ]);

    console.log(`[Paste] Pasted ${newNodes.length} nodes and ${newEdges.length} edges`);
    
    return {
      nodeCount: newNodes.length,
      edgeCount: newEdges.length,
      newNodeIds: newNodes.map(n => n.id)
    };
  }, [setNodes, setEdges]);

  // Duplicate selection (copy + paste in one action)
  const duplicateSelection = useCallback(() => {
    const copyResult = copySelection();
    if (copyResult) {
      return pasteSelection(100, 100);
    }
    return null;
  }, [copySelection, pasteSelection]);

  // Delete selected nodes and edges
  const deleteSelection = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      console.log('[Delete] Nothing selected');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const selectedEdgeIds = new Set(selectedEdges.map(e => e.id));

    // Remove selected nodes
    const nodeChanges = selectedNodes.map(node => ({
      type: 'remove' as const,
      id: node.id
    }));

    // Remove selected edges + any edges connected to deleted nodes
    const edgesToRemove = edges.filter(edge => 
      selectedEdgeIds.has(edge.id) || 
      selectedNodeIds.has(edge.source) || 
      selectedNodeIds.has(edge.target)
    );

    const edgeChanges = edgesToRemove.map(edge => ({
      type: 'remove' as const,
      id: edge.id
    }));

    // Apply changes
    if (nodeChanges.length > 0) {
      onNodesChange(nodeChanges);
    }
    if (edgeChanges.length > 0) {
      onEdgesChange(edgeChanges);
    }

    console.log(`[Delete] Removed ${nodeChanges.length} nodes and ${edgeChanges.length} edges`);
    
    return {
      nodeCount: nodeChanges.length,
      edgeCount: edgeChanges.length
    };
  }, [selectedNodes, selectedEdges, edges, onNodesChange, onEdgesChange]);

  // Check if clipboard has data
  const hasClipboardData = useCallback(() => {
    return clipboardRef.current !== null;
  }, []);

  // Clear clipboard
  const clearClipboard = useCallback(() => {
    clipboardRef.current = null;
    console.log('[Clipboard] Cleared');
  }, []);

  return {
    copySelection,
    pasteSelection,
    duplicateSelection,
    deleteSelection,
    hasClipboardData,
    clearClipboard
  };
};