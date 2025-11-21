// src-tauri/src/services/pipeline_executor/node_helpers.rs

//! # Node Helper Utilities
//! 
//! Provides utility functions for node data extraction, validation, and connection handling.
//! 
//! ## NodeDataExtractor:
//! Safely extracts typed values from node's JSON data field.
//! 
//! ### Methods:
//! - `extract_string()`: Gets required string field
//! - `extract_string_or_default()`: Gets string with fallback default
//! - `extract_f64()`: Gets required float field
//! - `extract_f64_or_default()`: Gets float with fallback default
//! - `extract_bool_or_default()`: Gets boolean with fallback
//! - `extract_optional_f64()`: Gets optional float (None if missing)
//! 
//! ## ConnectionHelper:
//! Navigates node connections to find input/output relationships.
//! 
//! ### Methods:
//! - `find_source_node()`: Finds the node connected to specified input handle
//! - `find_connected_nodes()`: Finds all nodes connected to a node's outputs
//! - `get_connection_handle()`: Gets the output handle name for a connection
//! 
//! ## NodeValidator:
//! Validates node parameters and file system requirements.
//! 
//! ### Methods:
//! - `validate_file_exists()`: Checks if input file exists
//! - `validate_time_range()`: Validates trim start/end times are logical
//! - `validate_output_path()`: Ensures output directory exists or can be created
//! - `validate_required_connection()`: Ensures required inputs are connected
//! 
//! ## Error Handling:
//! All helpers return Result types with descriptive PipelineError variants
//! to help users understand configuration issues.

use crate::types::{PipelineError, Result, VideoData, ConnectionData};
use super::execution_context::ExecutionContext;
use serde_json::Value;

/// Helper for extracting data from node configurations
pub struct NodeDataExtractor;

impl NodeDataExtractor {
    /// Extract string value from node data (Value, not HashMap)
    pub fn extract_string(data: &Value, key: &str) -> Result<String> {
        data.get(key)
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid {}", key)))
    }

    /// Extract string value with default fallback
    pub fn extract_string_or_default(data: &Value, key: &str, default: &str) -> String {
        data.get(key)
            .and_then(|v| v.as_str())
            .unwrap_or(default)
            .to_string()
    }

    /// Extract boolean value from node data
    pub fn extract_bool(data: &Value, key: &str) -> Result<bool> {
        data.get(key)
            .and_then(|v| v.as_bool())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid {}", key)))
    }

    /// Extract boolean value with default fallback
    pub fn extract_bool_or_default(data: &Value, key: &str, default: bool) -> bool {
        data.get(key)
            .and_then(|v| v.as_bool())
            .unwrap_or(default)
    }

    /// Extract f64 value from node data
    pub fn extract_f64(data: &Value, key: &str) -> Result<f64> {
        data.get(key)
            .and_then(|v| v.as_f64())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid {}", key)))
    }

    /// Extract f64 value with default fallback
    pub fn extract_f64_or_default(data: &Value, key: &str, default: f64) -> f64 {
        data.get(key)
            .and_then(|v| v.as_f64())
            .unwrap_or(default)
    }

    /// Extract i64 value from node data
    pub fn extract_i64(data: &Value, key: &str) -> Result<i64> {
        data.get(key)
            .and_then(|v| v.as_i64())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid {}", key)))
    }

    /// Extract i64 value with default fallback
    pub fn extract_i64_or_default(data: &Value, key: &str, default: i64) -> i64 {
        data.get(key)
            .and_then(|v| v.as_i64())
            .unwrap_or(default)
    }

    /// Extract u64 value from node data
    pub fn extract_u64(data: &Value, key: &str) -> Result<u64> {
        data.get(key)
            .and_then(|v| v.as_u64())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid {}", key)))
    }

    /// Extract u64 value with default fallback
    pub fn extract_u64_or_default(data: &Value, key: &str, default: u64) -> u64 {
        data.get(key)
            .and_then(|v| v.as_u64())
            .unwrap_or(default)
    }

