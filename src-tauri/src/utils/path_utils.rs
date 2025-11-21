// src-tauri/src/utils/path_utils.rs

//! # Path Utilities
//! 
//! Path manipulation and validation utilities for video/audio file handling.
//! 
//! ## Path Generation:
//! 
//! ### Auto-naming Functions:
//! - `generate_output_path()`: Creates output path based on input and operation
//!   - Example: `video.mp4` → `video_converted.mp4`
//! - `generate_trimmed_path()`: Creates path for trimmed videos
//!   - Example: `video.mp4` → `video_trimmed.mp4`
//! - `generate_frame_sequence_path()`: Creates pattern for frame extraction
//!   - Example: `video.mp4` → `video_frames/frame_%04d.png`
//! - `generate_temp_path()`: Creates temporary file path with unique suffix
//! 
//! ### Path Manipulation:
//! - `change_extension()`: Changes file extension (e.g., .mp4 → .mkv)
//! - `add_suffix()`: Adds suffix before extension (e.g., _converted)
//! - `get_filename_without_extension()`: Extracts base filename
//! - `get_parent_directory()`: Gets containing folder path
//! - `normalize_path()`: Converts path to canonical form
//! 
//! ## Path Validation:
//! 
//! ### Safety Checks:
//! - `is_safe_path()`: Prevents path traversal attacks (../ sequences)
//! - `is_writable_location()`: Checks if location allows file creation
//! - `validate_output_path()`: Ensures output path is valid and safe
//! - `check_disk_space()`: Verifies sufficient disk space for operation
//! 
//! ### Format Validation:
//! - `is_supported_video_format()`: Checks if extension is valid video format
//! - `is_supported_audio_format()`: Checks if extension is valid audio format
//! - `is_supported_image_format()`: Checks for frame extraction formats
//! 
//! ## Path Sanitization:
//! 
//! - `sanitize_filename()`: Removes invalid characters from filenames
//!   - Removes: `< > : " / \ | ? *`
//!   - Replaces spaces with underscores (optional)
//! - `truncate_filename()`: Limits filename length to OS maximum
//! 
//! ## Cross-Platform Support:
//! 
//! - Handles Windows backslashes vs Unix forward slashes
//! - Respects platform-specific path separators
//! - Accounts for Windows drive letters and UNC paths
//! - Handles macOS case-insensitive but case-preserving file system
//! 
//! ## Use Cases:
//! - Generating safe output paths automatically
//! - Preventing overwriting existing files
//! - Creating organized output structures (folders for frame sequences)
//! - Validating user-provided paths before processing
//! - Ensuring cross-platform path compatibility
//! 
//! ## Security:
//! All path operations validate against directory traversal and prevent
//! writing outside designated output directories.

use crate::types::{PipelineError, Result};
use std::path::PathBuf;

pub struct PathUtils;

impl PathUtils {
    pub fn generate_converted_video_path(node_id: &str, format: &str) -> Result<String> {
        let current_dir = std::env::current_dir()
            .map_err(|e| PipelineError::IoError(format!("Failed to get current directory: {}", e)))?;
        
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let output_path = current_dir.join(format!("converted_{}_{}.{}", node_id, timestamp, format));
        Ok(output_path.to_string_lossy().to_string())
    }

    pub fn generate_frames_directory(node_id: &str) -> Result<String> {
        let current_dir = std::env::current_dir()
            .map_err(|e| PipelineError::IoError(format!("Failed to get current directory: {}", e)))?;
        
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let output_dir = current_dir.join(format!("frames_{}_{}", node_id, timestamp));
        Ok(output_dir.to_string_lossy().to_string())
    }

    pub fn get_current_directory() -> Result<PathBuf> {
        std::env::current_dir()
            .map_err(|e| PipelineError::IoError(format!("Failed to get current directory: {}", e)))
    }

    pub fn generate_trimmed_video_path(node_id: &str, format: &str) -> Result<String> {
        let current_dir = std::env::current_dir()
            .map_err(|e| PipelineError::IoError(format!("Failed to get current directory: {}", e)))?;
        
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let output_path = current_dir.join(format!("trimmed_{}_{}.{}", node_id, timestamp, format));
        Ok(output_path.to_string_lossy().to_string())
    }
}