// src-tauri/src/services/ffmpeg/video_info.rs

//! # Video Information Service
//! 
//! Extracts comprehensive video file metadata using FFprobe.
//! 
//! ## Extracted Metadata:
//! 
//! ### Basic Properties:
//! - **Path**: Full file path
//! - **Format**: Container format (mp4, mkv, avi, etc.)
//! - **Duration**: Total video length in seconds
//! - **Size**: File size in bytes
//! 
//! ### Video Stream:
//! - **Codec**: Video codec (h264, hevc, vp9, etc.)
//! - **Resolution**: Width x Height in pixels
//! - **Frame Rate**: Frames per second (fps)
//! - **Bit Rate**: Video bitrate in kbps
//! - **Pixel Format**: YUV420p, RGB24, etc.
//! 
//! ### Audio Stream:
//! - **Codec**: Audio codec (aac, mp3, opus, etc.)
//! - **Sample Rate**: Audio sampling frequency
//! - **Channels**: Number of audio channels
//! - **Bit Rate**: Audio bitrate in kbps
//! 
//! ## Methods:
//! - `get_video_info()`: Returns basic VideoData struct
//! - `get_video_metadata()`: Returns detailed VideoMetadata
//! - `check_video_playable()`: Validates decodability
//! 
//! ## Use Cases:
//! - Input validation before processing
//! - Displaying video properties in UI
//! - Codec compatibility checks
//! - Determining optimal conversion settings

use std::process::Command;
use std::path::{Path, PathBuf};
use crate::types::{Result, PipelineError, VideoData, VideoMetadata};
use serde_json::Value;
use crate::utils::ffmpeg_validator::get_ffprobe_command;

/// Service for getting video information and metadata
pub struct VideoInfoService;

impl VideoInfoService {
    pub fn new() -> Self {
        Self
    }

