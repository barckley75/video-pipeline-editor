// services/nodeDataPropagation.ts

/**
 * 🔄 AUTOMATIC DATA PROPAGATION SERVICE
 * 
 * Automatically flows data through connected nodes. Updates target nodes
 * when source nodes change. Handles video, audio, and data parameter propagation.
 * 
 * CALLED BY:
 * └── hooks/usePipeline.tsx - On edge changes and node updates
 * 
 * USES:
 * ├── constants/nodeTypes.tsx - Node type constants
 * └── types/pipeline.tsx - Type definitions
 * 
 * KEY FUNCTION:
 * propagateNodeData(nodes, edges) → updated nodes
 * 
 * PROPAGATION RULES:
 * 
 * VIDEO FLOW:
 * - InputVideo → filePath becomes videoPath downstream
 * - TrimVideo → passes through original videoPath
 * - ConvertVideo → passes through videoPath during design
 * - Propagates to: view, info, grid, convert, trim, sequence, vmaf
 * 
 * AUDIO FLOW:
 * - InputAudio → filePath becomes audioPath downstream  
 * - Propagates to: infoAudio, spectrum, convertAudio, trimAudio
 * - Special handling for InputAudio's video-output handle
 * 
 * DATA FLOW:
 * - TrimVideo data-output → trimParams for converters
 * 
 * VMAF SPECIAL HANDLING:
 * - reference-input → referenceVideoPath
 * - test-input → testVideoPath
 * 
 * HELPERS:
 * - getVideoPathFromSource(): Trace video source recursively
 * - getAudioPathFromSource(): Trace audio source recursively
 * - getDataParamsFromSource(): Extract data parameters
 * - isVideoConsumerNode(): Check if node accepts video
 * - isAudioConsumerNode(): Check if node accepts audio
 * - isDataConsumerNode(): Check if node accepts data params
 */

import type { Node, Edge } from '@xyflow/react';
import { NODE_TYPES } from '../constants/nodeTypes';

