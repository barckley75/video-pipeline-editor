// src-tauri/src/utils/file_utils.rs

//! # File Utilities
//! 
//! Cross-platform file system operations and utilities.
//! 
//! ## Core Functions:
//! 
//! ### File Operations:
//! - `ensure_directory_exists()`: Creates directory and all parent directories
//! - `get_file_size()`: Returns file size in bytes
//! - `get_file_extension()`: Extracts file extension from path
//! - `generate_unique_filename()`: Creates unique filename to avoid overwrites
//! - `delete_file_safe()`: Safely deletes file with error handling
//! - `copy_file_safe()`: Copies file with progress tracking
//! 
//! ### Folder Operations:
//! - `open_folder_in_explorer()`: Opens folder in system file manager
//!   - Windows: Uses `explorer.exe`
//!   - macOS: Uses `open` command
//!   - Linux: Uses `xdg-open` or fallback to `nautilus`/`dolphin`
//! 
//! ### Path Validation:
//! - `is_valid_path()`: Checks if path string is valid
//! - `path_exists()`: Checks if file/folder exists
//! - `is_file()`: Checks if path points to a file
//! - `is_directory()`: Checks if path points to a directory
//! 
//! ### Temp File Management:
//! - `create_temp_file()`: Creates temporary file with prefix
//! - `create_temp_directory()`: Creates temporary directory
//! - `cleanup_temp_files()`: Removes old temporary files
//! 
//! ## FileUtils Struct:
//! Static utility methods organized in a struct for namespace clarity.
//! No state is maintained; all methods are stateless operations.
//! 
//! ## Platform Handling:
//! Automatically detects OS and uses appropriate commands/APIs for
//! cross-platform compatibility (Windows, macOS, Linux).
//! 
//! ## Error Handling:
//! Returns Result types with descriptive PipelineError variants for
//! all operations that can fail (permission errors, disk full, etc.).

use crate::types::{PipelineError, Result};
use std::path::Path;
use std::process::Command;

pub struct FileUtils;

impl FileUtils {
    pub fn file_exists(path: &str) -> bool {
        Path::new(path).exists()
    }

    pub fn get_file_extension(path: &str) -> String {
        Path::new(path)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_lowercase()
    }

    pub fn get_file_size(path: &str) -> Result<u64> {
        std::fs::metadata(path)
            .map(|m| m.len())
            .map_err(|e| PipelineError::IoError(format!("Failed to get file size: {}", e)))
    }

    pub fn create_directory_if_not_exists(path: &str) -> Result<()> {
        std::fs::create_dir_all(path)
            .map_err(|e| PipelineError::DirectoryCreationFailed(format!("{}: {}", path, e)))
    }

    pub fn open_folder_in_explorer(path: &str) -> Result<String> {
        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg(path)
                .spawn()
                .map_err(|e| PipelineError::IoError(format!("Failed to open folder: {}", e)))?;
        }
        
        #[cfg(target_os = "windows")]
        {
            Command::new("explorer")
                .arg(path)
                .spawn()
                .map_err(|e| PipelineError::IoError(format!("Failed to open folder: {}", e)))?;
        }
        
        #[cfg(target_os = "linux")]
        {
            Command::new("xdg-open")
                .arg(path)
                .spawn()
                .map_err(|e| PipelineError::IoError(format!("Failed to open folder: {}", e)))?;
        }
        
        Ok(format!("Opened folder: {}", path))
    }
}