    /// Get basic video information using ffprobe
    pub async fn get_video_info(&self, path: &str) -> Result<VideoData> {
        // Check if file exists first
        if !Path::new(path).exists() {
            return Err(PipelineError::FileNotFound(path.to_string()));
        }

        println!("Getting video info for: {}", path);

        // Quick validation that ffprobe is available
        crate::utils::FFmpegValidator::quick_validate()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFmpeg not installed. Please install FFmpeg to analyze videos.".to_string()
            ))?;

        let output = Command::new(get_ffprobe_command())
            .args([
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                path
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffprobe (is ffmpeg installed?): {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("ffprobe failed: {}", stderr)));
        }

        // Parse ffprobe JSON output
        let info_str = String::from_utf8_lossy(&output.stdout);
        println!("FFprobe output: {}", info_str);

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

        // Extract duration (try stream first, then format)
        let duration = video_stream["duration"].as_str()
            .and_then(|d| d.parse::<f64>().ok())
            .or_else(|| json["format"]["duration"].as_str()
                .and_then(|d| d.parse::<f64>().ok()))
            .unwrap_or(0.0);

        // Extract format
        let format = Path::new(path)
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        Ok(VideoData {
            path: path.to_string(),
            format,
            width,
            height,
            duration,
        })
    }

    /// Get detailed video metadata using ffprobe
    pub async fn get_video_metadata(&self, file_path: &str) -> Result<VideoMetadata> {
        println!("Getting detailed metadata for: {}", file_path);
        
        // Check if file exists
        let path = PathBuf::from(file_path);
        if !path.exists() {
            return Err(PipelineError::FileNotFound(file_path.to_string()));
        }

        // Quick validation that ffprobe is available
        crate::utils::FFmpegValidator::quick_validate()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFmpeg not installed. Please install FFmpeg to analyze videos.".to_string()
            ))?;

        // Get file size
        let file_size = std::fs::metadata(&path)
            .map(|m| m.len())
            .unwrap_or(0);

        // Run ffprobe to get detailed metadata
        let output = Command::new(get_ffprobe_command())
            .args([
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                file_path
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffprobe: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("ffprobe failed: {}", stderr)));
        }

        // Parse JSON output
        let info_str = String::from_utf8_lossy(&output.stdout);
        let json: Value = serde_json::from_str(&info_str)
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to parse ffprobe JSON: {}", e)))?;

        // Extract format information
        let format_info = json["format"].as_object()
            .ok_or_else(|| PipelineError::FFmpegFailed("No format information found".to_string()))?;

        let streams = json["streams"].as_array()
            .ok_or_else(|| PipelineError::FFmpegFailed("No streams found".to_string()))?;

        // Find video stream
        let video_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("video"));

        // Find audio stream  
        let audio_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("audio"));

        // Extract basic information
        let format = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("unknown")
            .to_lowercase();

        let duration = format_info["duration"].as_str()
            .and_then(|d| d.parse::<f64>().ok())
            .unwrap_or(0.0);

        // Extract video stream details
        let (width, height, fps, codec, bitrate, profile, level, pixel_format) = if let Some(vs) = video_stream {
            let width = vs["width"].as_u64().unwrap_or(0) as u32;
            let height = vs["height"].as_u64().unwrap_or(0) as u32;
            
            // Parse frame rate from r_frame_rate or avg_frame_rate
            let fps = vs["r_frame_rate"].as_str()
                .or_else(|| vs["avg_frame_rate"].as_str())
                .and_then(|fps_str| {
                    if let Some((num, den)) = fps_str.split_once('/') {
                        let num: f32 = num.parse().ok()?;
                        let den: f32 = den.parse().ok()?;
                        if den != 0.0 { Some(num / den) } else { None }
                    } else {
                        fps_str.parse().ok()
                    }
                });

            let codec = vs["codec_name"].as_str().map(|s| s.to_string());
            
            // Parse bitrate from stream or format
            let bitrate = vs["bit_rate"].as_str()
                .and_then(|b| b.parse::<u32>().ok())
                .or_else(|| format_info["bit_rate"].as_str()
                    .and_then(|b| b.parse::<u32>().ok()));

            let profile = vs["profile"].as_str().map(|s| s.to_string());
            let level = vs["level"].as_i64().map(|l| l.to_string());
            let pixel_format = vs["pix_fmt"].as_str().map(|s| s.to_string());

            (width, height, fps, codec, bitrate, profile, level, pixel_format)
        } else {
            (0, 0, None, None, None, None, None, None)
        };

        // Extract audio stream details
        let (audio_codec, audio_sample_rate, audio_channels) = if let Some(as_) = audio_stream {
            let audio_codec = as_["codec_name"].as_str().map(|s| s.to_string());
            let audio_sample_rate = as_["sample_rate"].as_str()
                .and_then(|sr| sr.parse::<u32>().ok());
            let audio_channels = as_["channels"].as_u64().map(|c| c as u32);
            
            (audio_codec, audio_sample_rate, audio_channels)
        } else {
            (None, None, None)
        };

        // Extract color information
        let (color_space, color_primaries, transfer_characteristics) = if let Some(vs) = video_stream {
            let color_space = vs["colorspace"].as_str().map(|s| s.to_string());
            let color_primaries = vs["color_primaries"].as_str().map(|s| s.to_string());
            let transfer_characteristics = vs["color_trc"].as_str().map(|s| s.to_string());
            (color_space, color_primaries, transfer_characteristics)
        } else {
            (None, None, None)
        };

        // Calculate additional metrics
        let total_frames = if let (Some(fps), duration) = (fps, duration) {
            if duration > 0.0 && fps > 0.0 {
                Some((fps * duration as f32).round() as u32)
            } else {
                None
            }
        } else {
            None
        };

        Ok(VideoMetadata {
            path: file_path.to_string(),
            format,
            width,
            height,
            duration,
            bitrate,
            fps,
            codec,
            size: Some(file_size),
            audio_codec,
            audio_sample_rate,
            audio_channels,
            // Extended fields that we should add to the VideoMetadata struct
            profile,
            level,
            pixel_format,
            color_space,
            transfer_characteristics,
            color_primaries,
            chroma_location: None, // Could be extracted if needed
            aspect_ratio: if width > 0 && height > 0 { 
                Some(format!("{:.3}", width as f64 / height as f64)) 
            } else { 
                None 
            },
            start_time: format_info["start_time"].as_str()
                .and_then(|st| st.parse::<f64>().ok()),
            total_frames,
            keyframe_interval: None, // Would need additional analysis
            b_frames: None, // Would need additional analysis  
            has_subtitles: Some(streams.iter().any(|s| s["codec_type"].as_str() == Some("subtitle"))),
            metadata: format_info["tags"].as_object().cloned(),
            streams: Some(streams.clone()),
        })
    }

    /// Check if video is playable in browser
    pub async fn check_video_playable(&self, file_path: &str) -> Result<bool> {
        let path = PathBuf::from(file_path);
        
        if !path.exists() {
            return Err(PipelineError::FileNotFound(file_path.to_string()));
        }
        
        // Check file extension for browser-supported formats
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase())
            .unwrap_or_default();
        
        let supported = matches!(extension.as_str(), "mp4" | "webm" | "ogg");
        
        println!("Video {} (format: {}) is {}", file_path, extension, 
                 if supported { "supported" } else { "not supported" });
        
        Ok(supported)
    }
}