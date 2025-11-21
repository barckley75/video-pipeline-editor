// src-tauri/src/services/pipeline_executor/execution_context.rs

//! # Execution Context
//! 
//! Manages state and intermediate results during pipeline execution.
//! 
//! ## Stored Data:
//! 
//! ### Node Results:
//! - Maps node IDs to their VideoData outputs
//! - Allows downstream nodes to access upstream results
//! - Used for passing data through connections
//! 
//! ### Trim Data:
//! - Stores trim parameters (start/end times) by video path
//! - Enables downstream nodes to respect trim boundaries
//! - Example: Frame extraction from only the trimmed portion
//! 
//! ### VMAF Results:
//! - Stores VMAF scores for quality analysis nodes
//! - Separate from regular results as they don't produce video output
//! 
//! ## Methods:
//! - `add_result()`: Stores node output (VideoData)
//! - `get_result()`: Retrieves result from a specific node
//! - `add_trim_data()`: Stores trim parameters for a video
//! - `get_trim_data()`: Retrieves trim data for path-based lookup
//! - `add_vmaf_result()`: Stores VMAF score
//! - `build_result()`: Constructs final ExecutionResult
//! 
//! ## Lifetime:
//! Context exists for the duration of a single pipeline execution,
//! ensuring isolation between different pipeline runs.

use crate::types::{ExecutionResult, PipelineError, Result, VideoData, VmafScore};
use std::collections::HashMap;

/// Trim data information for video processing
#[derive(Debug, Clone)]
pub struct TrimData {
    pub start_time: f64,
    pub end_time: f64,
    pub duration: f64,
}

/// Context for tracking execution state across pipeline nodes
pub struct ExecutionContext {
    /// Results from completed nodes (node_id -> VideoData)
    results: HashMap<String, VideoData>,
    /// VMAF analysis results (node_id -> VmafScore)
    vmaf_results: HashMap<String, VmafScore>,
    /// Trim data associated with video paths (video_path -> TrimData)
    trim_data: HashMap<String, TrimData>,
}

impl ExecutionContext {
    /// Create a new execution context
    pub fn new() -> Self {
        Self {
            results: HashMap::new(),
            vmaf_results: HashMap::new(),
            trim_data: HashMap::new(),
        }
    }

    /// Add a video processing result
    pub fn add_result(&mut self, node_id: String, video_data: VideoData) {
        println!("📋 Adding result for node {}: {}", node_id, video_data.path);
        self.results.insert(node_id, video_data);
    }

    /// Add VMAF analysis result - Fixed to use 'mean' instead of 'overall'
    pub fn add_vmaf_result(&mut self, node_id: String, vmaf_score: VmafScore) {
        println!("📊 Adding VMAF result for node {}: {:.2}", node_id, vmaf_score.mean);
        self.vmaf_results.insert(node_id, vmaf_score);
    }

    /// Add trim data for a video path
    pub fn add_trim_data(&mut self, video_path: String, start_time: f64, end_time: f64) {
        let trim_data = TrimData {
            start_time,
            end_time,
            duration: end_time - start_time,
        };
        println!("✂️ Adding trim data for {}: {}s - {}s", video_path, start_time, end_time);
        self.trim_data.insert(video_path, trim_data);
    }

    /// Get video processing result by node ID
    pub fn get_result(&self, node_id: &str) -> Result<VideoData> {
        self.results
            .get(node_id)
            .cloned()
            .ok_or_else(|| {
                PipelineError::InvalidNodeConfig(format!("No result found for node: {}", node_id))
            })
    }

    /// Get VMAF result by node ID
    pub fn get_vmaf_result(&self, node_id: &str) -> Option<&VmafScore> {
        self.vmaf_results.get(node_id)
    }

    /// Get trim data for a video path
    pub fn get_trim_data(&self, video_path: &str) -> Result<&TrimData> {
        self.trim_data
            .get(video_path)
            .ok_or_else(|| {
                PipelineError::InvalidNodeConfig(format!("No trim data found for video: {}", video_path))
            })
    }

    /// Check if trim data exists for a video path
    pub fn has_trim_data(&self, video_path: &str) -> bool {
        self.trim_data.contains_key(video_path)
    }

    /// Get all processing results
    pub fn get_all_results(&self) -> &HashMap<String, VideoData> {
        &self.results
    }

    /// Get all VMAF results
    pub fn get_all_vmaf_results(&self) -> &HashMap<String, VmafScore> {
        &self.vmaf_results
    }

    /// Build final execution result
    pub fn build_result(self) -> ExecutionResult {
        let _total_nodes = self.results.len() + self.vmaf_results.len();
        let success_count = self.results.len();
        let vmaf_count = self.vmaf_results.len();
        let trim_count = self.trim_data.len();

        let message = if success_count > 0 {
            format!(
                "✅ Pipeline completed successfully! Processed {} nodes{}{}", 
                success_count,
                if vmaf_count > 0 { format!(", {} VMAF analyses", vmaf_count) } else { String::new() },
                if trim_count > 0 { format!(", {} trim operations", trim_count) } else { String::new() }
            )
        } else {
            "❌ No nodes were processed successfully".to_string()
        };

        ExecutionResult {
            success: success_count > 0,
            message,
            outputs: self.results,
            vmaf_results: if self.vmaf_results.is_empty() {
                None
            } else {
                Some(self.vmaf_results)
            },
        }
    }

    /// Get execution statistics
    pub fn get_stats(&self) -> ExecutionStats {
        ExecutionStats {
            total_results: self.results.len(),
            vmaf_analyses: self.vmaf_results.len(),
            trim_operations: self.trim_data.len(),
        }
    }

    /// Clear all execution data (useful for testing)
    pub fn clear(&mut self) {
        self.results.clear();
        self.vmaf_results.clear();
        self.trim_data.clear();
    }

    /// Log current state for debugging - Fixed to use 'mean' instead of 'overall'
    pub fn log_state(&self) {
        println!("🔍 Execution Context State:");
        println!("   📋 Results: {} nodes", self.results.len());
        for (node_id, video_data) in &self.results {
            println!("      {} -> {}", node_id, video_data.path);
        }
        
        println!("   📊 VMAF Results: {} analyses", self.vmaf_results.len());
        for (node_id, vmaf) in &self.vmaf_results {
            println!("      {} -> {:.2}", node_id, vmaf.mean);
        }
        
        println!("   ✂️ Trim Data: {} videos", self.trim_data.len());
        for (path, trim) in &self.trim_data {
            println!("      {} -> {}s-{}s", path, trim.start_time, trim.end_time);
        }
    }
}

/// Statistics about the execution context
#[derive(Debug, Clone)]
pub struct ExecutionStats {
    pub total_results: usize,
    pub vmaf_analyses: usize,
    pub trim_operations: usize,
}