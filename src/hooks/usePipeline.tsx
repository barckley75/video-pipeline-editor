// src/hooks/usePipeline.tsx

/**
 * 🎬 CORE PIPELINE MANAGEMENT
 * 
 * Central hook managing entire pipeline state and execution.
 * Orchestrates nodes, edges, connections, and backend communication.
 * 
 * COMMUNICATES WITH:
 * ├── App.tsx - Main consumer
 * ├── services/nodeDataPropagation.tsx - Auto data flow
 * ├── services/pipelineExecution.tsx - Backend execution
 * ├── constants/nodeTypes.tsx - Initial state
 * └── @xyflow/react - ReactFlow state management
 * 
 * STATE MANAGED:
 * - nodes: All nodes on canvas
 * - edges: All connections
 * - selectedNodes: Currently selected nodes
 * - selectedEdges: Currently selected edges
 * 
 * KEY FUNCTIONS:
 * - onConnect(): Handle new connections with auto-disconnect
 * - updateNodeData(): Update node and propagate changes
 * - executePipeline(): Validate, execute, update results
 * 
 * DATA FLOW:
 * 1. Edge changes → useEffect triggers propagation
 * 2. Node updates → Manual propagation
 * 3. Execution → Backend → Update nodes with results
 * 
 * FEATURES:
 * - Auto-disconnect occupied handles
 * - Edge styling by connection type (video/audio/data)
 * - Selection tracking
 * - Result propagation to display nodes
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import { INITIAL_NODES, INITIAL_EDGES } from '../constants/nodeTypes';
import { propagateNodeData } from '../services/nodeDataPropagation';
import { validatePipeline, executePipelineBackend, updateNodesWithResults } from '../services/pipelineExecution';
import type { ExecutionResult, NodeUpdateCallback } from '../types/pipeline';

/**
 * Main pipeline management hook
 */
