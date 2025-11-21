// src-tauri/src/commands/spectrum.rs

//! # Audio Spectrum Analysis Commands
//! 
//! Provides real-time audio spectrum visualization capabilities via FFmpeg.
//! 
//! ## Commands:
//! - `start_spectrum_analysis`: Begins continuous spectrum analysis for a video file
//! - `stop_spectrum_analysis`: Stops ongoing spectrum analysis
//! - `get_spectrum_analysis_status`: Checks if analysis is currently running
//! - `analyze_audio_frame`: Analyzes spectrum at a specific timestamp
//! 
//! ## Use Cases:
//! - Real-time audio visualization during video playback
//! - Single-frame spectrum analysis at specific points
//! - Audio frequency analysis for editing decisions
//! 
//! ## Implementation:
//! Uses FFmpeg's `showspectrumpic` and spectrum analysis filters to generate
//! frequency domain data, emitted to frontend via Tauri events.

use tauri::{command, AppHandle, State};
use crate::types::{Result, AppState};
use crate::services::ffmpeg::{AudioSpectrumConfig, SpectrumData};

#[command]
pub async fn start_spectrum_analysis(
    app_handle: AppHandle,
    state: State<'_, AppState>,
    video_path: String,
    config: AudioSpectrumConfig,
) -> Result<String> {
    let ffmpeg = &state.ffmpeg_service;
    
    ffmpeg.start_spectrum_analysis(app_handle, video_path, config).await?;
    
    Ok("Spectrum analysis started".to_string())
}

#[command]
pub async fn stop_spectrum_analysis(state: State<'_, AppState>) -> Result<String> {
    let ffmpeg = &state.ffmpeg_service;
    
    ffmpeg.stop_spectrum_analysis().await?;
    
    Ok("Spectrum analysis stopped".to_string())
}

#[command]
pub async fn get_spectrum_analysis_status(state: State<'_, AppState>) -> Result<bool> {
    let ffmpeg = &state.ffmpeg_service;
    Ok(ffmpeg.is_spectrum_analyzing())
}

#[command]
pub async fn analyze_audio_frame(
    state: State<'_, AppState>,
    video_path: String,
    config: AudioSpectrumConfig,
    timestamp: f64,
) -> Result<SpectrumData> {
    let ffmpeg = &state.ffmpeg_service;
    
    ffmpeg.analyze_audio_frame(&video_path, &config, timestamp).await
}