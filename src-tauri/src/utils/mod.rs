// src-tauri/src/utils/mod.rs

//! # Utilities Module
//! 
//! Collection of utility modules for the application.
//! 
//! ## Submodules:
//! - `ffmpeg_config`: FFmpeg path configuration and management
//! - `ffmpeg_validator`: FFmpeg installation validation and version checking
//! - `file_utils`: File system operations and utilities
//! - `path_utils`: Path manipulation and validation

pub mod ffmpeg_config;
pub mod ffmpeg_validator;
pub mod file_utils;
pub mod path_utils;

// Re-export commonly used items for convenience
pub use ffmpeg_config::FFmpegConfig;
pub use ffmpeg_validator::{FFmpegValidator, FFmpegStatus, get_ffmpeg_command, get_ffprobe_command};
pub use file_utils::FileUtils;
pub use path_utils::PathUtils;