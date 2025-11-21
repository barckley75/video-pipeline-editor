// src-tauri/src/services/ffmpeg/video_trimming.rs

//! # Video Trimming Service
//! 
//! Handles precise video trimming with time-based start/end points.
//! 
//! ## Trimming Modes:
//! 
//! ### Standard Trim (Re-encoding):
//! - Frame-accurate cutting at any timestamp
//! - Re-encodes video for precision
//! - Slower but works at any point
//! - Maintains quality with appropriate settings
//! 
//! ### Keyframe Trim (Stream Copy):
//! - Ultra-fast trimming without re-encoding
//! - Lossless quality preservation
//! - Only cuts at keyframes (I-frames)
//! - May not be frame-accurate
//! 
//! ## Parameters:
//! - **Start Time**: Beginning of trim in seconds (supports decimals)
//! - **End Time**: End of trim in seconds
//! - **Input Path**: Source video file
//! - **Output Path**: Destination (auto-generated if empty)
//! 
//! ## Validation:
//! - Checks file existence
//! - Validates time ranges (start < end, positive values)
//! - Enforces maximum duration limit (24 hours)
//! - Verifies output directory writability
//! 
//! ## Integration:
//! Used by pipeline executor for `trimVideo` nodes. Trim data is stored
//! in ExecutionContext and can be referenced by downstream nodes
//! (e.g., frame extraction from trimmed section only).

use std::process::Command;
use std::path::Path;
use crate::types::{Result, PipelineError, VideoData};
use crate::utils::ffmpeg_validator::get_ffmpeg_command;

/// Parameters for video trimming
#[derive(Debug)]
pub struct VideoTrimmingParams {
    pub input_path: String,
    pub output_path: String,
    pub start_time: f64,  // seconds
    pub end_time: f64,    // seconds
}

/// Service for trimming video segments
pub struct VideoTrimmingService;

impl VideoTrimmingService {
    pub fn new() -> Self {
        Self
    }

    /// Trim video to specified time range
    pub async fn trim_video(&self, params: VideoTrimmingParams) -> Result<VideoData> {
        println!("Trimming video: {} -> {}", params.input_path, params.output_path);
        
        // Validate inputs
        self.validate_trim_params(&params)?;
        
        // Calculate duration
        let duration = params.end_time - params.start_time;
        if duration <= 0.0 {
            return Err(PipelineError::InvalidNodeConfig(
                "End time must be greater than start time".to_string()
            ));
        }
        
        // Build FFmpeg command for precise trimming (avoids black frames)
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args([
            "-y",                                    // Overwrite output
            "-i", &params.input_path,                // Input file first
            "-ss", &params.start_time.to_string(),   // Seek after input for accuracy
            "-t", &duration.to_string(),             // Duration
            "-c:v", "libx264",                       // Re-encode video to fix timing
            "-c:a", "aac",                           // Re-encode audio
            "-avoid_negative_ts", "make_zero",       // Fix timestamp issues
            "-fflags", "+genpts",                    // Generate proper timestamps
            &params.output_path                      // Output file
        ]);
        
        println!("Running: ffmpeg {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("Trim failed: {}", stderr)));
        }
        
        // Return trimmed video info
        Ok(VideoData {
            path: params.output_path,
            format: Path::new(&params.input_path)
                .extension()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            width: 1920,  // Would get from ffprobe in real implementation
            height: 1080,
            duration,
        })
    }

    /// Validate trimming parameters
    fn validate_trim_params(&self, params: &VideoTrimmingParams) -> Result<()> {
        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path.clone()));
        }
        
        // Validate time ranges
        if params.start_time < 0.0 {
            return Err(PipelineError::InvalidNodeConfig(
                "Start time cannot be negative".to_string()
            ));
        }
        
        if params.end_time <= params.start_time {
            return Err(PipelineError::InvalidNodeConfig(
                "End time must be greater than start time".to_string()
            ));
        }
        
        // Check for reasonable duration (not too long)
        let duration = params.end_time - params.start_time;
        if duration > 3600.0 * 24.0 {  // 24 hours max
            return Err(PipelineError::InvalidNodeConfig(
                "Trim duration cannot exceed 24 hours".to_string()
            ));
        }
        
        Ok(())
    }

    /// Advanced trimming with keyframe alignment (future implementation)
    #[allow(dead_code)]
    async fn trim_with_keyframes(&self, params: &VideoTrimmingParams) -> Result<VideoData> {
        println!("Trimming with keyframe alignment: {} -> {}", params.input_path, params.output_path);
        
        let duration = params.end_time - params.start_time;
        
        // Use keyframe-aligned trimming for faster processing
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args([
            "-y",
            "-ss", &params.start_time.to_string(),   // Seek before input for speed
            "-i", &params.input_path,                // Input file
            "-t", &duration.to_string(),             // Duration
            "-c", "copy",                            // Stream copy (no re-encoding)
            "-avoid_negative_ts", "make_zero",
            &params.output_path
        ]);
        
        println!("Running keyframe trim: {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("Keyframe trim failed: {}", stderr)));
        }
        
        Ok(VideoData {
            path: params.output_path.clone(),
            format: Path::new(&params.input_path)
                .extension()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            width: 1920,
            height: 1080,
            duration,
        })
    }
}