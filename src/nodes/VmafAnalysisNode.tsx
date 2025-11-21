// src/nodes/VmafAnalysisNode.tsx
import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import BaseNode from '../components/BaseNode';
// import { NodeLabel, NodeSelect, NodeInfo, NodeField } from '../components/NodeUI';
import { NodeLabel, NodeGlassySelect, NodeInfo, NodeField } from '../components/NodeUI';

interface VmafScore {
  mean: number;
  min: number;
  max: number;
  harmonic_mean: number;
  frame_count: number;
  model: string;
  reference_path: string;
  distorted_path: string;
}

interface VmafAnalysisData {
  model: string;
  pooling: string;
  outputFormat: string;
  confidenceInterval: boolean;
  vmafScore?: VmafScore;
  isAnalyzing?: boolean;
  error?: string | null;
  // Add these to track connections
  referenceVideoPath?: string;
  testVideoPath?: string;
}

interface VmafAnalysisNodeProps {
  id: string;
  data: VmafAnalysisData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<VmafAnalysisData>) => void;
}

const VmafAnalysisNode: React.FC<VmafAnalysisNodeProps> = ({ 
  id, 
  data, 
  isConnectable, 
  onDataUpdate 
}) => {
  const [vmafScore, setVmafScore] = useState<VmafScore | null>(data.vmafScore || null);
  const [isAnalyzing, setIsAnalyzing] = useState(data.isAnalyzing || false);
  const [error, setError] = useState<string | null>(data.error || null);

  // Update internal state when data prop changes (from pipeline execution)
  useEffect(() => {
    if (data.vmafScore) {
      setVmafScore(data.vmafScore);
      setIsAnalyzing(false);
      setError(null);
    }
    if (data.isAnalyzing !== undefined) {
      setIsAnalyzing(data.isAnalyzing);
    }
    if (data.error) {
      setError(data.error);
      setIsAnalyzing(false);
    }
  }, [data.vmafScore, data.isAnalyzing, data.error]);

  const getQualityColor = (score: number): string => {
    if (score >= 90) return '#10b981'; // Green - Excellent
    if (score >= 80) return '#f59e0b'; // Yellow - Good  
    if (score >= 65) return '#f97316'; // Orange - Fair
    if (score >= 50) return '#ef4444'; // Red - Poor
    return '#7c2d12';                  // Dark Red - Very Poor
  };

  const getQualityLabel = (score: number): string => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 65) return 'FAIR';
    if (score >= 50) return 'POOR';
    return 'VERY_POOR';
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { model: e.target.value });
  };

  const handlePoolingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataUpdate?.(id, { pooling: e.target.value });
  };

  // Check if both inputs are connected
  const hasReferenceInput = data.referenceVideoPath && data.referenceVideoPath !== '$ null';
  const hasTestInput = data.testVideoPath && data.testVideoPath !== '$ null';
  const hasAllInputs = hasReferenceInput && hasTestInput;

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="analysis_tools"
      title='VMAF_ANALYSER'
      hasInput={false}
      hasOutput={false}
      customHandles={true}
      onDataUpdate={onDataUpdate}
    >
      {/* Custom Handles for Reference and Test inputs */}
      <Handle
        type="target"
        position={Position.Left}
        id="reference-input"
        isConnectable={isConnectable}
        style={{
          background: hasReferenceInput ? '#10b981' : '#6b7280',
          border: `2px solid ${hasReferenceInput ? '#059669' : '#4b5563'}`,
          width: '14px',
          height: '14px',
          top: '30%',
          boxShadow: hasReferenceInput 
            ? '0 0 12px rgba(16, 185, 129, 0.4)' 
            : '0 0 8px rgba(107, 114, 128, 0.2)'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="test-input"
        isConnectable={isConnectable}
        style={{
          background: hasTestInput ? '#f59e0b' : '#6b7280',
          border: `2px solid ${hasTestInput ? '#d97706' : '#4b5563'}`,
          width: '14px',
          height: '14px',
          top: '70%',
          boxShadow: hasTestInput 
            ? '0 0 12px rgba(245, 158, 11, 0.4)' 
            : '0 0 8px rgba(107, 114, 128, 0.2)'
        }}
      />

      <div className="nodrag">
        {/* Input Labels */}
        <NodeField>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '8px',
            color: 'rgba(224, 242, 254, 0.7)',
            marginBottom: '8px',
            letterSpacing: '0.5px'
          }}>
            <div style={{ 
              color: hasReferenceInput ? '#10b981' : '#6b7280',
              fontWeight: hasReferenceInput ? '600' : '400'
            }}>
              REF {hasReferenceInput ? '●' : '○'}
            </div>
            <div style={{ 
              color: hasTestInput ? '#f59e0b' : '#6b7280',
              fontWeight: hasTestInput ? '600' : '400'
            }}>
              TEST {hasTestInput ? '●' : '○'}
            </div>
          </div>
        </NodeField>

        {/* Connection Status */}
        {!hasAllInputs && (
          <NodeField>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              color: '#fbbf24',
              fontSize: '9px',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              CONNECT_BOTH_INPUTS
              <div style={{ fontSize: '8px', marginTop: '2px', opacity: 0.8 }}>
                {!hasReferenceInput && !hasTestInput && 'reference + test videos'}
                {hasReferenceInput && !hasTestInput && 'test video needed'}
                {!hasReferenceInput && hasTestInput && 'reference video needed'}
              </div>
            </div>
          </NodeField>
        )}

        {/* Score Display */}
        {vmafScore ? (
          <NodeField>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: `2px solid ${getQualityColor(vmafScore.mean)}`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: getQualityColor(vmafScore.mean),
                marginBottom: '4px',
                fontFamily: 'inherit'
              }}>
                {vmafScore.mean.toFixed(3)}
              </div>
              <div style={{
                fontSize: '10px',
                color: getQualityColor(vmafScore.mean),
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>
                {getQualityLabel(vmafScore.mean)}
              </div>
              
              {/* Quality Progress Bar */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                height: '6px',
                marginBottom: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(vmafScore.mean, 100)}%`,
                  height: '100%',
                  background: getQualityColor(vmafScore.mean),
                  transition: 'width 0.5s ease',
                  borderRadius: '4px'
                }} />
              </div>

              {/* Detailed Stats */}
              <div style={{
                fontSize: '8px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                color: 'rgba(224, 242, 254, 0.8)'
              }}>
                <div>MIN: {vmafScore.min.toFixed(3)}</div>
                <div>MAX: {vmafScore.max.toFixed(3)}</div>
              </div>
            </div>
          </NodeField>
        ) : isAnalyzing ? (
          <NodeField>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              color: '#fbbf24',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}>
              ⚡ ANALYZING_QUALITY...
              <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.8 }}>
                comparing_frames
              </div>
            </div>
          </NodeField>
        ) : error ? (
          <NodeField>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '6px',
              padding: '12px',
              textAlign: 'center',
              color: '#f87171',
              fontSize: '9px',
              lineHeight: '1.3'
            }}>
              ❌ ANALYSIS_FAILED
              <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.8 }}>
                {error}
              </div>
            </div>
          </NodeField>
        ) : hasAllInputs ? (
          <NodeField>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
              color: '#22c55e',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}>
              ✅ READY_TO_ANALYZE
              <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.8 }}>
                execute_pipeline_to_start
              </div>
            </div>
          </NodeField>
        ) : (
          <NodeField>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '2px dashed rgba(245, 101, 101, 0.4)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              color: 'rgba(224, 242, 254, 0.6)',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}>
              CONNECT_VIDEOS
              <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.8 }}>
                need_reference_and_test
              </div>
            </div>
          </NodeField>
        )}

        {/* Configuration */}
        <NodeField>
          <NodeLabel>vmaf_model:</NodeLabel>
          <NodeGlassySelect 
            value={data?.model || 'default'} 
            onChange={handleModelChange}
          >
            <option value="default">default_tv</option>
            <option value="vmaf_v0.6.1neg">mobile_phone</option>
            <option value="vmaf_4k_v0.6.1">4k_television</option>
          </NodeGlassySelect>
        </NodeField>

        <NodeField>
          <NodeLabel>temporal_pooling:</NodeLabel>
          <NodeGlassySelect 
            value={data?.pooling || 'mean'} 
            onChange={handlePoolingChange}
          >
            <option value="mean">arithmetic_mean</option>
            <option value="harmonic">harmonic_mean</option>
            <option value="min">minimum_score</option>
          </NodeGlassySelect>
        </NodeField>
      </div>

      <NodeInfo>
        analysis: {vmafScore ? 'complete' : hasAllInputs ? 'ready' : 'pending'} | 
        frames: {vmafScore?.frame_count || 0} | 
        model: {data?.model?.split('_')[1] || 'default'}
      </NodeInfo>
    </BaseNode>
  );
};

export default memo(VmafAnalysisNode);