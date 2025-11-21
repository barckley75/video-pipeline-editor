// src-tauri/src/commands/vmaf.rs

//! # VMAF Video Quality Analysis Commands
//! 
//! Handles VMAF (Video Multimethod Assessment Fusion) quality scoring between videos.
//! 
//! ## Commands:
//! - `calculate_vmaf_score`: Computes VMAF score comparing reference and distorted videos
//! - `check_vmaf_support`: Verifies FFmpeg has libvmaf support compiled in
//! - `quick_vmaf_check`: Fast VMAF capability check without full analysis
//! 
//! ## VMAF Overview:
//! VMAF is a perceptual video quality assessment algorithm that predicts subjective
//! video quality based on a reference (original) and distorted (processed) video.
//! Scores range from 0-100, with higher scores indicating better quality.
//! 
//! ## Requirements:
//! - FFmpeg compiled with `--enable-libvmaf`
//! - VMAF model files available on the system
//! 
//! ## Use Cases:
//! - Comparing compressed videos to originals
//! - Validating encoding quality settings
//! - A/B testing different encoding parameters

use crate::services::FFmpegService;
use crate::types::VmafScore;

#[tauri::command]
pub async fn calculate_vmaf_score(
    reference_path: String,
    distorted_path: String,
    model: Option<String>
) -> Result<VmafScore, String> {
    let ffmpeg = FFmpegService::new();
    
    match ffmpeg.calculate_vmaf(&reference_path, &distorted_path, model.as_deref()).await {
        Ok(score) => Ok(score),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn check_vmaf_support() -> Result<bool, String> {
    let ffmpeg = FFmpegService::new();
    Ok(ffmpeg.check_vmaf_support().await)
}

#[tauri::command]
pub async fn quick_vmaf_check(
    reference_path: String,
    distorted_path: String
) -> Result<f64, String> {
    let ffmpeg = FFmpegService::new();
    
    match ffmpeg.quick_vmaf(&reference_path, &distorted_path).await {
        Ok(score) => Ok(score),
        Err(e) => Err(e.to_string()),
    }
}