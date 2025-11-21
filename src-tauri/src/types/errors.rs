// src-tauri/src/types/errors.rs

//! # Error Types
//! 
//! Defines all error variants and error handling for the application.
//! 
//! ## PipelineError Variants:
//! 
//! ### FFmpeg Errors:
//! - `FFmpegFailed`: FFmpeg command execution failed with stderr output
//! - `FFmpegNotFound`: FFmpeg binary not found in system PATH
//! - `FFmpegInvalidOutput`: FFmpeg produced invalid or unparseable output
//! 
//! ### File System Errors:
//! - `FileNotFound`: Input file doesn't exist at specified path
//! - `InvalidPath`: Path format is invalid or inaccessible
//! - `DirectoryCreationFailed`: Cannot create output directory
//! - `FileReadError`: Cannot read from file
//! - `FileWriteError`: Cannot write to file
//! 
//! ### Pipeline Errors:
//! - `InvalidNodeConfig`: Node configuration is invalid or missing required fields
//! - `NodeNotFound`: Referenced node ID doesn't exist in pipeline
//! - `ConnectionError`: Invalid connection between nodes
//! - `CircularDependency`: Cycle detected in node graph
//! 
//! ### Parsing Errors:
//! - `JsonParseError`: Failed to parse JSON output from FFmpeg/FFprobe
//! - `MetadataParseError`: Cannot extract required metadata fields
//! 
//! ### Validation Errors:
//! - `InvalidTimeRange`: Trim start/end times are invalid
//! - `UnsupportedFormat`: File format not supported by FFmpeg
//! - `IncompatibleCodec`: Codec not compatible with container format
//! 
//! ## Result Type:
//! Application-wide Result alias: `Result<T> = std::result::Result<T, PipelineError>`
//! 
//! ## Error Conversion:
//! Implements `From<std::io::Error>` and `From<serde_json::Error>` for
//! automatic conversion from standard library errors.
//! 
//! ## Serialization:
//! All errors implement Serialize for sending to frontend via Tauri IPC.

use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum PipelineError {
    FFmpegFailed(String),
    FileNotFound(String),
    InvalidNodeConfig(String),
    IoError(String),
    DirectoryCreationFailed(String),
    InvalidPath(String),
}

impl fmt::Display for PipelineError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PipelineError::FFmpegFailed(msg) => write!(f, "FFmpeg execution failed: {}", msg),
            PipelineError::FileNotFound(path) => write!(f, "File not found: {}", path),
            PipelineError::InvalidNodeConfig(msg) => write!(f, "Invalid node configuration: {}", msg),
            PipelineError::IoError(msg) => write!(f, "IO error: {}", msg),
            PipelineError::DirectoryCreationFailed(msg) => write!(f, "Failed to create directory: {}", msg),
            PipelineError::InvalidPath(path) => write!(f, "Invalid path: {}", path),
        }
    }
}

impl std::error::Error for PipelineError {}

impl From<std::io::Error> for PipelineError {
    fn from(error: std::io::Error) -> Self {
        PipelineError::IoError(error.to_string())
    }
}

pub type Result<T> = std::result::Result<T, PipelineError>;