    /// Extract nested object value - Fixed lifetime and Value type
    pub fn extract_object<'a>(data: &'a Value, key: &str) -> Result<&'a Value> {
        data.get(key)
            .ok_or_else(|| PipelineError::InvalidNodeConfig(format!("Missing or invalid object {}", key)))
    }

    /// Extract nested string from object
    pub fn extract_nested_string(data: &Value, parent_key: &str, child_key: &str) -> Result<String> {
        let parent = Self::extract_object(data, parent_key)?;
        parent.get(child_key)
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| PipelineError::InvalidNodeConfig(
                format!("Missing or invalid {}.{}", parent_key, child_key)
            ))
    }

    /// Extract nested string with default fallback
    pub fn extract_nested_string_or_default(
        data: &Value, 
        parent_key: &str, 
        child_key: &str, 
        default: &str
    ) -> String {
        data.get(parent_key)
            .and_then(|parent| parent.get(child_key))
            .and_then(|v| v.as_str())
            .unwrap_or(default)
            .to_string()
    }
}

/// Helper for managing connections between nodes
pub struct ConnectionHelper;

impl ConnectionHelper {
    /// Get input video data from connected node
    pub fn get_input_video(
        node_id: &str,
        context: &ExecutionContext,
        connections: &[ConnectionData],
        handle: &str,
    ) -> Result<VideoData> {
        // Find connection to this node with the specified handle
        let connection = connections
            .iter()
            .find(|conn| conn.to == node_id && conn.to_handle == handle)
            .ok_or_else(|| {
                PipelineError::InvalidNodeConfig(format!(
                    "No {} connection found for node {}", handle, node_id
                ))
            })?;

        // Get the source video data from execution context
        context.get_result(&connection.from)
    }

    /// Get all input connections for a node - Fixed lifetime
    pub fn get_input_connections<'a>(node_id: &str, connections: &'a [ConnectionData]) -> Vec<&'a ConnectionData> {
        connections
            .iter()
            .filter(|conn| conn.to == node_id)
            .collect()
    }

    /// Get all output connections for a node - Fixed lifetime  
    pub fn get_output_connections<'a>(node_id: &str, connections: &'a [ConnectionData]) -> Vec<&'a ConnectionData> {
        connections
            .iter()
            .filter(|conn| conn.from == node_id)
            .collect()
    }

    /// Check if node has input connection of specific type
    pub fn has_input_connection(node_id: &str, connections: &[ConnectionData], handle: &str) -> bool {
        connections
            .iter()
            .any(|conn| conn.to == node_id && conn.to_handle == handle)
    }

    /// Check if node has any inputs (for VMAF processor)
    pub fn has_inputs(node_id: &str, connections: &[ConnectionData]) -> bool {
        connections
            .iter()
            .any(|conn| conn.to == node_id)
    }

    /// Get all inputs for a node (for VMAF processor)
    pub fn get_all_inputs<'a>(node_id: &str, connections: &'a [ConnectionData]) -> Vec<&'a ConnectionData> {
        Self::get_input_connections(node_id, connections)
    }

    /// Find multiple connections (for VMAF processor)
    pub fn find_multiple_connections<'a>(
        node_id: &str,
        connections: &'a [ConnectionData],
        handles: &[&str],
    ) -> Vec<&'a ConnectionData> {
        connections
            .iter()
            .filter(|conn| conn.to == node_id && handles.contains(&conn.to_handle.as_str()))
            .collect()
    }

    /// Get source node ID for a specific input handle
    pub fn get_source_node_id(
        node_id: &str,
        connections: &[ConnectionData],
        handle: &str,
    ) -> Result<String> {
        connections
            .iter()
            .find(|conn| conn.to == node_id && conn.to_handle == handle)
            .map(|conn| conn.from.clone())
            .ok_or_else(|| {
                PipelineError::InvalidNodeConfig(format!(
                    "No source node found for {}:{}", node_id, handle
                ))
            })
    }
}

