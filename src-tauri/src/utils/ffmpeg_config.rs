// src-tauri/src/utils/ffmpeg_config.rs

//! # FFmpeg Configuration Manager
//! 
//! Manages user-configured paths for FFmpeg and FFprobe executables.
//! 
//! ## Features:
//! - Stores FFmpeg/FFprobe paths in application config
//! - Auto-detects common installation locations
//! - Validates paths before saving
//! - Provides fallback to system PATH
//! 
//! ## Config Storage:
//! Configuration is stored in platform-specific locations:
//! - macOS: ~/Library/Application Support/com.yourapp.videotool/config.json
//! - Linux: ~/.config/videotool/config.json
//! - Windows: %APPDATA%\videotool\config.json

use std::path::PathBuf;
use std::process::Command;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FFmpegConfig {
    #[serde(rename = "ffmpegPath")]
    pub ffmpeg_path: Option<String>,
    
    #[serde(rename = "ffprobePath")]
    pub ffprobe_path: Option<String>,
}

impl FFmpegConfig {
    /// Get the config file path
    fn get_config_path() -> Result<PathBuf, String> {
        // Use platform-specific config directory
        let config_dir = if cfg!(target_os = "macos") {
            dirs::config_dir()
                .ok_or("Could not find config directory")?
                .join("com.yourapp.videotool")
        } else if cfg!(target_os = "linux") {
            dirs::config_dir()
                .ok_or("Could not find config directory")?
                .join("videotool")
        } else if cfg!(target_os = "windows") {
            dirs::config_dir()
                .ok_or("Could not find config directory")?
                .join("videotool")
        } else {
            return Err("Unsupported operating system".to_string());
        };

        // Create config directory if it doesn't exist
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;

        Ok(config_dir.join("config.json"))
    }

    /// Load configuration from disk
    pub fn load() -> Self {
        match Self::get_config_path() {
            Ok(path) => {
                if path.exists() {
                    match fs::read_to_string(&path) {
                        Ok(content) => {
                            match serde_json::from_str(&content) {
                                Ok(config) => {
                                    println!("✅ Loaded FFmpeg config from: {:?}", path);
                                    return config;
                                }
                                Err(e) => {
                                    println!("⚠️ Failed to parse config: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            println!("⚠️ Failed to read config file: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                println!("⚠️ Failed to get config path: {}", e);
            }
        }
        
        // Return default config if loading fails
        Self::default()
    }

    /// Save configuration to disk
    pub fn save(&self) -> Result<(), String> {
        let path = Self::get_config_path()?;
        
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;
        
        fs::write(&path, json)
            .map_err(|e| format!("Failed to write config file: {}", e))?;
        
        println!("✅ Saved FFmpeg config to: {:?}", path);
        Ok(())
    }

    /// Validate a path points to a working FFmpeg executable
    pub fn validate_ffmpeg_path(path: &str) -> Result<String, String> {
        let output = Command::new(path)
            .args(["-version"])
            .output()
            .map_err(|e| format!("Failed to execute FFmpeg at '{}': {}", path, e))?;

        if !output.status.success() {
            return Err(format!("FFmpeg at '{}' failed to run", path));
        }

        let version_info = String::from_utf8_lossy(&output.stdout);
        let first_line = version_info.lines().next().unwrap_or("Unknown version");
        
        Ok(first_line.to_string())
    }

    /// Validate a path points to a working FFprobe executable
    pub fn validate_ffprobe_path(path: &str) -> Result<String, String> {
        let output = Command::new(path)
            .args(["-version"])
            .output()
            .map_err(|e| format!("Failed to execute FFprobe at '{}': {}", path, e))?;

        if !output.status.success() {
            return Err(format!("FFprobe at '{}' failed to run", path));
        }

        let version_info = String::from_utf8_lossy(&output.stdout);
        let first_line = version_info.lines().next().unwrap_or("Unknown version");
        
        Ok(first_line.to_string())
    }

    /// Auto-detect FFmpeg in common locations
    pub fn auto_detect_ffmpeg() -> Option<String> {
        let common_paths = if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
            vec![
                "/usr/local/bin/ffmpeg",
                "/usr/bin/ffmpeg",
                "/opt/homebrew/bin/ffmpeg",
                "/opt/local/bin/ffmpeg",
            ]
        } else if cfg!(target_os = "windows") {
            vec![
                "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
                "C:\\ffmpeg\\bin\\ffmpeg.exe",
            ]
        } else {
            vec![]
        };

        for path in common_paths {
            if let Ok(_) = Self::validate_ffmpeg_path(path) {
                println!("🔍 Auto-detected FFmpeg at: {}", path);
                return Some(path.to_string());
            }
        }

        // Try system PATH as fallback
        if let Ok(_) = Self::validate_ffmpeg_path("ffmpeg") {
            println!("🔍 Found FFmpeg in system PATH");
            return Some("ffmpeg".to_string());
        }

        None
    }

    /// Auto-detect FFprobe in common locations
    pub fn auto_detect_ffprobe() -> Option<String> {
        let common_paths = if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
            vec![
                "/usr/local/bin/ffprobe",
                "/usr/bin/ffprobe",
                "/opt/homebrew/bin/ffprobe",
                "/opt/local/bin/ffprobe",
            ]
        } else if cfg!(target_os = "windows") {
            vec![
                "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
                "C:\\ffmpeg\\bin\\ffprobe.exe",
            ]
        } else {
            vec![]
        };

        for path in common_paths {
            if let Ok(_) = Self::validate_ffprobe_path(path) {
                println!("🔍 Auto-detected FFprobe at: {}", path);
                return Some(path.to_string());
            }
        }

        // Try system PATH as fallback
        if let Ok(_) = Self::validate_ffprobe_path("ffprobe") {
            println!("🔍 Found FFprobe in system PATH");
            return Some("ffprobe".to_string());
        }

        None
    }

    /// Get the FFmpeg command to use (from config or auto-detect)
    pub fn get_ffmpeg_command(&self) -> String {
        if let Some(ref path) = self.ffmpeg_path {
            if Self::validate_ffmpeg_path(path).is_ok() {
                return path.clone();
            }
            println!("⚠️ Configured FFmpeg path '{}' is invalid, trying auto-detect", path);
        }

        // Try auto-detection
        if let Some(detected) = Self::auto_detect_ffmpeg() {
            return detected;
        }

        // Final fallback to system PATH
        "ffmpeg".to_string()
    }

    /// Get the FFprobe command to use (from config or auto-detect)
    pub fn get_ffprobe_command(&self) -> String {
        if let Some(ref path) = self.ffprobe_path {
            if Self::validate_ffprobe_path(path).is_ok() {
                return path.clone();
            }
            println!("⚠️ Configured FFprobe path '{}' is invalid, trying auto-detect", path);
        }

        // Try auto-detection
        if let Some(detected) = Self::auto_detect_ffprobe() {
            return detected;
        }

        // Final fallback to system PATH
        "ffprobe".to_string()
    }
}
