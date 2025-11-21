// App.tsx

/**
 * 🎯 APPLICATION ROOT COMPONENT
 * 
 * Main application entry point that orchestrates the entire video pipeline editor.
 * Manages global UI state, keyboard shortcuts, and coordinates between all major subsystems.
 * 
 * COMMUNICATES WITH:
 * ├── hooks/usePipeline.tsx - Core pipeline state management
 * ├── hooks/useNodeManagement.tsx - Node creation and type registration
 * ├── hooks/useKeyboardShortcuts.tsx - Global keyboard event handling
 * ├── hooks/useCopyPaste.tsx - Copy/paste/duplicate operations
 * ├── components/layout/Toolbar.tsx - Top toolbar UI
 * ├── components/layout/FlowCanvas.tsx - Main canvas with ReactFlow
 * ├── components/layout/NodeMenu.tsx - Node creation menu
 * ├── components/layout/StatusBar.tsx - Bottom status bar
 * └── constants/nodeTypes.tsx - Font and layout constants
 * 
 * STATE MANAGED:
 * - isProcessing: Pipeline execution state
 * - showNodeMenu: Node menu visibility
 * - mousePosition: Mouse coordinates for node placement
 */

import { useState, useEffect, useCallback } from 'react';
import { InputDialog } from './components/ui/InputDialog';
import { FFmpegSettingsDialog } from './components/ui/FFmpegSettingsDialog';
import '@xyflow/react/dist/style.css';
import './App.css';

// Import types and constants
import type { MousePosition } from './types/pipeline';
import { FONT_FAMILY } from './constants/nodeTypes';

// Import custom hooks
import { usePipeline } from './hooks/usePipeline';
import { useNodeManagement } from './hooks/useNodeManagement';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCopyPaste } from './hooks/useCopyPaste';

// Import UI components
import { Toolbar } from './components/layout/Toolbar';
import { NodeMenu } from './components/layout/NodeMenu';
import { StatusBar } from './components/layout/StatusBar';
import { FlowCanvas } from './components/layout/FlowCanvas';

// Import workflows
import type { Workflow } from './types/workflows';

