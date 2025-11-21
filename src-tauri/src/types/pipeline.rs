// src-tauri/src/types/pipeline.rs

//! # Pipeline Data Structures
//! 
//! Defines the node graph structure for video processing pipelines.
//! 
//! ## PipelineData:
//! Root structure containing the complete pipeline graph.
//! 
//! ### Fields:
//! - `nodes`: Vector of all nodes in the pipeline
//! - `connections`: Vector of edges connecting nodes
//! 
//! ## NodeData:
//! Represents a single processing node in the graph.
//! 
//! ### Fields:
//! - `id`: Unique identifier (UUID)
//! - `type`: Node type string (inputVideo, trimVideo, convertVideo, etc.)
//! - `data`: JSON object containing node-specific configuration
//! 
//! ### Node Types:
//! - **Input**: inputVideo, inputAudio
//! - **Process**: trimVideo, trimAudio, convertVideo, convertAudio
//! - **Extract**: sequenceExtract
//! - **Analyze**: vmafAnalysis, infoVideo, spectrumAnalyzer
//! - **Display**: viewVideo, gridView
//! 
//! ## ConnectionData:
//! Represents a directed edge from one node to another.
//! 
//! ### Fields:
//! - `id`: Connection identifier (auto-generated if missing)
//! - `from`: Source node ID
//! - `to`: Target node ID
//! - `from_handle`: Output handle name on source node
//! - `to_handle`: Input handle name on target node
//! 
//! ### Handle System:
//! Nodes can have multiple input/output handles (e.g., "input", "output", "reference", "distorted")
//! allowing flexible connections and multi-input nodes like VMAF.
//! 
//! ## ExecutionResult:
//! Result structure returned after pipeline execution.
//! 
//! ### Fields:
//! - `success`: Boolean indicating overall pipeline success
//! - `message`: Human-readable status or error message
//! - `outputs`: HashMap of node_id -> VideoData for all output nodes
//! - `vmaf_results`: Optional HashMap of node_id -> VmafScore
//! 
//! ## Serialization:
//! All structures derive Serialize/Deserialize for JSON IPC with frontend.
//! Uses snake_case for Rust fields, camelCase for JSON (via serde aliases).

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::types::{VideoData, VmafScore};

// Pipeline data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineData {
    pub nodes: Vec<NodeData>,
    pub connections: Vec<ConnectionData>,
}

// Node data structure  
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeData {
    pub id: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub data: serde_json::Value,
}

// Connection data structure - FIXED to handle missing id field
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionData {
    #[serde(default = "default_connection_id")]
    pub id: String,
    pub from: String,
    pub to: String,
    #[serde(alias = "fromHandle")]
    pub from_handle: String,
    #[serde(alias = "toHandle")]
    pub to_handle: String,
}

// Default function for missing connection IDs
fn default_connection_id() -> String {
    use uuid::Uuid;
    Uuid::new_v4().to_string()
}

// Position structure for nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

// Execution result structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub success: bool,
    pub message: String,
    pub outputs: HashMap<String, VideoData>,
    pub vmaf_results: Option<HashMap<String, VmafScore>>,
}