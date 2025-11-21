// src-tauri/src/commands/system.rs

//! # System Utility Commands
//! 
//! Provides system-level operations and FFmpeg validation commands.
//! 
//! ## Commands:
//! - `list_video_formats`: Returns supported video formats (mp4, avi, mov, etc.)
//! - `open_output_folder`: Opens current directory in system file explorer
//! - `open_specific_folder`: Opens a specific path in system file explorer
//! - `convert_video_simple`: Quick video conversion with default settings
//! - `convert_audio_simple`: Quick audio conversion with default settings
//! - `check_ffmpeg_installation`: Comprehensive FFmpeg installation check
//! - `validate_ffmpeg_quick`: Fast FFmpeg availability validation
//! - `get_ffmpeg_version`: Retrieves installed FFmpeg version information
//! - `run_diagnostics`: Runs full diagnostic checks on FFmpeg capabilities
//! 
//! ## FFmpeg Configuration Commands:
//! - `get_ffmpeg_config`: Get current FFmpeg/FFprobe paths
//! - `set_ffmpeg_path`: Set custom FFmpeg executable path
//! - `set_ffprobe_path`: Set custom FFprobe executable path
//! - `validate_ffmpeg_path`: Validate a path is a working FFmpeg
//! - `validate_ffprobe_path`: Validate a path is a working FFprobe
//! - `auto_detect_ffmpeg`: Auto-detect FFmpeg installations
//! - `clear_ffmpeg_config`: Reset to auto-detection
//! 
//! ## FFmpeg Validation:
//! Ensures FFmpeg is properly installed and supports required features
//! (codecs, filters, hardware acceleration) before processing begins.

use crate::services::ConversionParams;
use crate::utils::{FileUtils, FFmpegValidator, FFmpegStatus, FFmpegConfig};
use tauri::State;
use crate::types::AppState;

#[tauri::command]
pub async fn list_video_formats() -> Result<Vec<String>, String> {
    Ok(vec![
        "mp4".to_string(),
        "avi".to_string(),
        "mov".to_string(),
        "mkv".to_string(),
        "webm".to_string(),
        "wmv".to_string(),
        "flv".to_string(),
    ])
}