export const propagateNodeData = (updatedNodes: Node[], edges: Edge[]): Node[] => {
  const nodeMap = new Map(updatedNodes.map(node => [node.id, node]));
  
  // For each edge, propagate data from source to target based on handle types
  const nodesToUpdate = [...updatedNodes];
  
  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Find the node in our array to update
    const targetIndex = nodesToUpdate.findIndex(n => n.id === edge.target);
    if (targetIndex === -1) return;
    
    // Handle VMAF nodes specially
    if (targetNode.type === 'vmafAnalysis') {
      const videoPath = getVideoPathFromSource(sourceNode, nodeMap, edges);
      
      if (videoPath && videoPath !== '$ null') {
        console.log(`[Propagation] VMAF ${edge.targetHandle}: ${sourceNode.type}(${sourceNode.id}) -> ${targetNode.type}(${targetNode.id}): ${videoPath}`);
        
        let updateData: any = {};
        
        // Update the appropriate input based on target handle
        if (edge.targetHandle === 'reference-input') {
          updateData.referenceVideoPath = videoPath;
        } else if (edge.targetHandle === 'test-input') {
          updateData.testVideoPath = videoPath;
        } else {
          // Default behavior for legacy connections
          updateData.testVideoPath = videoPath;
        }
        
        nodesToUpdate[targetIndex] = {
          ...targetNode,
          data: {
            ...targetNode.data,
            ...updateData
          }
        };
      }
      return;
    }
    
    // Handle different types of connections based on source and target handles
    if (edge.sourceHandle === 'video-output' || !edge.sourceHandle) {
      // Video data connection (default behavior)
      const videoPath = getVideoPathFromSource(sourceNode, nodeMap, edges);
      
      if (targetNode.type && isVideoConsumerNode(targetNode.type) && videoPath) {
        if (videoPath !== targetNode.data.videoPath && videoPath !== '$ null') {
          console.log(`[Propagation] Video: ${sourceNode.type}(${sourceNode.id}) -> ${targetNode.type}(${targetNode.id}): ${videoPath}`);
          nodesToUpdate[targetIndex] = {
            ...targetNode,
            data: {
              ...targetNode.data,
              videoPath: videoPath
            }
          };
        }
      }
    } else if (edge.sourceHandle === 'audio-output') {
      // Audio data connection via audio-output handle
      const audioPath = getAudioPathFromSource(sourceNode, nodeMap, edges);
      
      if (audioPath && targetNode.type && [
        'spectrumAnalyzer',
        'infoAudio',
        'convertAudio',
        'trimAudio'
      ].includes(targetNode.type)) {
        if (audioPath !== targetNode.data.audioPath && audioPath !== '$ null') {
          console.log(`[Propagation] Audio: ${sourceNode.type}(${sourceNode.id}) -> ${targetNode.type}(${targetNode.id}): ${audioPath}`);
          nodesToUpdate[targetIndex] = {
            ...targetNode,
            data: {
              ...targetNode.data,
              audioPath: audioPath,
              audioFile: audioPath  // For spectrum analyzer compatibility
            }
          };
        }
      }
    }
    
    // This handles the case where InputAudioNode creates a "video-output" handle
    if (sourceNode.type === NODE_TYPES.INPUT_AUDIO) {
      const audioPath = getAudioPathFromSource(sourceNode, nodeMap, edges);
      
      if (targetNode.type && isAudioConsumerNode(targetNode.type) && audioPath) {
        if (audioPath !== targetNode.data.audioPath && audioPath !== '$ null') {
          console.log(`[Propagation] Audio from INPUT_AUDIO: ${sourceNode.type}(${sourceNode.id}) -> ${targetNode.type}(${targetNode.id}): ${audioPath}`);
          nodesToUpdate[targetIndex] = {
            ...targetNode,
            data: {
              ...targetNode.data,
              audioPath: audioPath,
              audioFile: audioPath  // For spectrum analyzer compatibility
            }
          };
        }
      }
    }
    
    // Data parameters connection (trim params, etc.)
    if (edge.sourceHandle === 'data-output') {
      const dataParams = getDataParamsFromSource(sourceNode);
      
      if (dataParams && targetNode.type && [
        'convertVideo',
        'sequenceExtract'
      ].includes(targetNode.type)) {
        console.log(`[Propagation] Data params: ${sourceNode.type}(${sourceNode.id}) -> ${targetNode.type}(${targetNode.id}):`, dataParams);
        nodesToUpdate[targetIndex] = {
          ...targetNode,
          data: {
            ...targetNode.data,
            trimParams: dataParams // Store as trimParams for now, could be generic
          }
        };
      }
    }
  });
  
  return nodesToUpdate;
};

/**
 * Extracts video path from source node based on its type
 */
