// src-tauri/src/commands/pipeline.rs

//! # Pipeline Execution Commands
//! 
//! Handles execution of node-based video processing pipelines from the frontend.
//! 
//! ## Command:
//! - `execute_pipeline`: Processes a complete pipeline graph with nodes and connections
//! 
//! ## Pipeline Execution Flow:
//! 1. Receives PipelineData (nodes + connections) from frontend
//! 2. Validates pipeline structure and dependencies
//! 3. Delegates to PipelineExecutor for processing
//! 4. Returns ExecutionResult with outputs and errors
//! 
//! ## Node Types Supported:
//! - Input nodes: inputVideo, inputAudio
//! - Processing: trimVideo, trimAudio, convertVideo, convertAudio
//! - Analysis: vmafAnalysis, infoVideo, spectrumAnalyzer
//! - Output: viewVideo, sequenceExtract, gridView
//! 
//! ## Error Handling:
//! Captures node-specific failures and returns structured error information
//! to help users identify which node failed and why.

use crate::services::PipelineExecutor;
use crate::types::{AppState, ExecutionResult, PipelineData};
use tauri::State;

#[tauri::command]
pub async fn execute_pipeline(
    pipeline: PipelineData,
    state: State<'_, AppState>,
) -> Result<ExecutionResult, String> {
    println!("🚀 Received pipeline with {} nodes", pipeline.nodes.len());
    
    // Debug: Print all nodes and their data
    for node in &pipeline.nodes {
        println!("📋 Node: {} (type: {}) - data: {:?}", node.id, node.node_type, node.data);
    }
    
    // Debug: Print all connections
    for connection in &pipeline.connections {
        println!("🔗 Connection: {} -> {} (handles: {} -> {})", 
                 connection.from, connection.to, connection.from_handle, connection.to_handle);
    }
    
    // Store pipeline in state
    {
        let mut pipeline_state = state.pipeline.lock().await;
        *pipeline_state = Some(pipeline.clone());
    }

    println!("🔧 Creating PipelineExecutor...");
    let executor = PipelineExecutor::new();
    
    println!("▶️ Starting pipeline execution...");
    match executor.execute(pipeline).await {
        Ok(result) => {
            if result.success {
                println!("✅ Pipeline execution completed successfully: {}", result.message);
                println!("📤 Outputs: {} files", result.outputs.len());
                for (node_id, output) in &result.outputs {
                    println!("   {} -> {}", node_id, output.path);
                }
                if let Some(vmaf_results) = &result.vmaf_results {
                    println!("📊 VMAF Results: {} analyses", vmaf_results.len());
                    for (node_id, vmaf) in vmaf_results {
                        println!("   {} -> VMAF: {:.1}", node_id, vmaf.mean);
                    }
                }
            } else {
                println!("❌ Pipeline execution failed: {}", result.message);
            }
            Ok(result)
        },
        Err(e) => {
            println!("💥 Pipeline executor error: {:?}", e);
            println!("💥 Error details: {}", e);
            
            // Return a more detailed error message
            let error_msg = format!("Pipeline execution failed: {}", e);
            println!("💥 Returning error: {}", error_msg);
            
            Ok(ExecutionResult {
                success: false,
                message: error_msg,
                outputs: std::collections::HashMap::new(),
                vmaf_results: None,
            })
        },
    }
}