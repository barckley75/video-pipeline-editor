// src-tauri/src/services/ffmpeg/frame_extraction.rs

//! # Frame Extraction Service
//! 
//! Extracts individual frames from videos as image sequences.
//! 
//! ## Extraction Parameters:
//! - **Format**: Output image format (png, jpg, bmp, tiff)
//! - **Compression**: Quality/compression level (low/medium/high)
//! - **Size**: Resolution (original, 720p, 1080p, custom)
//! - **FPS**: Frame rate (original, 1fps, 24fps, custom)
//! - **Quality**: Image quality for lossy formats (1-100)
//! - **Output Pattern**: Path with pattern (e.g., `video_%04d.png`)
//! 
//! ## Special Features:
//! - **Trim Integration**: Can extract frames only from trimmed section
//! - **Auto-naming**: Generates folder named after source video
//! - **Batch Processing**: Efficient multi-frame extraction
//! 
//! ## Use Cases:
//! - Creating thumbnails or preview grids
//! - Frame-by-frame video analysis
//! - Exporting for animation or editing
//! - Training data for ML models
//! 
//! ## Output:
//! Creates numbered image sequence in specified format and directory.

use std::process::Command;
use std::path::Path;
use crate::types::{Result, PipelineError};
use crate::utils::ffmpeg_validator::get_ffmpeg_command;

/// Parameters for frame extraction
#[derive(Debug)]
pub struct FrameExtractionParams {
    pub input_path: String,
    pub output_pattern: String,
    pub format: String,
    pub compression: String,
    pub size: String,
    pub fps: String,
    pub quality: String,
}

/// Service for extracting video frames as image sequences
pub struct FrameExtractionService;

impl FrameExtractionService {
    pub fn new() -> Self {
        Self
    }

    /// Extract frames from video with specified parameters
    pub async fn extract_frames(&self, params: FrameExtractionParams) -> Result<String> {
        println!("Extracting frames: {} -> {}", params.input_path, params.output_pattern);
        
        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path));
        }
        
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args(["-y", "-i", &params.input_path]);
        
        // Build video filter string
        let mut filters = Vec::new();
        
        // Add FPS filter if not original
        if params.fps != "original" {
            filters.push(format!("fps={}", params.fps));
        }
        
        // Add scale filter if not original
        if params.size != "original" {
            let scale_filter = self.get_scale_filter(&params.size);
            if !scale_filter.is_empty() {
                filters.push(scale_filter);
            }
        }
        
        // Apply filters if any
        if !filters.is_empty() {
            cmd.args(["-vf", &filters.join(",")]);
        }
        
        // Set format-specific quality settings
        self.apply_format_settings(&mut cmd, &params);
        
        // Add output pattern
        cmd.arg(&params.output_pattern);
        
        println!("Running: ffmpeg {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("Frame extraction failed: {}", stderr)));
        }
        
        Ok(format!("Successfully extracted frames to: {}", params.output_pattern))
    }

    /// Extract frames with trim parameters applied
    pub async fn extract_frames_with_trim(
        &self,
        params: FrameExtractionParams,
        start_time: f64,
        end_time: f64
    ) -> Result<String> {
        println!("Extracting frames with trim: {} ({}s-{}s) -> {}", 
                 params.input_path, start_time, end_time, params.output_pattern);
        
        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path));
        }
        
        let duration = end_time - start_time;
        
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args([
            "-y", 
            "-ss", &start_time.to_string(),
            "-i", &params.input_path,
            "-t", &duration.to_string()
        ]);
        
        // Build video filter string
        let mut filters = Vec::new();
        
        // Add FPS filter if not original
        if params.fps != "original" {
            filters.push(format!("fps={}", params.fps));
        }
        
        // Add scale filter if not original
        if params.size != "original" {
            let scale_filter = self.get_scale_filter(&params.size);
            if !scale_filter.is_empty() {
                filters.push(scale_filter);
            }
        }
        
        // Apply filters if any
        if !filters.is_empty() {
            cmd.args(["-vf", &filters.join(",")]);
        }
        
        // Set format-specific quality settings
        self.apply_format_settings(&mut cmd, &params);
        
        // Add output pattern
        cmd.arg(&params.output_pattern);
        
        println!("Running trim+extract: ffmpeg {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("Frame extraction with trim failed: {}", stderr)));
        }
        
        Ok(format!("Successfully extracted trimmed frames to: {}", params.output_pattern))
    }

    /// Get scale filter for different size presets
    fn get_scale_filter(&self, size: &str) -> String {
        match size {
            "4k" => "scale=3840:2160".to_string(),
            "1080p" => "scale=1920:1080".to_string(), 
            "720p" => "scale=1280:720".to_string(),
            "480p" => "scale=854:480".to_string(),
            _ => String::new(),
        }
    }

    /// Apply format-specific quality settings
    fn apply_format_settings(&self, cmd: &mut Command, params: &FrameExtractionParams) {
        match params.format.as_str() {
            "png" => {
                // PNG compression level (0-9, where 9 is highest compression)
                let compression_level = self.get_png_compression(&params.compression);
                cmd.args(["-compression_level", compression_level]);
            }
            "jpg" | "jpeg" => {
                // JPEG quality (1-31, lower is better quality)
                let jpeg_quality = self.get_jpeg_quality(&params.quality);
                cmd.args(["-q:v", jpeg_quality]);
            }
            "tiff" => {
                // TIFF compression
                let compression = match params.compression.as_str() {
                    "none" => "none",
                    "low" => "lzw",
                    "medium" => "zip",
                    "high" => "zip",
                    "maximum" => "zip",
                    _ => "lzw"
                };
                cmd.args(["-compression_algo", compression]);
            }
            _ => {
                // For other formats, use default settings
            }
        }
    }

    /// Get PNG compression level
    fn get_png_compression(&self, compression: &str) -> &'static str {
        match compression {
            "none" => "0",
            "low" => "2", 
            "medium" => "6",
            "high" => "8",
            "maximum" => "9",
            _ => "6"
        }
    }

    /// Get JPEG quality setting
    fn get_jpeg_quality(&self, quality: &str) -> &'static str {
        match quality {
            "low" => "10",
            "medium" => "5",
            "high" => "2", 
            "ultra" => "1",
            _ => "2"
        }
    }
}