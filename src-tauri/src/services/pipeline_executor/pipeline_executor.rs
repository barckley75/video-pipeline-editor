// src-tauri/src/services/pipeline_executor.rs

//! # Pipeline Executor Implementation
//! 
//! Core implementation of the pipeline execution engine.
//! 
//! ## Execution Algorithm:
//! 
//! ### Phase 0: Dependency Ordering
//! Uses **Kahn's Algorithm** (topological sort) to calculate execution order:
//! 1. Build dependency graph from connections
//! 2. Calculate in-degree (number of dependencies) for each node
//! 3. Start with nodes having zero dependencies
//! 4. Process nodes and remove from dependents' in-degree
//! 5. Detect cycles if not all nodes processed
//! 
//! ### Phase 1: Regular Node Processing
//! - Executes nodes in dependency order
//! - Each node receives results from dependencies via ExecutionContext
//! - Stores node outputs for downstream nodes
//! - Stops execution if any node fails
//! 
//! ### Phase 2: VMAF Analysis
//! - Processes VMAF nodes separately (need both videos available)
//! - Retrieves reference and distorted videos from context
//! - Calculates quality scores
//! - Failures don't stop pipeline (logged as warnings)
//! 
//! ## Key Features:
//! - **Cycle Detection**: Prevents infinite loops from circular dependencies
//! - **Fail-Fast**: Stops on first critical error with detailed message
//! - **Context Isolation**: Each execution has independent context
//! - **Logging**: Extensive console output for debugging
//! 
//! ## Result:
//! Returns ExecutionResult containing:
//! - Success/failure status
//! - Error message if failed
//! - Map of all node outputs (VideoData)
//! - VMAF scores (if any VMAF nodes present)

use crate::services::{FFmpegService, TrimService};
use crate::types::{ExecutionResult, PipelineData, PipelineError, Result, VideoData, VmafScore, NodeData, ConnectionData};
use std::collections::HashMap;

mod execution_context;
mod node_handlers;
mod node_helpers;
mod vmaf_processor;

use execution_context::ExecutionContext;
use node_handlers::NodeHandlers;
use vmaf_processor::VmafProcessor;

pub struct PipelineExecutor {
    ffmpeg: FFmpegService,
    trim_service: TrimService,
}

impl PipelineExecutor {
    pub fn new() -> Self {
        Self {
            ffmpeg: FFmpegService::new(),
            trim_service: TrimService::new(),
        }
    }

    /// Main execution entry point - clean and simple!
    pub async fn execute(&self, pipeline: PipelineData) -> Result<ExecutionResult> {
        println!("🚀 Starting pipeline with {} nodes", pipeline.nodes.len());

        let mut execution_context = ExecutionContext::new();
        
        // Phase 1: Process regular nodes
        for node in &pipeline.nodes {
            if node.node_type == "vmafAnalysis" { continue; }
            
            match self.process_node(node, &mut execution_context, &pipeline.connections).await {
                Ok(Some(video_data)) => {
                    execution_context.add_result(node.id.clone(), video_data);
                }
                Ok(None) => {
                    println!("✅ Node {} completed (no output)", node.id);
                }
                Err(e) => {
                    return Ok(ExecutionResult::failure(&node.id, &node.node_type, e));
                }
            }
        }

        // Phase 2: Process VMAF nodes
        let vmaf_processor = VmafProcessor::new(&self.ffmpeg);
        for node in &pipeline.nodes {
            if node.node_type == "vmafAnalysis" {
                match vmaf_processor.process(node, &execution_context, &pipeline.connections).await {
                    Ok(vmaf_score) => execution_context.add_vmaf_result(node.id.clone(), vmaf_score),
                    Err(e) => println!("⚠️ VMAF failed for {}: {}", node.id, e),
                }
            }
        }

        Ok(execution_context.build_result())
    }

    /// Single node processor - delegates to specific handlers - NOW WITH MUTABLE CONTEXT
    async fn process_node(
        &self,
        node: &NodeData,
        context: &mut ExecutionContext,  // Made mutable for trim data
        connections: &[ConnectionData],
    ) -> Result<Option<VideoData>> {
        println!("🔄 Processing {} ({})", node.id, node.node_type);

        let node_handlers = NodeHandlers::new(&self.ffmpeg, &self.trim_service);
        node_handlers.process(node, context, connections).await
    }
}

// Extension for ExecutionResult to add failure constructor
impl ExecutionResult {
    pub fn failure(node_id: &str, node_type: &str, error: PipelineError) -> Self {
        Self {
            success: false,
            message: format!("❌ {} node '{}' failed: {}", node_type, node_id, error),
            outputs: HashMap::new(),
            vmaf_results: None,
        }
    }
}