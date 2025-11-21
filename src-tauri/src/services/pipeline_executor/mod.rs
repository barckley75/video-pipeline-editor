// src-tauri/src/services/pipeline_executor/mod.rs

//! # Pipeline Executor Module
//! 
//! Core engine for executing node-based video processing pipelines.
//! 
//! ## Components:
//! - `PipelineExecutor`: Main orchestrator for pipeline execution
//! - `ExecutionContext`: Manages intermediate results and state during execution
//! - `NodeHandlers`: Delegates to specific handlers for each node type
//! - `NodeHelpers`: Utility functions for node data extraction and validation
//! - `VmafProcessor`: Specialized processor for VMAF analysis nodes
//! 
//! ## Execution Flow:
//! 1. **Dependency Analysis**: Calculates execution order using topological sort
//! 2. **Node Processing**: Executes nodes in dependency order (Phase 1)
//! 3. **VMAF Processing**: Processes VMAF nodes after outputs available (Phase 2)
//! 4. **Result Collection**: Aggregates all outputs and returns ExecutionResult
//! 
//! ## Key Features:
//! - Detects circular dependencies
//! - Ensures nodes execute only after dependencies complete
//! - Passes results between connected nodes
//! - Handles node failures gracefully with detailed error messages
//! - Maintains execution context across node processing

mod execution_context;
mod node_handlers;
mod node_helpers;
mod vmaf_processor;

pub use execution_context::ExecutionContext;
pub use node_handlers::NodeHandlers;
pub use node_helpers::{NodeDataExtractor, ConnectionHelper, NodeValidator};
pub use vmaf_processor::VmafProcessor;

// Re-export the main PipelineExecutor from the parent module
use crate::types::{ExecutionResult, PipelineData, PipelineError, Result, VideoData, NodeData, ConnectionData};
use crate::services::{FFmpegService, TrimService};
use std::collections::HashMap;

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

    /// Main execution entry point - FIXED with dependency ordering
    pub async fn execute(&self, pipeline: PipelineData) -> Result<ExecutionResult> {
        println!("🚀 Starting pipeline with {} nodes", pipeline.nodes.len());

        let mut execution_context = ExecutionContext::new();
        
        // FIXED: Process nodes in dependency order
        let ordered_nodes = self.calculate_execution_order(&pipeline)?;
        println!("🔄 Execution order: {:?}", ordered_nodes);
        
        // Phase 1: Process regular nodes in dependency order
        for node_id in &ordered_nodes {
            let node = pipeline.nodes.iter()
                .find(|n| n.id == *node_id)
                .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Node not found: {}", node_id)))?;
                
            if node.node_type == "vmafAnalysis" { continue; }
            
            match self.process_node(node, &mut execution_context, &pipeline.connections).await {
                Ok(Some(video_data)) => {
                    execution_context.add_result(node.id.clone(), video_data);
                    println!("📋 Stored result for {}: {}", node.id, execution_context.get_result(&node.id).unwrap().path);
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

    /// Single node processor - delegates to specific handlers
    async fn process_node(
        &self,
        node: &NodeData,
        context: &mut ExecutionContext,
        connections: &[ConnectionData],
    ) -> Result<Option<VideoData>> {
        println!("📄 Processing {} ({})", node.id, node.node_type);

        let node_handlers = NodeHandlers::new(&self.ffmpeg, &self.trim_service);
        node_handlers.process(node, context, connections).await
    }

    /// Calculate execution order based on dependencies - FIXED ALGORITHM
    fn calculate_execution_order(&self, pipeline: &PipelineData) -> Result<Vec<String>> {
        // Build adjacency list and in-degree count
        let mut in_degree: HashMap<String, usize> = HashMap::new();
        let mut adj_list: HashMap<String, Vec<String>> = HashMap::new();
        
        // Initialize all nodes with 0 in-degree
        for node in &pipeline.nodes {
            in_degree.insert(node.id.clone(), 0);
            adj_list.insert(node.id.clone(), Vec::new());
        }
        
        // Build the graph from connections
        for connection in &pipeline.connections {
            // connection.from -> connection.to (dependency: to depends on from)
            if let Some(targets) = adj_list.get_mut(&connection.from) {
                targets.push(connection.to.clone());
            }
            if let Some(degree) = in_degree.get_mut(&connection.to) {
                *degree += 1;
            }
        }
        
        // Kahn's algorithm for topological sort
        let mut queue = Vec::new();
        let mut result = Vec::new();
        
        // Start with nodes that have no dependencies (in-degree = 0)
        for (node_id, degree) in &in_degree {
            if *degree == 0 {
                queue.push(node_id.clone());
            }
        }
        
        while let Some(current) = queue.pop() {
            result.push(current.clone());
            
            // For each neighbor of current node
            if let Some(neighbors) = adj_list.get(&current) {
                for neighbor in neighbors {
                    // Decrease in-degree
                    if let Some(degree) = in_degree.get_mut(neighbor) {
                        *degree -= 1;
                        // If in-degree becomes 0, add to queue
                        if *degree == 0 {
                            queue.push(neighbor.clone());
                        }
                    }
                }
            }
        }
        
        // Check for cycles
        if result.len() != pipeline.nodes.len() {
            return Err(PipelineError::InvalidNodeConfig(
                "Circular dependency detected in pipeline".to_string()
            ));
        }
        
        println!("🔗 Dependencies built: {:?}", adj_list);
        println!("📊 In-degrees: {:?}", in_degree);
        
        Ok(result)
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