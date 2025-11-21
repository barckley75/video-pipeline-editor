// components/flow/FlowCanvas.tsx

/**
 * 🎨 REACTFLOW CANVAS WRAPPER
 * 
 * Main canvas component wrapping ReactFlow. Handles node rendering, edge connections,
 * connection validation, and selection management.
 * 
 * COMMUNICATES WITH:
 * ├── hooks/usePipeline.tsx - Receives nodes, edges, and change handlers
 * ├── hooks/useNodeManagement.tsx - Receives registered nodeTypes
 * ├── constants/nodeTypes.tsx - Layout and theme configuration
 * └── Renders children (NodeMenu)
 * 
 * KEY FEATURES:
 * - Connection validation based on handle types (video/audio/data)
 * - Auto-disconnect when connecting to occupied handles
 * - Custom connection line styling
 * - Selection box with Shift+Drag
 * - Cyberpunk selection styling
 * - MiniMap and Controls integration
 * 
 * CONNECTION RULES:
 * - video-output → video-input ✅
 * - audio-output → audio-input ✅
 * - data-output → data-input ✅
 * - VMAF: video-output → reference-input/test-input ✅
 * - Cross-type connections ❌
 */

import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  NodeTypes,
  ConnectionLineType,
  SelectionMode,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';

import { LAYOUT_CONFIG, THEME_COLORS } from '../../constants/nodeTypes';

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypes;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  children?: React.ReactNode;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  children
}) => {
  // Helper functions for node type classification
  const isVideoProducerNodeType = (nodeType: string): boolean => {
    return ['inputVideo', 'convertVideo', 'trimVideo'].includes(nodeType);
  };

  const isVideoConsumerNodeType = (nodeType: string): boolean => {
    return ['viewVideo', 'infoVideo', 'gridView', 'convertVideo', 'trimVideo', 'sequenceExtract', 'spectrumAnalyzer'].includes(nodeType);
  };

  const isAudioProducerNodeType = (nodeType: string): boolean => {
    return ['inputAudio','convertAudio', 'trimAudio'].includes(nodeType);
  };

  const isAudioConsumerNodeType = (nodeType: string): boolean => {
    return ['infoAudio', 'spectrumAnalyzer', 'convertAudio', 'trimAudio'].includes(nodeType);
  };

  /**
   * FIXED: Enhanced connection validation with proper audio support
   */
  const isValidConnection = React.useCallback((connection: Connection | Edge): boolean => {
    const { sourceHandle, targetHandle, source, target } = connection;
    
    console.log(`[Connection Validation] ${sourceHandle} -> ${targetHandle} (${source} -> ${target})`);
    
    // Find source and target nodes to check their types
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    
    if (!sourceNode || !targetNode) {
      console.log('[Connection] ❌ Could not find source or target node');
      return false;
    }
    
    // Type guard: ensure node types exist
    if (!sourceNode.type || !targetNode.type) {
      console.log('[Connection] ❌ Missing node type information');
      return false;
    }
    
    console.log(`[Connection] Node types: ${sourceNode.type} -> ${targetNode.type}`);
    
    // If no handles specified, allow but log warning
    if (!sourceHandle || !targetHandle) {
      console.log('[Connection] ⚠️ Missing handle information, allowing with default behavior');
      return true;
    }
    
    // === AUDIO CONNECTIONS ===
    
    // Pure audio connections: audio-output -> audio-input
    if (sourceHandle === 'audio-output' && targetHandle === 'audio-input') {
      if (isAudioProducerNodeType(sourceNode.type) && isAudioConsumerNodeType(targetNode.type)) {
        console.log('[Connection] ✅ Audio connection allowed');
        return true;
      } else {
        console.log('[Connection] ❌ Audio connection blocked - invalid node types');
        return false;
      }
    }
    
    // === VIDEO CONNECTIONS ===
    
    // Standard video connections: video-output -> video-input
    if (sourceHandle === 'video-output' && targetHandle === 'video-input') {
      if (isVideoProducerNodeType(sourceNode.type) && isVideoConsumerNodeType(targetNode.type)) {
        console.log('[Connection] ✅ Video connection allowed');
        return true;
      } else {
        console.log('[Connection] ❌ Video connection blocked - invalid node types');
        return false;
      }
    }
    
    // === DATA CONNECTIONS ===
    
    // Data connections: data-output -> data-input
    if (sourceHandle === 'data-output' && targetHandle === 'data-input') {
      console.log('[Connection] ✅ Data connection allowed');
      return true;
    }
    
    // === VMAF CONNECTIONS ===
    
    // VMAF connections: video-output -> reference-input OR test-input
    if (sourceHandle === 'video-output' && (targetHandle === 'reference-input' || targetHandle === 'test-input')) {
      if (isVideoProducerNodeType(sourceNode.type) && targetNode.type === 'vmafAnalysis') {
        console.log('[Connection] ✅ VMAF video connection allowed');
        return true;
      }
    }
    
    // === MIXED CONNECTIONS (LEGACY COMPATIBILITY) ===
    
    // Allow video-output -> audio-input for compatibility (InputAudioNode might use video-output handle)
    if (sourceHandle === 'video-output' && targetHandle === 'audio-input') {
      if (sourceNode.type === 'inputAudio' && isAudioConsumerNodeType(targetNode.type)) {
        console.log('[Connection] ✅ Audio input via video-output handle allowed (legacy compatibility)');
        return true;
      }
    }
    
    // Block all other connections
    console.log(`[Connection] ❌ Invalid connection blocked: ${sourceNode.type}(${sourceHandle}) -> ${targetNode.type}(${targetHandle})`);
    return false;
  }, [nodes]);

  // Handle edge reconnection
  const onReconnect = (oldEdge: Edge, newConnection: Connection) => {
    // Validate the new connection
    if (!isValidConnection(newConnection)) {
      console.log(`[Reconnection Blocked] ${newConnection.sourceHandle} cannot connect to ${newConnection.targetHandle}`);
      return; // Block the reconnection
    }
    
    console.log(`[Edge Reconnected] ${oldEdge.id} reconnected to ${newConnection.target}`);
    
    // Remove old edge and add new one
    onEdgesChange([
      { type: 'remove', id: oldEdge.id },
    ]);
    
    // Add the new connection
    onConnect(newConnection);
  };

  // Handle selection changes
  const onSelectionChange = ({ nodes: selectedNodes, edges: selectedEdges }: {
    nodes: Node[];
    edges: Edge[];
  }) => {
    console.log('Selected nodes:', selectedNodes.map(n => n.id));
    console.log('Selected edges:', selectedEdges.map(e => e.id));
    
    // You can store selection state here or trigger callbacks
    // Example: onSelectionUpdate?.(selectedNodes, selectedEdges);
  };

  /**
   * Custom connection line component that changes color based on validity
   */
  const CustomConnectionLine = ({ fromX, fromY, toX, toY, connectionState }: any) => {
    const isValid = connectionState?.isValid;
    
    // Create smooth bezier curve
    const edgePath = `M${fromX},${fromY} C${fromX + 50},${fromY} ${toX - 50},${toY} ${toX},${toY}`;
    
    return (
      <g>
        <path
          fill="none"
          stroke={isValid ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          className="animated"
          d={edgePath}
          strokeDasharray={isValid ? 'none' : '5,5'}
        />
      </g>
    );
  };

  return (
    <div style={{ 
      flex: 1, 
      background: THEME_COLORS.BACKGROUND_GRADIENT, 
      position: 'relative' 
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        style={{ width: '100%', height: '100%' }}
        defaultViewport={LAYOUT_CONFIG.DEFAULT_VIEWPORT}
        minZoom={0.1}
        maxZoom={4}
        fitView={false}
        isValidConnection={isValidConnection}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineComponent={CustomConnectionLine}
        reconnectRadius={20}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          type: 'bezier',
        }}
        // SELECTION BOX CONFIGURATION
        selectionMode={SelectionMode.Partial} // Partial or Full
        multiSelectionKeyCode={['Meta', 'Control']} // Cmd/Ctrl for multi-select
        deleteKeyCode={['Backspace', 'Delete']} // Keys to delete selected
        onSelectionChange={onSelectionChange}
        selectNodesOnDrag={false} // Prevent accidental selection while dragging
        
        // ENABLE SELECTION BOX - Key combinations for different behaviors
        selectionKeyCode="Shift" // Hold Shift + drag for selection box
        panOnDrag={true} // Allow panning when not holding Shift
        
        // Alternative: Use space bar for panning
        // panActivationKeyCode="Space" // Hold Space + drag to pan
        // selectionKeyCode={null} // Always allow selection box
      >
        <Controls style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)'
        }} />
        <MiniMap
          pannable
          zoomable
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={28}
          size={1}
          color="rgba(255, 255, 255, 0.15)"
        />
      </ReactFlow>

      {children}

      {/* Custom cyberpunk HUD-style selection */}
      <style>{`
        .react-flow__selection {
          background: rgba(0, 255, 255, 0.05) !important;
          border: 1px solid rgba(0, 255, 255, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 
            0 0 0 1px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1),
            0 0 40px rgba(0, 255, 255, 0.3) !important;
        }
        
        .react-flow__node.selected {
          box-shadow: none !important;
        }
        
        .react-flow__node.selected::before {
          content: '' !important;
          position: absolute !important;
          top: -12px !important;
          left: -12px !important;
          right: -12px !important;
          bottom: -12px !important;
          background: linear-gradient(45deg, 
            rgba(0, 255, 255, 0.57) 0%, 
            rgba(0, 255, 255, 0.11) 10%, 
            transparent 50%, 
            rgba(0, 255, 255, 0.2) 90%, 
            rgba(0, 255, 255, 0.48) 100%) !important;
          border: 2px solid rgba(0, 255, 255, 0.37) !important;
          border-radius: 12px !important;
          box-shadow: 
            0 0 0 1px rgba(0, 255, 255, 0.29),
            inset 0 0 30px rgba(0, 255, 255, 0.1),
            0 0 50px rgba(0, 255, 255, 0.4),
            0 0 100px rgba(0, 255, 255, 0.2) !important;
          pointer-events: none !important;
          z-index: -1 !important;
          animation: cyberpunk-pulse 2s ease-in-out infinite !important;
        }
        
        .react-flow__node.selected::after {
          content: '' !important;
          position: absolute !important;
          top: -8px !important;
          left: -8px !important;
          right: -8px !important;
          bottom: -8px !important;
          border: 1px solid rgba(0, 255, 255, 0.6) !important;
          border-radius: 10px !important;
          pointer-events: none !important;
          z-index: -1 !important;
          background: linear-gradient(90deg,
            rgba(0, 255, 255, 0.1) 0%,
            transparent 50%,
            rgba(0, 255, 255, 0.1) 100%) !important;
        }
        
        @keyframes cyberpunk-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 1px rgba(0, 255, 255, 0.29),
              inset 0 0 30px rgba(0, 255, 255, 0.1),
              0 0 50px rgba(0, 255, 255, 0.13),
              0 0 100px rgba(0, 255, 255, 0.2);
          }
          50% {
            box-shadow: 
              0 0 0 1px rgba(0, 255, 255, 0.6),
              inset 0 0 30px rgba(0, 255, 255, 0.2),
              0 0 60px rgba(0, 255, 255, 0.3),
              0 0 120px rgba(0, 255, 255, 0.3);
          }
        }
        
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: rgba(0, 255, 255, 0.43) !important;
          stroke-width: 3px !important;
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)) !important;
          animation: edge-pulse 1.5s ease-in-out infinite !important;
        }
        
        @keyframes edge-pulse {
          0%, 100% {
            stroke-width: 3px !important;
            filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)) !important;
          }
          50% {
            stroke-width: 4px !important;
            filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.8)) !important;
          }
        }

        .react-flow__nodesselection {
          display: none !important;
        }
          
      `}</style>
    </div>
  );
};