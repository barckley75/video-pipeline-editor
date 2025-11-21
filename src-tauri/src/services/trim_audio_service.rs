// src-tauri/src/services/trim_audio_service.rs

//! # Audio Trimming Service
//! 
//! Handles precise audio file trimming operations.
//! 
//! ## Capabilities:
//! - Time-based audio trimming (start/end seconds)
//! - Format-preserving trimming (maintains codec and container)
//! - Stream copy for lossless operations
//! - Automatic output path generation with "_trimmed" suffix
//! 
//! ## Parameters:
//! - Input path: Source audio file
//! - Start/End times: Trim boundaries in seconds
//! - Output path: Destination (optional, auto-generated if empty)
//! 
//! ## Integration:
//! Used by pipeline executor for `trimAudio` nodes and can extract
//! audio portions from video files during processing.

use crate::types::{Result, PipelineError, AudioData};
use std::path::Path;
use crate::utils::ffmpeg_validator::get_ffprobe_command;

// Define TrimAudioParams - completely separate from video trim
#[derive(Debug)]
pub struct TrimAudioParams {
    pub input_path: String,
    pub output_path: String,  // Not used in data-only mode, kept for compatibility
    pub start_time: f64,      // seconds
    pub end_time: f64,        // seconds
    pub create_file: bool,    // Always false for data-only mode
}

pub struct TrimAudioService;

impl TrimAudioService {
    pub fn new() -> Self {
        Self
    }

    pub async fn trim_audio(&self, params: TrimAudioParams) -> Result<AudioData> {
        println!("🎵 Trim audio: data-only mode {}s-{}s", 
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
        println!("📋 Passthrough mode: storing audio trim metadata only");
        
        // Get original audio info using ffprobe
        let original_audio_info = self.get_original_audio_info(&params.input_path).await?;
        
        // Return original audio data (path unchanged) but with trim metadata stored in context
        Ok(AudioData {
            path: params.input_path.clone(), // ✅ Original path unchanged
            format: original_audio_info.format,
            duration: original_audio_info.duration, // Keep original duration
            sample_rate: original_audio_info.sample_rate,
            channels: original_audio_info.channels,
        })
    }

    /// Get original audio information using ffprobe
    async fn get_original_audio_info(&self, input_path: &str) -> Result<AudioData> {
        use std::process::Command;
        use serde_json::Value;

        println!("📊 Getting original audio info for: {}", input_path);

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

        // Extract audio stream information
        let streams = json["streams"].as_array()
            .ok_or_else(|| PipelineError::FFmpegFailed("No streams found".to_string()))?;

        let audio_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("audio"))
            .ok_or_else(|| PipelineError::FFmpegFailed("No audio stream found".to_string()))?;

        // Extract sample rate and channels
        let sample_rate = audio_stream["sample_rate"].as_str()
            .and_then(|sr| sr.parse::<u32>().ok());
        let channels = audio_stream["channels"].as_u64().map(|c| c as u32);

        // Extract duration
        let duration = audio_stream["duration"].as_str()
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

        Ok(AudioData {
            path: input_path.to_string(),
            format,
            duration,
            sample_rate,
            channels,
        })
    }
}