// src-tauri/src/commands/metadata.rs

//! # Metadata Command Handlers
//! 
//! Provides Tauri commands for extracting and validating media file information.
//! 
//! ## Commands:
//! - `get_video_metadata`: Extracts detailed video file metadata (codec, resolution, bitrate, etc.)
//! - `get_audio_metadata`: Extracts audio file metadata (codec, sample rate, channels, etc.)
//! - `check_video_playable`: Validates if a video file can be decoded by FFmpeg
//! - `check_audio_playable`: Validates if an audio file can be decoded by FFmpeg
//! 
//! ## Use Cases:
//! - Input validation before processing
//! - Displaying file information in the UI
//! - Compatibility checks for different codecs/containers
//! 
//! All operations delegate to `FFmpegService` for actual media inspection.

use crate::services::FFmpegService;
use crate::types::{VideoMetadata, AudioMetadata};

#[tauri::command]
pub async fn get_video_metadata(file_path: String) -> Result<VideoMetadata, String> {
    println!("📋 Getting video metadata for: {}", file_path);
    
    let ffmpeg = FFmpegService::new();
    match ffmpeg.get_video_metadata(&file_path).await {
        Ok(metadata) => {
            println!("✅ Successfully retrieved metadata for: {}", file_path);
            println!("   Resolution: {}x{}", metadata.width, metadata.height);
            println!("   Duration: {:.2}s", metadata.duration);
            println!("   Format: {}", metadata.format);
            Ok(metadata)
        },
        Err(e) => {
            println!("❌ Failed to get metadata for {}: {}", file_path, e);
            Err(e.to_string())
        },
    }
}

#[tauri::command]
pub async fn get_audio_metadata(file_path: String) -> Result<AudioMetadata, String> {
    println!("🎵 Getting audio metadata for: {}", file_path);
    
    let ffmpeg = FFmpegService::new();
    match ffmpeg.get_audio_metadata(&file_path).await {
        Ok(metadata) => {
            println!("✅ Successfully retrieved audio metadata for: {}", file_path);
            if let Some(sample_rate) = metadata.sample_rate {
                println!("   Sample Rate: {} Hz", sample_rate);
            }
            if let Some(channels) = metadata.channels {
                println!("   Channels: {}", channels);
            }
            println!("   Duration: {:.2}s", metadata.duration);
            println!("   Format: {}", metadata.format);
            Ok(metadata)
        },
        Err(e) => {
            println!("❌ Failed to get audio metadata for {}: {}", file_path, e);
            Err(e.to_string())
        },
    }
}

#[tauri::command]
pub async fn check_video_playable(file_path: String) -> Result<bool, String> {
    println!("🎮 Checking if video is playable: {}", file_path);
    
    let ffmpeg = FFmpegService::new();
    match ffmpeg.check_video_playable(&file_path).await {
        Ok(playable) => {
            println!("✅ Video playability check: {} is {}", 
                     file_path, if playable { "playable" } else { "not playable" });
            Ok(playable)
        },
        Err(e) => {
            println!("❌ Failed to check video playability for {}: {}", file_path, e);
            Err(e.to_string())
        },
    }
}

#[tauri::command]
pub async fn check_audio_playable(file_path: String) -> Result<bool, String> {
    println!("🎵 Checking if audio is playable: {}", file_path);
    
    let ffmpeg = FFmpegService::new();
    match ffmpeg.check_audio_playable(&file_path).await {
        Ok(playable) => {
            println!("✅ Audio playability check: {} is {}", 
                     file_path, if playable { "playable" } else { "not playable" });
            Ok(playable)
        },
        Err(e) => {
            println!("❌ Failed to check audio playability for {}: {}", file_path, e);
            Err(e.to_string())
        },
    }
}