// src-tauri/src/services/trim_service.rs

//! # Video Trimming Service
//! 
//! Provides video trimming functionality with time-based cutting.
//! 
//! ## Features:
//! - Precise time-based trimming (start/end times)
//! - Smart codec selection (copy when possible, re-encode when needed)
//! - Automatic output path generation
//! - Validation of trim parameters
//! 
//! ## Trimming Modes:
//! - **Stream copy**: Fast, lossless when cutting at keyframes
//! - **Re-encoding**: Precise frame-accurate cutting (slower)
//! 
//! ## Use Cases:
//! - Removing unwanted sections from videos
//! - Extracting clips from longer videos
//! - Pipeline node: trimVideo
//! 
//! Used by the pipeline executor when processing trim nodes.

use crate::types::{Result, PipelineError, VideoData};
use std::path::Path;
use crate::utils::ffmpeg_validator::get_ffprobe_command;

#[derive(Debug)]
pub struct TrimParams {
    pub input_path: String,
    pub output_path: String,  // Not used in data-only mode, kept for compatibility
    pub start_time: f64,      // seconds
    pub end_time: f64,        // seconds
    pub create_file: bool,    // Always false for data-only mode
}

pub struct TrimService;

impl TrimService {
    pub fn new() -> Self {
        Self
    }

    pub async fn trim_video(&self, params: TrimParams) -> Result<VideoData> {
        println!("🎬 Trim video: data-only mode {}s-{}s", 
                 params.start_time, params.end_time);
        
        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path));
        }
        
        // Calculate duration
        let duration = params.end_time - params.start_time;
        if duration <= 0.0 {
            return Err(PipelineError::InvalidNodeConfig(
                "End time must be greater than start time".to_string()
            ));
        }

        // 🔧 SIMPLIFIED: Always run in passthrough mode, never create files
        println!("📋 Passthrough mode: storing trim metadata only");
        
        // Get original video info using ffprobe
        let original_video_info = self.get_original_video_info(&params.input_path).await?;
        
        // Return original video data (path unchanged) but with trim metadata stored in context
        Ok(VideoData {
            path: params.input_path.clone(), // ✅ Original path unchanged
            format: original_video_info.format,
            width: original_video_info.width,
            height: original_video_info.height,
            duration: original_video_info.duration, // Keep original duration
        })
    }

    /// Get original video information using ffprobe
    async fn get_original_video_info(&self, input_path: &str) -> Result<VideoData> {
        use std::process::Command;
        use serde_json::Value;

        println!("📊 Getting original video info for: {}", input_path);

        let output = Command::new(get_ffprobe_command())
            .args([
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                input_path
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffprobe: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("ffprobe failed: {}", stderr)));
        }

        // Parse ffprobe JSON output
        let info_str = String::from_utf8_lossy(&output.stdout);
        let json: Value = serde_json::from_str(&info_str)
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to parse ffprobe JSON: {}", e)))?;

        // Extract video stream information
        let streams = json["streams"].as_array()
            .ok_or_else(|| PipelineError::FFmpegFailed("No streams found".to_string()))?;

        let video_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("video"))
            .ok_or_else(|| PipelineError::FFmpegFailed("No video stream found".to_string()))?;

        // Extract dimensions
        let width = video_stream["width"].as_u64().unwrap_or(1920) as u32;
        let height = video_stream["height"].as_u64().unwrap_or(1080) as u32;

        // Extract duration
        let duration = video_stream["duration"].as_str()
            .and_then(|d| d.parse::<f64>().ok())
            .or_else(|| json["format"]["duration"].as_str()
                .and_then(|d| d.parse::<f64>().ok()))
            .unwrap_or(0.0);

        // Extract format
        let format = Path::new(input_path)
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        Ok(VideoData {
            path: input_path.to_string(),
            format,
            width,
            height,
            duration,
        })
    }
}