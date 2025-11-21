// src/services/pipelineExecution.ts

/**
 * ⚙️ PIPELINE EXECUTION SERVICE
 * 
 * Handles pipeline validation and backend execution via Tauri IPC.
 * Updates nodes with execution results.
 * 
 * CALLED BY:
 * └── hooks/usePipeline.tsx - executePipeline()
 * 
 * USES:
 * ├── constants/nodeTypes.tsx - Node type validation
 * ├── types/pipeline.tsx - Type definitions
 * └── @tauri-apps/api/core - Backend invoke
 * 
 * KEY FUNCTIONS:
 * 
 * validatePipeline(nodes):
 * - Checks for at least one valid input (video OR audio)
 * - Returns: { isValid, message }
 * 
 * executePipelineBackend(nodes, connections):
 * - Transforms ReactFlow data to backend format
 * - Invokes Tauri: 'execute_pipeline'
 * - Returns: ExecutionResult with outputs
 * 
 * updateNodesWithResults(nodes, edges, result):
 * - Updates VideoPreview nodes with processed video paths
 * - Updates VMAF nodes with quality scores
 * - Updates Spectrum nodes with audio data
 * - Returns: Updated nodes array
 * 
 * BACKEND CONTRACT:
 * Input: { nodes: [], connections: [] }
 * Output: { success, message, outputs: {}, vmaf_results: {}, audio_outputs: {} }
 */

import type { Node, Edge } from '@xyflow/react';
import { invoke } from '@tauri-apps/api/core';
import type { ExecutionResult } from '../types/pipeline';
import { NODE_TYPES } from '../constants/nodeTypes';

/**
 * Validates that the pipeline has at least one valid input (video or audio)
 */
export const validatePipeline = (nodes: Node[]): { isValid: boolean; message?: string } => {
  // Check for video inputs
  const inputVideoNodes = nodes.filter(node => node.type === NODE_TYPES.INPUT_VIDEO);
  const validVideoInputs = inputVideoNodes.filter(node => 
    typeof node.data.filePath === 'string' && node.data.filePath.trim() !== ''
  );
  
  // NEW: Check for audio inputs
  const inputAudioNodes = nodes.filter(node => node.type === NODE_TYPES.INPUT_AUDIO);
  const validAudioInputs = inputAudioNodes.filter(node => 
    typeof node.data.filePath === 'string' && node.data.filePath.trim() !== ''
  );
  
  // Check for trim audio nodes that might have inputs
  const trimAudioNodes = nodes.filter(node => node.type === NODE_TYPES.TRIM_AUDIO);
  const validTrimAudioInputs = trimAudioNodes.filter(node => 
    typeof node.data.audioPath === 'string' && node.data.audioPath.trim() !== ''
  );

  // Pipeline is valid if we have at least one valid input (video OR audio)
  const totalValidInputs = validVideoInputs.length + validAudioInputs.length + validTrimAudioInputs.length;
  
  if (totalValidInputs === 0) {
    return {
      isValid: false,
      message: 'Please select at least one input file (video or audio) before executing the pipeline.'
    };
  }
  
  return { isValid: true };
};

/**
 * Executes the pipeline by sending it to the backend
 */
export const executePipelineBackend = async (
  nodes: any[], 
  connections: any[]
): Promise<ExecutionResult> => {
  const pipeline = {
    nodes,
    connections,
  };

  console.log('Sending pipeline to backend:', JSON.stringify(pipeline, null, 2));

  const result = await invoke<ExecutionResult>('execute_pipeline', { pipeline });
  console.log('Pipeline execution result:', result);
  
  return result;
};

/**
 * Updates nodes with the execution results from backend
 */
export const updateNodesWithResults = (
  currentNodes: Node[],
  edges: Edge[],
  executionResult: ExecutionResult
): Node[] => {
  if (!executionResult.outputs && !executionResult.vmaf_results && !executionResult.audio_outputs) {
    return currentNodes;
  }

  console.log('Updating nodes with outputs:', executionResult.outputs);
  console.log('Updating nodes with VMAF results:', executionResult.vmaf_results);
  console.log('Updating nodes with audio outputs:', executionResult.audio_outputs);
  
  return currentNodes.map(node => {
    // Handle VMAF analysis nodes
    if (node.type === 'vmafAnalysis') {
      if (executionResult.vmaf_results && executionResult.vmaf_results[node.id]) {
        const vmafScore = executionResult.vmaf_results[node.id];
        console.log(`Updating VMAF node ${node.id} with score:`, vmafScore);
        
        return {
          ...node,
          data: {
            ...node.data,
            vmafScore: vmafScore,
            isAnalyzing: false,
            error: null
          }
        };
      }
      return node;
    }

    // Handle spectrum analyzer nodes (audio processing)
    if (node.type === NODE_TYPES.SPECTRUM_ANALYZER) {
      if (executionResult.audio_outputs && executionResult.audio_outputs[node.id]) {
        const audioData = executionResult.audio_outputs[node.id];
        console.log(`Updating spectrum analyzer node ${node.id} with audio data:`, audioData);
        
        return {
          ...node,
          data: {
            ...node.data,
            audioPath: audioData.path,
            audioFile: audioData.path,
            isProcessing: false,
            error: null
          }
        };
      }
      return node;
    }

    // Handle video display nodes (existing logic)
    if (node.type !== NODE_TYPES.VIEW_VIDEO && node.type !== NODE_TYPES.INFO_VIDEO) {
      return node;
    }

    const inputConnection = edges.find(edge => edge.target === node.id);
    if (!inputConnection) return node;

    const sourceNodeId = inputConnection.source;
    const sourceNode = currentNodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return node;
    
    let finalVideoPath: string | undefined = undefined;

    // Check if there's a processed output for this source
    if (executionResult.outputs) {
      const sourceOutput = executionResult.outputs[sourceNodeId];
      if (sourceOutput) {
        finalVideoPath = sourceOutput.path;
        console.log(`Found processed output for ${node.id} from ${sourceNodeId}:`, finalVideoPath);
      } 
      // Fallback to original input file
      else if (sourceNode.type === NODE_TYPES.INPUT_VIDEO) {
        finalVideoPath = sourceNode.data.filePath as string;
        console.log(`Using direct file path for ${node.id} from InputNode ${sourceNodeId}:`, finalVideoPath);
      }
    }

    if (finalVideoPath) {
      return {
        ...node,
        data: {
          ...node.data,
          videoPath: finalVideoPath,
        }
      };
    }

    return node;
  });
};