function App() {
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [customWorkflows, setCustomWorkflows] = useState<Workflow[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFFmpegSettings, setShowFFmpegSettings] = useState(false);

  // Custom hooks
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeData,
    executePipeline: executePipelineHook,
    selectedNodes,
    selectedEdges
  } = usePipeline();

  const { nodeTypes, createNode } = useNodeManagement(
    mousePosition,
    setNodes,
    setShowNodeMenu,
    updateNodeData
  );

  // Enhanced copy/paste functionality
  const {
    copySelection,
    pasteSelection,
    duplicateSelection,
    deleteSelection,
    hasClipboardData
  } = useCopyPaste({
    nodes,
    edges,
    selectedNodes,
    selectedEdges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges
  });

  // Enhanced keyboard shortcuts (replaces the old basic shortcuts)
  useKeyboardShortcuts({
    setMousePosition,
    setShowNodeMenu,
    copySelection,
    pasteSelection,
    duplicateSelection,
    deleteSelection,
    hasClipboardData,
    openSettings: () => setShowFFmpegSettings(true)
  });

  // Execute pipeline with UI state management
  const executePipeline = async () => {
    setIsProcessing(true);
    try {
      console.log('ðŸš€ Starting pipeline execution...');
      console.log('ðŸ“‹ Nodes:', nodes);
      console.log('ðŸ”— Edges:', edges);
      
      const result = await executePipelineHook();
      console.log('ðŸ“¤ Pipeline result:', result);
      
      if (!result.success) {
        console.error('âŒ Pipeline failed:', result.message);
        alert(`Pipeline failed: ${result.message || 'Unknown error'}`);
      } else {
        console.log('âœ… Pipeline succeeded!');
      }
    } catch (error) {
      console.error('ðŸ’¥ Pipeline execution error:', error);
      alert(`Pipeline error: ${error || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load workflows from localStorage on mount
  useEffect(() => {
    const savedWorkflows = localStorage.getItem('customWorkflows');
    if (savedWorkflows) {
      try {
        const parsed = JSON.parse(savedWorkflows);
        setCustomWorkflows(parsed);
        console.log('Loaded custom workflows:', parsed);
      } catch (error) {
        console.error('Error loading custom workflows:', error);
      }
    }
  }, []);

  // Save workflows to localStorage whenever they change
  useEffect(() => {
    if (customWorkflows.length > 0) {
      localStorage.setItem('customWorkflows', JSON.stringify(customWorkflows));
      console.log('Saved custom workflows:', customWorkflows);
    }
  }, [customWorkflows]);

  // Load a workflow (preset or custom)
  const handleLoadWorkflow = useCallback((workflow: Workflow) => {
    console.log('Loading workflow:', workflow.name);
    
    // Clear current canvas
    setNodes([]);
    setEdges([]);
    
    // Small delay to ensure clean slate
    setTimeout(() => {
      // Load workflow nodes and edges
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      
      console.log('Workflow loaded successfully:', {
        nodes: workflow.nodes.length,
        edges: workflow.edges.length
      });
    }, 50);
  }, [setNodes, setEdges]);

  // Save current canvas as custom workflow - opens dialog
  const handleSaveCustomWorkflow = useCallback(() => {
    console.log('ðŸ” Opening save dialog');
    
    if (nodes.length === 0) {
      alert('Cannot save empty workflow. Add some nodes first.');
      return;
    }
    
    setShowSaveDialog(true);
  }, [nodes.length]);

  // Handle confirmed save with workflow name
  const handleConfirmSave = useCallback((name: string) => {
    console.log('âœ… Saving workflow:', name);
    
    const newWorkflow: Workflow = {
      id: `custom-${Date.now()}`,
      name: name,
      description: `Custom workflow with ${nodes.length} nodes`,
      category: 'custom',
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          filePath: node.data.filePath ? '' : node.data.filePath,
          videoPath: undefined,
          audioPath: undefined,
          outputPath: node.data.outputPath ? '' : node.data.outputPath,
          metadata: undefined,
          vmafScore: undefined,
          isAnalyzing: false,
          error: null
        }
      })),
      edges: edges,
      createdAt: new Date().toISOString()
    };
    
    setCustomWorkflows(prev => [...prev, newWorkflow]);
    setShowSaveDialog(false);
    
    console.log('âœ… Workflow saved:', newWorkflow);
    alert(`Workflow "${name}" saved successfully!`);
  }, [nodes, edges]);

  // Delete a custom workflow
  const handleDeleteCustomWorkflow = useCallback((workflowId: string) => {
    const workflow = customWorkflows.find(w => w.id === workflowId);
    
    if (workflow && confirm(`Delete workflow "${workflow.name}"?`)) {
      setCustomWorkflows(prev => prev.filter(w => w.id !== workflowId));
      console.log('Deleted workflow:', workflowId);
    }
  }, [customWorkflows]);

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        fontFamily: FONT_FAMILY
      }}
      // Removed onContextMenu={handleRightClick} - no more right-click menu
    >
      <Toolbar
        isProcessing={isProcessing}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onExecute={executePipeline}
        onLoadWorkflow={handleLoadWorkflow}
        customWorkflows={customWorkflows}
        onSaveCustom={handleSaveCustomWorkflow}
        onDeleteCustom={handleDeleteCustomWorkflow}
      />

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <NodeMenu
          isVisible={showNodeMenu}
          mousePosition={mousePosition}
          onCreateNode={createNode}
        />
      </FlowCanvas>

      <StatusBar 
        isProcessing={isProcessing}
        onOpenSettings={() => setShowFFmpegSettings(true)}
      />

      {/* Workflow Save Dialog */}
      <InputDialog
        isOpen={showSaveDialog}
        title="Save Workflow"
        placeholder="Enter workflow name..."
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveDialog(false)}
      />

      {/* FFmpeg Settings Dialog */}
      <FFmpegSettingsDialog
        isOpen={showFFmpegSettings}
        onClose={() => setShowFFmpegSettings(false)}
      />
    </div>
  );
}

export default App;