#[tauri::command]
pub async fn open_output_folder() -> Result<String, String> {
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    
    FileUtils::open_folder_in_explorer(current_dir.to_string_lossy().as_ref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_specific_folder(path: String) -> Result<String, String> {
    FileUtils::open_folder_in_explorer(&path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn convert_video_simple(
    input_path: String,
    output_path: String,
    format: String,
    app_state: State<'_, AppState>,
) -> Result<String, String> {
    // Use default values for all the enhanced parameters
    let params = ConversionParams {
        input_path,
        output_path,
        format,
        quality: "medium".to_string(),
        use_gpu: false,
        gpu_type: "auto".to_string(),
        bitrate_mode: "auto".to_string(),
        custom_bitrate: None,
        crf_value: None,
        resolution: "original".to_string(),
        custom_width: None,
        custom_height: None,
        framerate: "original".to_string(),
        audio_codec: "aac".to_string(),
        audio_bitrate: "128".to_string(),
        trim_start: None,
        trim_end: None,
    };

    app_state.ffmpeg_service
        .convert_video(params)
        .await
        .map(|_| "Conversion completed successfully".to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn convert_audio_simple(
    input_path: String,
    output_path: String,
    format: String,
    app_state: State<'_, AppState>,
) -> Result<String, String> {
    // Use default values for all the enhanced parameters
    let params = crate::services::AudioConversionParams {
        input_path,
        output_path,
        format,
        quality: "medium".to_string(),
        sample_rate: "original".to_string(),
        bitrate: "auto".to_string(),
        bitrate_mode: "auto".to_string(),
        custom_bitrate: None,
        vbr_quality: None,
        channels: "original".to_string(),
        codec: "mp3".to_string(), // Will be auto-selected based on format
        normalize: false,
        volume_gain: None,
        trim_start: None,
        trim_end: None,
    };

    app_state.ffmpeg_service
        .convert_audio(params)
        .await
        .map(|_| "Audio conversion completed successfully".to_string())
        .map_err(|e| e.to_string())
}

// NEW FFMPEG INSTALLATION COMMANDS

#[tauri::command]
pub async fn check_ffmpeg_installation() -> Result<FFmpegStatus, String> {
    println!("ðŸ”§ Checking FFmpeg installation from frontend request...");
    
    match FFmpegValidator::comprehensive_check() {
        Ok(status) => {
            println!("âœ… FFmpeg check completed successfully");
            Ok(status)
        },
        Err(e) => {
            println!("âŒ FFmpeg check failed: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn validate_ffmpeg_quick() -> Result<bool, String> {
    match FFmpegValidator::quick_validate() {
        Ok(_) => {
            println!("âœ… Quick FFmpeg validation passed");
            Ok(true)
        },
        Err(e) => {
            println!("âŒ Quick FFmpeg validation failed: {}", e);
            Ok(false) // Return false instead of error for non-blocking check
        }
    }
}

#[tauri::command] 
pub async fn get_ffmpeg_version() -> Result<String, String> {
    match FFmpegValidator::check_ffmpeg_installation() {
        Ok(version) => Ok(version),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn run_diagnostics() -> Result<DiagnosticReport, String> {
    println!("ðŸ”§ Running comprehensive system diagnostics...");
    
    let mut report = DiagnosticReport {
        ffmpeg_status: None,
        system_info: SystemInfo::collect(),
        test_results: Vec::new(),
        issues_found: Vec::new(),
        recommendations: Vec::new(),
    };

    // Test 1: FFmpeg Installation
    match FFmpegValidator::comprehensive_check() {
        Ok(status) => {
            report.ffmpeg_status = Some(status);
            report.test_results.push(TestResult {
                test_name: "FFmpeg Installation".to_string(),
                passed: true,
                message: "FFmpeg suite is properly installed".to_string(),
            });
        },
        Err(e) => {
            report.test_results.push(TestResult {
                test_name: "FFmpeg Installation".to_string(),
                passed: false,
                message: e.to_string(),
            });
            report.issues_found.push("FFmpeg is not installed or not accessible".to_string());
            report.recommendations.push("Install FFmpeg: https://ffmpeg.org/download.html".to_string());
        }
    }

    // Test 2: Path Environment
    let path_env = std::env::var("PATH").unwrap_or_default();
    if path_env.is_empty() {
        report.issues_found.push("PATH environment variable is empty".to_string());
        report.recommendations.push("Check your system's PATH configuration".to_string());
    }

    // Test 3: Write permissions
    match std::env::current_dir() {
        Ok(current_dir) => {
            let test_file = current_dir.join("write_test.tmp");
            match std::fs::write(&test_file, "test") {
                Ok(_) => {
                    let _ = std::fs::remove_file(&test_file);
                    report.test_results.push(TestResult {
                        test_name: "Write Permissions".to_string(),
                        passed: true,
                        message: "Can write to current directory".to_string(),
                    });
                },
                Err(e) => {
                    report.test_results.push(TestResult {
                        test_name: "Write Permissions".to_string(),
                        passed: false,
                        message: format!("Cannot write to current directory: {}", e),
                    });
                    report.issues_found.push("No write permissions in current directory".to_string());
                    report.recommendations.push("Run the application from a directory with write permissions".to_string());
                }
            }
        },
        Err(e) => {
            report.issues_found.push(format!("Cannot determine current directory: {}", e));
        }
    }

    // Generate overall status
    let passed_tests = report.test_results.iter().filter(|t| t.passed).count();
    let total_tests = report.test_results.len();
    
    println!("âœ… Diagnostics completed: {}/{} tests passed", passed_tests, total_tests);
    
    Ok(report)
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct DiagnosticReport {
    pub ffmpeg_status: Option<FFmpegStatus>,
    pub system_info: SystemInfo,
    pub test_results: Vec<TestResult>,
    pub issues_found: Vec<String>,
    pub recommendations: Vec<String>,
}

// ============================================================================
// FFmpeg Configuration Commands
// ============================================================================

/// Get the current FFmpeg configuration (paths)
#[tauri::command]
pub async fn get_ffmpeg_config() -> Result<FFmpegConfigData, String> {
    let config = FFmpegConfig::load();
    
    Ok(FFmpegConfigData {
        ffmpeg_path: config.ffmpeg_path,
        ffprobe_path: config.ffprobe_path,
    })
}

/// Set FFmpeg path in configuration
#[tauri::command]
pub async fn set_ffmpeg_path(path: String) -> Result<String, String> {
    // Validate the path first
    FFmpegConfig::validate_ffmpeg_path(&path)
        .map_err(|e| format!("Invalid FFmpeg path: {}", e))?;
    
    // Load config, update it, and save
    let mut config = FFmpegConfig::load();
    config.ffmpeg_path = Some(path.clone());
    config.save()
        .map_err(|e| format!("Failed to save config: {}", e))?;
    
    Ok(format!("FFmpeg path set to: {}", path))
}

/// Set FFprobe path in configuration
#[tauri::command]
pub async fn set_ffprobe_path(path: String) -> Result<String, String> {
    // Validate the path first
    FFmpegConfig::validate_ffprobe_path(&path)
        .map_err(|e| format!("Invalid FFprobe path: {}", e))?;
    
    // Load config, update it, and save
    let mut config = FFmpegConfig::load();
    config.ffprobe_path = Some(path.clone());
    config.save()
        .map_err(|e| format!("Failed to save config: {}", e))?;
    
    Ok(format!("FFprobe path set to: {}", path))
}

/// Validate if a path is a working FFmpeg executable
#[tauri::command]
pub async fn validate_ffmpeg_path(path: String) -> Result<String, String> {
    FFmpegConfig::validate_ffmpeg_path(&path)
}

/// Validate if a path is a working FFprobe executable
#[tauri::command]
pub async fn validate_ffprobe_path(path: String) -> Result<String, String> {
    FFmpegConfig::validate_ffprobe_path(&path)
}

/// Auto-detect FFmpeg and FFprobe installations
#[tauri::command]
pub async fn auto_detect_ffmpeg() -> Result<AutoDetectResult, String> {
    let ffmpeg_path = FFmpegConfig::auto_detect_ffmpeg();
    let ffprobe_path = FFmpegConfig::auto_detect_ffprobe();
    
    Ok(AutoDetectResult {
        ffmpeg_found: ffmpeg_path.is_some(),
        ffmpeg_path,
        ffprobe_found: ffprobe_path.is_some(),
        ffprobe_path,
    })
}

/// Clear FFmpeg configuration (reset to auto-detect)
#[tauri::command]
pub async fn clear_ffmpeg_config() -> Result<String, String> {
    let mut config = FFmpegConfig::load();
    config.ffmpeg_path = None;
    config.ffprobe_path = None;
    config.save()
        .map_err(|e| format!("Failed to save config: {}", e))?;
    
    Ok("FFmpeg configuration cleared. Will use auto-detection.".to_string())
}

// ============================================================================
// Data Structures for FFmpeg Configuration
// ============================================================================

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FFmpegConfigData {
    #[serde(rename = "ffmpegPath")]
    pub ffmpeg_path: Option<String>,
    #[serde(rename = "ffprobePath")]
    pub ffprobe_path: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct AutoDetectResult {
    #[serde(rename = "ffmpegFound")]
    pub ffmpeg_found: bool,
    #[serde(rename = "ffmpegPath")]
    pub ffmpeg_path: Option<String>,
    #[serde(rename = "ffprobeFound")]
    pub ffprobe_found: bool,
    #[serde(rename = "ffprobePath")]
    pub ffprobe_path: Option<String>,
}

// ============================================================================
// Existing Diagnostic Structures
// ============================================================================

#[derive(Debug, Clone, serde::Serialize)]
pub struct TestResult {
    pub test_name: String,
    pub passed: bool,
    pub message: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub current_dir: String,
    pub has_path: bool,
}

impl SystemInfo {
    pub fn collect() -> Self {
        Self {
            os: std::env::consts::OS.to_string(),
            arch: std::env::consts::ARCH.to_string(),
            current_dir: std::env::current_dir()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| "unknown".to_string()),
            has_path: std::env::var("PATH").is_ok(),
        }
    }
}