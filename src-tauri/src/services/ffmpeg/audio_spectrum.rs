// src-tauri/src/services/ffmpeg/audio_spectrum.rs

//! # Audio Spectrum Analysis Service
//! 
//! Provides real-time and single-frame audio frequency spectrum visualization.
//! 
//! ## Analysis Modes:
//! 
//! ### Continuous Analysis:
//! - Starts background FFmpeg process with spectrum filter
//! - Emits spectrum data via Tauri events at configurable intervals
//! - Used for real-time visualization during playback
//! 
//! ### Single-Frame Analysis:
//! - Analyzes audio at specific timestamp
//! - Returns frequency domain data for that moment
//! - Used for static spectrum display or snapshots
//! 
//! ## Configuration:
//! - **FFT Size**: Resolution of frequency analysis (1024-8192 bins)
//! - **Window Function**: Analysis window (hann, hamming, blackman)
//! - **Frequency Range**: Min/Max frequencies to analyze
//! - **Color Scheme**: Visualization color mapping
//! - **Scale**: Linear vs logarithmic frequency/amplitude scale
//! 
//! ## Output:
//! Returns SpectrumData with frequency bins and amplitude values,
//! ready for frontend visualization (canvas/WebGL rendering).

use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use tauri::Emitter;  // Add this import for emit() method
use crate::types::{Result, PipelineError};
use crate::utils::ffmpeg_validator::get_ffmpeg_command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpectrumData {
    pub frequencies: Vec<f32>,
    pub timestamp: f64,
    pub bar_count: usize,
    pub sample_rate: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioSpectrumConfig {
    pub bar_count: u32,
    pub sensitivity: f32,
    pub smoothing: f32,
    pub gain_boost: f32,
    pub sample_rate: u32,
    pub update_interval_ms: u64,
}

impl Default for AudioSpectrumConfig {
    fn default() -> Self {
        Self {
            bar_count: 64,
            sensitivity: 0.8,
            smoothing: 0.8,
            gain_boost: 1.5,
            sample_rate: 44100,
            update_interval_ms: 50, // 20 FPS
        }
    }
}

/// Real-time audio spectrum analysis service using FFmpeg
pub struct AudioSpectrumService {
    pub is_analyzing: Arc<Mutex<bool>>,
}

impl AudioSpectrumService {
    pub fn new() -> Self {
        Self {
            is_analyzing: Arc::new(Mutex::new(false)),
        }
    }

    /// Start real-time spectrum analysis
    pub async fn start_spectrum_analysis(
        &self,
        app_handle: tauri::AppHandle,
        video_path: String,
        config: AudioSpectrumConfig,
    ) -> Result<()> {
        // Stop any existing analysis
        self.stop_spectrum_analysis().await?;

        let is_analyzing = Arc::clone(&self.is_analyzing);
        *is_analyzing.lock().unwrap() = true;

        let is_analyzing_clone = Arc::clone(&is_analyzing);
        let video_path_clone = video_path.clone();

        // Spawn analysis thread
        thread::spawn(move || {
            println!("🎵 Starting real-time spectrum analysis for: {}", video_path_clone);

            // FFmpeg command for real-time audio analysis
            let mut cmd = Command::new(get_ffmpeg_command())
                .args([
                    "-i", &video_path_clone,
                    "-filter_complex",
                    &format!(
                        "[0:a]showfreqs=mode=bar:cmode=separate:size={}x200:colors=0x00ff00|0x00ffff|0xaa55ff:rate={}",
                        config.bar_count * 8, // Width scales with bar count
                        1000 / config.update_interval_ms // Frame rate
                    ),
                    "-f", "rawvideo",
                    "-pix_fmt", "rgb24",
                    "-"
                ])
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .spawn()
                .expect("Failed to start FFmpeg spectrum analysis");

            let mut stdout = cmd.stdout.take().expect("Failed to get stdout");
            let mut buffer = vec![0u8; (config.bar_count * 8 * 200 * 3) as usize]; // RGB24 buffer
            let mut frame_count = 0u64;
            let start_time = Instant::now();

            // Analysis loop
            while *is_analyzing_clone.lock().unwrap() {
                use std::io::Read;

                // Read frame data
                if let Ok(bytes_read) = stdout.read(&mut buffer) {
                    if bytes_read == buffer.len() {
                        // Process RGB data to extract frequency information
                        let spectrum_data = Self::extract_spectrum_from_rgb(
                            &buffer,
                            &config,
                            frame_count,
                            start_time.elapsed().as_secs_f64(),
                        );

                        // Emit spectrum data to frontend
                        if let Err(e) = app_handle.emit("spectrum-data", &spectrum_data) {
                            eprintln!("Failed to emit spectrum data: {}", e);
                        }

                        frame_count += 1;
                    } else if bytes_read == 0 {
                        // End of stream
                        break;
                    }
                } else {
                    // Read error
                    break;
                }

                // Control update rate
                thread::sleep(Duration::from_millis(config.update_interval_ms));
            }

            // Clean up
            let _ = cmd.kill();
            let _ = cmd.wait();
            println!("🎵 Spectrum analysis stopped");
        });

        Ok(())
    }

    /// Stop spectrum analysis
    pub async fn stop_spectrum_analysis(&self) -> Result<()> {
        *self.is_analyzing.lock().unwrap() = false;
        // Give some time for the thread to clean up
        thread::sleep(Duration::from_millis(100));
        Ok(())
    }

    /// Check if currently analyzing
    pub fn is_analyzing(&self) -> bool {
        *self.is_analyzing.lock().unwrap()
    }

    /// Extract spectrum data from RGB frame buffer
    fn extract_spectrum_from_rgb(
        rgb_data: &[u8],
        config: &AudioSpectrumConfig,
        _frame_count: u64,
        timestamp: f64,
    ) -> SpectrumData {
        let width = (config.bar_count * 8) as usize;
        let height = 200;
        let mut frequencies = Vec::with_capacity(config.bar_count as usize);

        // Process each frequency bar
        for bar_index in 0..config.bar_count as usize {
            let bar_width = 8; // Each bar is 8 pixels wide
            let bar_start_x = bar_index * bar_width;
            let mut bar_intensity = 0.0f32;
            let mut pixel_count = 0;

            // Sample pixels in this bar column
            for x in bar_start_x..bar_start_x + bar_width {
                for y in 0..height {
                    if x < width && y < height {
                        let pixel_index = (y * width + x) * 3;
                        if pixel_index + 2 < rgb_data.len() {
                            let r = rgb_data[pixel_index] as f32 / 255.0;
                            let g = rgb_data[pixel_index + 1] as f32 / 255.0;
                            let b = rgb_data[pixel_index + 2] as f32 / 255.0;
                            
                            // Calculate brightness (weighted luminance)
                            let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                            bar_intensity += brightness;
                            pixel_count += 1;
                        }
                    }
                }
            }

            // Average and apply gain/sensitivity
            if pixel_count > 0 {
                bar_intensity = (bar_intensity / pixel_count as f32) 
                    * config.gain_boost 
                    * config.sensitivity;
            }

            frequencies.push(bar_intensity.min(1.0));
        }

        SpectrumData {
            frequencies,
            timestamp,
            bar_count: config.bar_count as usize,
            sample_rate: config.sample_rate,
        }
    }

    /// Get static spectrum analysis (single frame)
    pub async fn analyze_audio_frame(
        &self,
        video_path: &str,
        config: &AudioSpectrumConfig,
        timestamp: f64,
    ) -> Result<SpectrumData> {
        println!("🎵 Analyzing audio frame at {}s", timestamp);

        let output = Command::new(get_ffmpeg_command())
            .args([
                "-ss", &timestamp.to_string(),
                "-i", video_path,
                "-t", "0.1", // Analyze 100ms
                "-filter_complex",
                &format!(
                    "[0:a]showfreqs=mode=bar:cmode=separate:size={}x200:colors=0x00ff00|0x00ffff|0xaa55ff:rate=1",
                    config.bar_count * 8
                ),
                "-f", "rawvideo",
                "-pix_fmt", "rgb24",
                "-frames:v", "1",
                "-"
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run spectrum analysis: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(
                format!("Spectrum analysis failed: {}", stderr)
            ));
        }

        // Process the RGB output
        let rgb_data = &output.stdout;
        let spectrum_data = Self::extract_spectrum_from_rgb(rgb_data, config, 0, timestamp);

        Ok(spectrum_data)
    }
}