/// Helper for validating node configurations and data
pub struct NodeValidator;

impl NodeValidator {
    /// Validate that a file exists
    pub fn validate_file_exists(path: &str) -> Result<()> {
        if std::path::Path::new(path).exists() {
            Ok(())
        } else {
            Err(PipelineError::FileNotFound(path.to_string()))
        }
    }

    /// Validate numeric range
    pub fn validate_range(value: f64, min: f64, max: f64, field_name: &str) -> Result<()> {
        if value >= min && value <= max {
            Ok(())
        } else {
            Err(PipelineError::InvalidNodeConfig(format!(
                "{} must be between {} and {}, got {}",
                field_name, min, max, value
            )))
        }
    }

    /// Validate that a string is not empty
    pub fn validate_non_empty_string(value: &str, field_name: &str) -> Result<()> {
        if !value.trim().is_empty() {
            Ok(())
        } else {
            Err(PipelineError::InvalidNodeConfig(format!(
                "{} cannot be empty", field_name
            )))
        }
    }

    /// Validate that a value is in a list of allowed values
    pub fn validate_enum(value: &str, allowed: &[&str], field_name: &str) -> Result<()> {
        if allowed.contains(&value) {
            Ok(())
        } else {
            Err(PipelineError::InvalidNodeConfig(format!(
                "{} must be one of {:?}, got '{}'",
                field_name, allowed, value
            )))
        }
    }

    /// Validate bitrate value (in Mbps)
    pub fn validate_bitrate(bitrate: &str) -> Result<f64> {
        bitrate.parse::<f64>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid bitrate format".to_string()))
            .and_then(|val| {
                if val > 0.0 && val <= 200.0 {
                    Ok(val)
                } else {
                    Err(PipelineError::InvalidNodeConfig(
                        "Bitrate must be between 0.1 and 200 Mbps".to_string()
                    ))
                }
            })
    }

    /// Validate CRF value (0-51)
    pub fn validate_crf(crf: &str) -> Result<u8> {
        crf.parse::<u8>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid CRF format".to_string()))
            .and_then(|val| {
                if val <= 51 {
                    Ok(val)
                } else {
                    Err(PipelineError::InvalidNodeConfig(
                        "CRF must be between 0 and 51".to_string()
                    ))
                }
            })
    }

    /// Validate resolution dimensions
    pub fn validate_resolution(width: &str, height: &str) -> Result<(u32, u32)> {
        let w = width.parse::<u32>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid width format".to_string()))?;
        let h = height.parse::<u32>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid height format".to_string()))?;
        
        if w >= 32 && h >= 32 && w <= 7680 && h <= 4320 {
            Ok((w, h))
        } else {
            Err(PipelineError::InvalidNodeConfig(
                "Resolution must be between 32x32 and 7680x4320".to_string()
            ))
        }
    }

    /// Validate framerate
    pub fn validate_framerate(fps: &str) -> Result<f64> {
        if fps == "original" {
            return Ok(0.0); // Special case for original framerate
        }
        
        fps.parse::<f64>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid framerate format".to_string()))
            .and_then(|val| {
                if val > 0.0 && val <= 120.0 {
                    Ok(val)
                } else {
                    Err(PipelineError::InvalidNodeConfig(
                        "Framerate must be between 0.1 and 120 fps".to_string()
                    ))
                }
            })
    }

    /// Validate audio bitrate (in kbps)
    pub fn validate_audio_bitrate(bitrate: &str) -> Result<u32> {
        bitrate.parse::<u32>()
            .map_err(|_| PipelineError::InvalidNodeConfig("Invalid audio bitrate format".to_string()))
            .and_then(|val| {
                if val >= 32 && val <= 640 {
                    Ok(val)
                } else {
                    Err(PipelineError::InvalidNodeConfig(
                        "Audio bitrate must be between 32 and 640 kbps".to_string()
                    ))
                }
            })
    }
}