const getVideoPathFromSource = (
  sourceNode: Node, 
  nodeMap: Map<string, Node>, 
  edges: Edge[]
): string | undefined => {
  // Direct input from file selection
  if (sourceNode.type === NODE_TYPES.INPUT_VIDEO && 
      sourceNode.data.filePath && 
      (sourceNode.data.filePath as string).trim() !== '') {
    console.log(`[Propagation] Input node ${sourceNode.id} has file: ${sourceNode.data.filePath}`);
    return sourceNode.data.filePath as string;
  }
  
  // Trim node passes through the original video path
  if (sourceNode.type === NODE_TYPES.TRIM_VIDEO) {
    const trimInputEdge = edges.find(e => e.target === sourceNode.id && e.targetHandle === 'video-input');
    if (trimInputEdge) {
      const inputNode = nodeMap.get(trimInputEdge.source);
      if (inputNode?.type === NODE_TYPES.INPUT_VIDEO && 
          inputNode.data.filePath && 
          (inputNode.data.filePath as string).trim() !== '') {
        console.log(`[Propagation] Trim node ${sourceNode.id} passing through: ${inputNode.data.filePath}`);
        return inputNode.data.filePath as string;
      }
    }
  }

  // Trim audio node passes through the original audio path
  if (sourceNode.type === NODE_TYPES.TRIM_AUDIO) {
    const trimInputEdge = edges.find(e => e.target === sourceNode.id && e.targetHandle === 'audio-input');
    if (trimInputEdge) {
      const inputNode = nodeMap.get(trimInputEdge.source);
      if (inputNode?.type === NODE_TYPES.INPUT_AUDIO && 
          inputNode.data.filePath && 
          (inputNode.data.filePath as string).trim() !== '') { {
        console.log(`[Propagation] Audio trim node ${sourceNode.id} passing through: ${inputNode.data.filePath}`);
        return inputNode.data.filePath as string;
        }
      }
    }
  }
  
  // Convert nodes pass through original input during design time, output converted path after execution
  if (sourceNode.type === NODE_TYPES.CONVERT_VIDEO) {
    const convertSourceEdge = edges.find(e => e.target === sourceNode.id && e.targetHandle === 'video-input');
    if (convertSourceEdge) {
      const convertSourceNode = nodeMap.get(convertSourceEdge.source);
      if (convertSourceNode) {
        // Recursively get video path (could be from INPUT or TRIM node)
        return getVideoPathFromSource(convertSourceNode, nodeMap, edges);
      }
    }
  }
  
  return undefined;
};

/**
 * Extracts audio path from source node based on its type
 */
const getAudioPathFromSource = (
  sourceNode: Node, 
  nodeMap: Map<string, Node>, 
  edges: Edge[]
): string | undefined => {
  // Direct input from audio file selection
  if (sourceNode.type === NODE_TYPES.INPUT_AUDIO && 
      sourceNode.data.filePath && 
      (sourceNode.data.filePath as string).trim() !== '') {
    console.log(`[Propagation] Audio input node ${sourceNode.id} has file: ${sourceNode.data.filePath}`);
    return sourceNode.data.filePath as string;
  }
  
  // Convert nodes pass through original input during design time, output converted path after execution
  if (sourceNode.type === NODE_TYPES.CONVERT_AUDIO) {
    const convertSourceEdge = edges.find(e => e.target === sourceNode.id && e.targetHandle === 'audio-input');
    if (convertSourceEdge) {
      const convertSourceNode = nodeMap.get(convertSourceEdge.source);
      if (convertSourceNode) {
        // Recursively get audio path (could be from INPUT_AUDIO or another CONVERT_AUDIO node)
        return getAudioPathFromSource(convertSourceNode, nodeMap, edges);
      }
    }
  }
  
  return undefined;
};

/**
 * Extracts data parameters from source node (trim params, etc.)
 */
const getDataParamsFromSource = (sourceNode: Node): any => {
  if (sourceNode.type === NODE_TYPES.TRIM_VIDEO) {
    return {
      startTime: sourceNode.data.startTime || 0,
      endTime: sourceNode.data.endTime || 60,
      duration: sourceNode.data.duration || 60
    };
  }
  
  return undefined;
};

const isVideoConsumerNode = (nodeType: string): boolean => {
  return [
    NODE_TYPES.VIEW_VIDEO,
    NODE_TYPES.INFO_VIDEO,
    NODE_TYPES.GRID_VIEW,
    NODE_TYPES.TRIM_VIDEO,
    NODE_TYPES.CONVERT_VIDEO,
    NODE_TYPES.SEQUENCE_EXTRACT,
    NODE_TYPES.SPECTRUM_ANALYZER
  ].includes(nodeType as any);
};

const isAudioConsumerNode = (nodeType: string): boolean => {
  return [
    NODE_TYPES.SPECTRUM_ANALYZER,
    NODE_TYPES.INFO_AUDIO,
    NODE_TYPES.CONVERT_AUDIO,
    NODE_TYPES.TRIM_AUDIO
    // NODE_TYPES.AUDIO_EFFECTS,
  ].includes(nodeType as any);
};