export const usePipeline = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Calculate selected nodes and edges
  const selectedNodes = useMemo(() => {
    return nodes.filter(node => node.selected);
  }, [nodes]);

  const selectedEdges = useMemo(() => {
    return edges.filter(edge => edge.selected);
  }, [edges]);

  // FIXED: Trigger data propagation whenever edges change
  useEffect(() => {
    console.log('[Pipeline] Edges changed, triggering data propagation...');
    console.log('[Pipeline] Current edges:', edges);
    console.log('[Pipeline] Current nodes:', nodes.map(n => ({ id: n.id, type: n.type, data: n.data })));
    
    setNodes((currentNodes) => {
      const propagatedNodes = propagateNodeData(currentNodes, edges);
      console.log('[Pipeline] After propagation:', propagatedNodes.map(n => ({ id: n.id, type: n.type, data: n.data })));
      return propagatedNodes;
    });
  }, [edges, setNodes]);

  // Handle new connections with auto-disconnect functionality
  const onConnect = useCallback((connection: Connection) => {
    console.log('[Connection] New connection:', connection);
    
    setEdges((eds) => {
      // Remove any existing edges connected to the same target handle
      const filteredEdges = eds.filter((edge) => {
        if (connection.target && connection.targetHandle) {
          const isSameTargetHandle = edge.target === connection.target && 
            edge.targetHandle === connection.targetHandle;
          
          if (isSameTargetHandle) {
            console.log('[Connection] Removing existing edge:', edge.id, 'to make room for new connection');
          }
          
          return !isSameTargetHandle;
        }
        return true;
      });

      // Add the new edge with custom styling based on handle type
      const newEdge = {
        ...connection,
        style: getEdgeStyleByHandleType(connection.sourceHandle, connection.targetHandle),
        animated: isDataConnection(connection.sourceHandle, connection.targetHandle),
      };

      const newEdges = addEdge(newEdge, filteredEdges);
      console.log('[Connection] Updated edges after auto-disconnect:', newEdges);
      return newEdges;
    });
    // Note: Data propagation will be triggered by the useEffect above
  }, [setEdges]);

  // Handle edge changes with spectrum analyzer cleanup
  const handleEdgeChanges = useCallback((changes: any[]) => {
    onEdgesChange(changes);
    
    // Then check for removed edges to spectrum analyzer
    changes.forEach(change => {
      if (change.type === 'remove') {
        const removedEdge = edges.find(e => e.id === change.id);
        if (removedEdge) {
          const targetNode = nodes.find(n => n.id === removedEdge.target);
          
          // If target is spectrum analyzer, reset its data
          if (targetNode?.type === 'spectrumAnalyzer') {
            console.log('[Edge Remove] Resetting spectrum analyzer:', targetNode.id);
            setNodes(nds => nds.map(node => {
              if (node.id === targetNode.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    videoPath: undefined,
                    audioPath: undefined,
                    audioFile: '',
                    resetKey: Date.now()  // Force cleanup
                  }
                };
              }
              return node;
            }));
          }
        }
      }
    });
  }, [edges, nodes, onEdgesChange, setNodes]);

  // Update node data and propagate changes
  const updateNodeData: NodeUpdateCallback = useCallback((nodeId: string, newData: any) => {
    console.log(`[Node Update] ${nodeId}:`, newData);
    
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      );
      
      // Propagate data through connected nodes
      console.log('[Node Update] Propagating data after node update...');
      const propagatedNodes = propagateNodeData(updatedNodes, edges);
      console.log('[Node Update] After propagation:', propagatedNodes.map(n => ({ id: n.id, type: n.type, data: n.data })));
      return propagatedNodes;
    });
  }, [setNodes, edges]);

  // Execute pipeline
  const executePipeline = useCallback(async (): Promise<ExecutionResult> => {
    console.log('[Pipeline] Starting execution...');
    
    // Validate pipeline
    const validation = validatePipeline(nodes);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message || 'Pipeline validation failed',
        outputs: {}
      };
    }

    try {
      // Transform ReactFlow data to backend format
      const pipelineData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
        })),
        connections: edges.map(edge => ({
          id: edge.id,
          from: edge.source,
          to: edge.target,
          fromHandle: edge.sourceHandle || 'video-output',
          toHandle: edge.targetHandle || 'video-input',
        })),
      };

      console.log('[Pipeline] Sending data:', pipelineData);
      
      // Execute pipeline in backend
      const result = await executePipelineBackend(pipelineData.nodes, pipelineData.connections);
      
      if (result.success) {
        // Update nodes with execution results
        const updatedNodes = updateNodesWithResults(nodes, edges, result);
        setNodes(updatedNodes);
      }
      
      return result;
    } catch (error) {
      console.error('[Pipeline] Execution failed:', error);
      return {
        success: false,
        message: `Execution failed: ${error}`,
        outputs: {}
      };
    }
  }, [nodes, edges, setNodes]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange: handleEdgeChanges,
    onConnect,
    updateNodeData,
    executePipeline,
    selectedNodes,
    selectedEdges,
  };
};

// Helper functions for edge styling based on handle type
function getEdgeStyleByHandleType(sourceHandle?: string | null, targetHandle?: string | null) {
  // Video connections (orange)
  if (sourceHandle?.includes('video') || targetHandle?.includes('video')) {
    return {
      stroke: 'rgba(249, 115, 22, 0.8)',
      strokeWidth: 1.5,
      filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.4))',
    };
  }
  
  // NEW: Audio connections (pink/magenta)
  if (sourceHandle?.includes('audio') || targetHandle?.includes('audio')) {
    return {
      stroke: 'rgba(236, 72, 153, 0.8)',
      strokeWidth: 1.5,
      filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.4))',
    };
  }
  
  // Data connections (green)  
  if (sourceHandle?.includes('data') || targetHandle?.includes('data')) {
    return {
      stroke: 'rgba(34, 197, 94, 0.8)',
      strokeWidth: 1.5,
      filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))',
    };
  }
  
  // Default connections (gray)
  return {
    stroke: 'rgba(156, 163, 175, 0.6)',
    strokeWidth: 1.5,
  };
}

function isDataConnection(sourceHandle?: string | null, targetHandle?: string | null) {
  return sourceHandle?.includes('data') || targetHandle?.includes('data');
}