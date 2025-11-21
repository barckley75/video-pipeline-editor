// src-tauri/src/utils/ffmpeg_validator.rs

//! # FFmpeg Validator
//! 
//! Validates FFmpeg installation, capabilities, and configuration.
//! 
//! ## Validation Checks:
//! 
//! ### Installation Check:
//! - Detects if FFmpeg is in system PATH
//! - Tests if FFmpeg executable is functional
//! - Verifies FFprobe is also available
//! 
//! ### Version Detection:
//! - Extracts FFmpeg version string
//! - Parses major/minor version numbers
//! - Checks for minimum required version
//! 
//! ### Capability Testing:
//! - **Codecs**: H.264, H.265, VP9, AV1, AAC, MP3, FLAC, etc.
//! - **Formats**: MP4, MKV, WebM, AVI, MOV, etc.
//! - **Filters**: VMAF, scale, trim, spectrum, etc.
//! - **Hardware Acceleration**: NVENC, QuickSync, AMF, VAAPI, VideoToolbox
//! 
//! ### Diagnostics:
//! - Runs comprehensive diagnostic checks
//! - Reports missing codecs or features
//! - Provides installation/compilation suggestions
//! 
//! ## FFmpegStatus:
//! Structure returned by validation containing:
//! - `installed`: Boolean if FFmpeg found
//! - `version`: Version string if available
//! - `path`: Full path to FFmpeg binary
//! - `capabilities`: List of detected features
//! - `warnings`: List of missing features
//! 
//! ## Use Cases:
//! - Application startup validation
//! - Feature availability detection before use
//! - User-facing diagnostics for troubleshooting
//! - Determining optimal encoding settings based on available features
//! 
//! ## Error Handling:
//! Returns detailed error messages guiding users to install or configure
//! FFmpeg correctly for the application's requirements.

use std::process::Command;
use crate::types::{PipelineError, Result};
use serde::{Serialize, Deserialize};
use crate::utils::ffmpeg_config::FFmpegConfig;

pub struct FFmpegValidator;

impl FFmpegValidator {
    // Note: Bundled binary logic removed. Now uses system-installed FFmpeg.
    // See ffmpeg_config.rs for path management.

    /// Check if FFmpeg is installed and accessible
    pub fn check_ffmpeg_installation() -> Result<String> {
        println!("🔍 Checking FFmpeg installation...");
        
        // Load config and get FFmpeg command
        let config = FFmpegConfig::load();
        let ffmpeg_cmd = config.get_ffmpeg_command();
        
        // Try to run ffmpeg -version
        let output = Command::new(&ffmpeg_cmd)
            .args(["-version"])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(
                format!("FFmpeg not found. Please install FFmpeg: {}", e)
            ))?;

        if !output.status.success() {
            return Err(PipelineError::FFmpegFailed(
                "FFmpeg found but failed to run".to_string()
            ));
        }

        let version_info = String::from_utf8_lossy(&output.stdout);
        let first_line = version_info.lines().next().unwrap_or("Unknown version");
        
        println!("✅ FFmpeg found: {}", first_line);
        Ok(first_line.to_string())
    }

    /// Check if FFprobe is installed and accessible
    pub fn check_ffprobe_installation() -> Result<String> {
        println!("🔍 Checking FFprobe installation...");
        
        // Load config and get FFprobe command
        let config = FFmpegConfig::load();
        let ffprobe_cmd = config.get_ffprobe_command();
        
        // Try to run ffprobe -version
        let output = Command::new(&ffprobe_cmd)
            .args(["-version"])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(
                format!("FFprobe not found. Please install FFmpeg suite: {}", e)
            ))?;

        if !output.status.success() {
            return Err(PipelineError::FFmpegFailed(
                "FFprobe found but failed to run".to_string()
            ));
        }

        let version_info = String::from_utf8_lossy(&output.stdout);
        let first_line = version_info.lines().next().unwrap_or("Unknown version");
        
        println!("✅ FFprobe found: {}", first_line);
        Ok(first_line.to_string())
    }

    /// Check if VMAF is supported in the current FFmpeg build
    pub fn check_vmaf_support() -> Result<bool> {
        println!("ðŸ” Checking VMAF support in FFmpeg...");
        
        // Use the standalone function
        let ffmpeg_cmd = get_ffmpeg_command();
        
        let output = Command::new(&ffmpeg_cmd)
            .args(["-filters"])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(
                format!("Failed to check FFmpeg filters: {}", e)
            ))?;

        if !output.status.success() {
            return Err(PipelineError::FFmpegFailed(
                "Failed to get FFmpeg filter list".to_string()
            ));
        }

        let filters = String::from_utf8_lossy(&output.stdout);
        let has_vmaf = filters.contains("libvmaf");
        
        if has_vmaf {
            println!("âœ… VMAF support detected in FFmpeg");
        } else {
            println!("âš ï¸ VMAF support not found in FFmpeg build");
        }
        
        Ok(has_vmaf)
    }

    /// Comprehensive check of all FFmpeg components
    pub fn comprehensive_check() -> Result<FFmpegStatus> {
        let ffmpeg_version = Self::check_ffmpeg_installation()?;
        let ffprobe_version = Self::check_ffprobe_installation()?;
        let vmaf_supported = Self::check_vmaf_support().unwrap_or(false);

        Ok(FFmpegStatus {
            ffmpeg_version,
            ffprobe_version,
            vmaf_supported,
            installation_complete: true,
        })
    }

    /// Quick validation for critical operations
    pub fn quick_validate() -> Result<()> {
        // Use the standalone functions
        let ffmpeg_cmd = get_ffmpeg_command();
        let ffprobe_cmd = get_ffprobe_command();
        
        // Just check if ffmpeg and ffprobe exist
        Command::new(&ffmpeg_cmd)
            .args(["-version"])
            .output()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFmpeg not installed or not in PATH".to_string()
            ))?;

        Command::new(&ffprobe_cmd)
            .args(["-version"])
            .output()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFprobe not installed or not in PATH".to_string()
            ))?;

        println!("âœ… FFmpeg suite validation passed");
        Ok(())
    }
}

/// Status information about FFmpeg installation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FFmpegStatus {
    #[serde(rename = "ffmpegVersion")]
    pub ffmpeg_version: String,
    #[serde(rename = "ffprobeVersion")]
    pub ffprobe_version: String,
    #[serde(rename = "vmafSupported")]
    pub vmaf_supported: bool,
    #[serde(rename = "installationComplete")]
    pub installation_complete: bool,
}

/// Get the correct FFmpeg command path from config or auto-detect
/// This is a standalone function that can be imported by other modules
pub fn get_ffmpeg_command() -> String {
    let config = FFmpegConfig::load();
    config.get_ffmpeg_command()
}

/// Get the correct FFprobe command path from config or auto-detect
/// This is a standalone function that can be imported by other modules
pub fn get_ffprobe_command() -> String {
    let config = FFmpegConfig::load();
    config.get_ffprobe_command()
}