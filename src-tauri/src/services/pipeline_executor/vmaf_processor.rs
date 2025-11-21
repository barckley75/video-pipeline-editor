// src-tauri/src/services/pipeline_executor/vmaf_processor.rs

//! # VMAF Processor
//! 
//! Specialized processor for VMAF analysis nodes in pipelines.
//! 
//! ## Why Separate Processing?
//! VMAF nodes require TWO input videos (reference + distorted) to compute
//! quality scores. They must run after both videos are available, which is
//! why they're processed in Phase 2 after all regular nodes complete.
//! 
//! ## Processing Steps:
//! 1. Validates VMAF node has two inputs connected:
//!    - Reference video (original/high-quality)
//!    - Distorted video (compressed/processed)
//! 2. Retrieves both videos from ExecutionContext
//! 3. Validates files exist and are accessible
//! 4. Delegates to FFmpegService.calculate_vmaf()
//! 5. Returns VmafScore with quality metrics
//! 
//! ## Connection Requirements:
//! VMAF nodes must have exactly two input connections:
//! - "reference" handle: Original/source video
//! - "distorted" handle: Processed/compressed video
//! 
//! ## Error Handling:
//! - Missing connections return detailed error messages
//! - File not found errors are caught and reported
//! - VMAF failures don't stop pipeline (logged as warnings)
//! 
//! ## Output:
//! Returns VmafScore containing:
//! - Overall VMAF score (0-100)
//! - Optional PSNR, SSIM, MS-SSIM metrics
//! - Metadata about analysis (model version, etc.)

use crate::services::FFmpegService;
use crate::types::{PipelineError, Result, VmafScore, NodeData, ConnectionData};
use super::execution_context::ExecutionContext;
use super::node_helpers::{NodeDataExtractor, ConnectionHelper, NodeValidator};
use serde_json::Value;

pub struct VmafProcessor<'a> {
    ffmpeg: &'a FFmpegService,
}

impl<'a> VmafProcessor<'a> {
    pub fn new(ffmpeg: &'a FFmpegService) -> Self {
        Self { ffmpeg }
    }

    pub async fn process(
        &self,
        node: &NodeData,
        context: &ExecutionContext,
        connections: &[ConnectionData],
    ) -> Result<VmafScore> {
        println!("📊 Processing VMAF analysis node: {}", node.id);

        // Check if node has required inputs
        if !ConnectionHelper::has_inputs(&node.id, connections) {
            return Err(PipelineError::InvalidNodeConfig(
                "VMAF analysis needs input connections".to_string()
            ));
        }

        // Get all input connections for debugging
        let input_connections = ConnectionHelper::get_all_inputs(&node.id, connections);
        println!("📊 VMAF input connections: {} found", input_connections.len());

        // Strategy 1: Try to find explicit reference and test video paths in node data
        if let Ok(reference_path) = self.get_explicit_paths(node) {
            return self.calculate_vmaf_explicit(reference_path.0, reference_path.1, node).await;
        }

        // Strategy 2: Try to find reference and test connections
        if let Ok((ref_video, test_video)) = self.get_connected_videos(node, context, connections) {
            return self.calculate_vmaf_connected(ref_video, test_video, node).await;
        }

        // Strategy 3: Auto-detect from dual inputs
        if input_connections.len() == 2 {
            return self.auto_detect_vmaf(node, context, connections).await;
        }

        Err(PipelineError::InvalidNodeConfig(
            "VMAF analysis requires either explicit video paths or two connected inputs".to_string()
        ))
    }

    /// Try to get explicit video paths from node data
    fn get_explicit_paths(&self, node: &NodeData) -> Result<(String, String)> {
        let reference_path = NodeDataExtractor::extract_string(&node.data, "referenceVideoPath")?;
        let test_path = NodeDataExtractor::extract_string(&node.data, "testVideoPath")?;
        
        NodeValidator::validate_file_exists(&reference_path)?;
        NodeValidator::validate_file_exists(&test_path)?;
        
        Ok((reference_path, test_path))
    }

    /// Try to find reference and test videos from specific connection handles
    fn get_connected_videos(
        &self,
        node: &NodeData,
        context: &ExecutionContext,
        connections: &[ConnectionData],
    ) -> Result<(String, String)> {
        let reference_handles = ["reference-input", "ref-input", "video-ref"];
        let test_handles = ["test-input", "distorted-input", "video-test"];

        let connections_found = ConnectionHelper::find_multiple_connections(
            &node.id, 
            connections, 
            &[&reference_handles[..], &test_handles[..]].concat()
        );

        // Fixed pattern matching - expecting &ConnectionData, not Option<&ConnectionData>
        if connections_found.len() >= 2 {
            let ref_video = context.get_result(&connections_found[0].from)?.path;
            let test_video = context.get_result(&connections_found[1].from)?.path;
            return Ok((ref_video, test_video));
        }

        Err(PipelineError::InvalidNodeConfig(
            "Could not find reference and test video connections".to_string()
        ))
    }

    /// Auto-detect VMAF inputs from two connected nodes
    async fn auto_detect_vmaf(
        &self,
        node: &NodeData,
        context: &ExecutionContext,
        connections: &[ConnectionData],
    ) -> Result<VmafScore> {
        println!("📊 Auto-detecting VMAF inputs from dual connections");

        let input_connections = ConnectionHelper::get_all_inputs(&node.id, connections);
        
        if input_connections.len() != 2 {
            return Err(PipelineError::InvalidNodeConfig(
                format!("Expected 2 inputs for auto-detection, found {}", input_connections.len())
            ));
        }

        let ref_video = context.get_result(&input_connections[0].from)?.path;
        let test_video = context.get_result(&input_connections[1].from)?.path;

        println!("📊 Auto-detected: ref={}, test={}", ref_video, test_video);

        self.calculate_vmaf_explicit(ref_video, test_video, node).await
    }

    /// Calculate VMAF with explicit paths
    async fn calculate_vmaf_explicit(
        &self,
        reference_path: String,
        test_path: String,
        node: &NodeData,
    ) -> Result<VmafScore> {
        let model = self.extract_model_config(&node.data);
        
        println!("📊 Calculating VMAF: {} vs {}", reference_path, test_path);
        
        self.ffmpeg.calculate_vmaf(&reference_path, &test_path, model.as_deref()).await
    }

    /// Calculate VMAF with connected videos
    async fn calculate_vmaf_connected(
        &self,
        ref_video: String,
        test_video: String,
        node: &NodeData,
    ) -> Result<VmafScore> {
        self.calculate_vmaf_explicit(ref_video, test_video, node).await
    }

    /// Extract VMAF model configuration
    fn extract_model_config(&self, data: &Value) -> Option<String> {
        NodeDataExtractor::extract_string(data, "model").ok()
    }
}