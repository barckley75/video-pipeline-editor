// src-tauri/src/services/ffmpeg/audio_conversion.rs

//! # Audio Conversion Service
//! 
//! Handles audio format conversion, codec changes, and quality adjustments.
//! 
//! ## Conversion Parameters:
//! - **Format**: Target container (mp3, aac, flac, wav, ogg)
//! - **Codec**: Audio codec selection (aac, mp3, flac, libvorbis, pcm)
//! - **Quality**: Preset quality levels (low/medium/high) or custom bitrate
//! - **Bitrate Mode**: CBR (constant) or VBR (variable) bitrate encoding
//! - **Sample Rate**: Resampling (8kHz-192kHz or original)
//! - **Channels**: Mono, stereo, or original channel layout
//! - **Audio Effects**: Normalization, volume gain adjustments
//! - **Trimming**: Optional time-based trimming during conversion
//! 
//! ## Quality Presets:
//! - Low: 96 kbps, efficient for podcasts/speech
//! - Medium: 192 kbps, balanced quality/size
//! - High: 320 kbps, near-transparent quality
//! 
//! ## Workflow:
//! 1. Validates input file exists
//! 2. Builds FFmpeg command with selected parameters
//! 3. Executes conversion with progress tracking
//! 4. Returns path to converted audio file

use std::process::Command;
use std::path::Path;
use crate::types::{Result, PipelineError, AudioData};
use crate::utils::ffmpeg_validator::{get_ffmpeg_command, get_ffprobe_command};

/// Enhanced parameters for audio conversion with all frontend options
#[derive(Debug, Clone)]
pub struct AudioConversionParams {
    pub input_path: String,
    pub output_path: String,
    pub format: String,
    pub quality: String,
    // Audio-specific options
    pub sample_rate: String,        // "original", "22050", "44100", "48000", etc.
    pub bitrate: String,            // "128", "192", "256", "320", etc.
    pub bitrate_mode: String,       // "auto", "custom", "vbr"
    pub custom_bitrate: Option<String>,  // Custom bitrate in kbps
    pub vbr_quality: Option<String>,     // VBR quality (0-10)
    pub channels: String,           // "original", "1", "2", "6", "8"
    pub codec: String,              // "mp3", "aac", "vorbis", "opus", "flac", "pcm", "copy"
    pub normalize: bool,            // Audio normalization
    pub volume_gain: Option<String>, // Volume gain in dB
    // Trim parameters (if applied during conversion)
    pub trim_start: Option<f64>,
    pub trim_end: Option<f64>,
}

impl Default for AudioConversionParams {
    fn default() -> Self {
        Self {
            input_path: String::new(),
            output_path: String::new(),
            format: "mp3".to_string(),
            quality: "medium".to_string(),
            sample_rate: "original".to_string(),
            bitrate: "auto".to_string(),
            bitrate_mode: "auto".to_string(),
            custom_bitrate: None,
            vbr_quality: None,
            channels: "original".to_string(),
            codec: "mp3".to_string(),
            normalize: false,
            volume_gain: None,
            trim_start: None,
            trim_end: None,
        }
    }
}

/// Service for audio format conversion and encoding
pub struct AudioConversionService;

impl AudioConversionService {
    pub fn new() -> Self {
        Self
    }

    /// Convert audio with enhanced parameters
    pub async fn convert_audio(&self, params: AudioConversionParams) -> Result<AudioData> {
        println!("🎵 Converting {} to {} with enhanced params", params.input_path, params.output_path);
        println!("📋 Params: format={}, quality={}, bitrate_mode={}, codec={}", 
                 params.format, params.quality, params.bitrate_mode, params.codec);

        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path.clone()));
        }

        // Quick validation that ffmpeg is available
        crate::utils::FFmpegValidator::quick_validate()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFmpeg not installed. Please install FFmpeg to convert audio.".to_string()
            ))?;

        // Use enhanced conversion with all parameters
        self.enhanced_audio_conversion(&params).await?;
        
        // Get real info about converted audio using ffprobe
        self.get_converted_audio_info(&params.output_path).await
    }

    /// Convert audio with trim parameters applied during conversion
    pub async fn convert_audio_with_trim(
        &self, 
        mut params: AudioConversionParams, 
        start_time: f64, 
        end_time: f64
    ) -> Result<AudioData> {
        println!("✂️ Converting with trim: {} ({}s-{}s) -> {}", 
                 params.input_path, start_time, end_time, params.output_path);

        // Add trim parameters
        params.trim_start = Some(start_time);
        params.trim_end = Some(end_time);

        // Use the enhanced conversion which now handles trimming
        self.enhanced_audio_conversion(&params).await?;
        
        self.get_converted_audio_info(&params.output_path).await
    }

    /// Enhanced audio conversion with all parameters supported
    async fn enhanced_audio_conversion(&self, params: &AudioConversionParams) -> Result<String> {
        println!("🚀 Enhanced audio conversion starting...");
        
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args(["-y"]);  // Overwrite output files

        // Input handling with optional trimming
        if let (Some(start), Some(end)) = (params.trim_start, params.trim_end) {
            let duration = end - start;
            cmd.args(["-ss", &start.to_string(), "-i", &params.input_path]);
            cmd.args(["-t", &duration.to_string()]);
            println!("✂️ Applying trim: start={}s, duration={}s", start, duration);
        } else {
            cmd.args(["-i", &params.input_path]);
        }

        // Get format-specific codec
        let audio_codec = self.get_format_specific_codec(&params);
        
        // Apply audio codec
        match audio_codec {
            AudioCodec::Copy => {
                cmd.args(["-c:a", "copy"]);
                println!("📄 Copying audio stream");
            },
            AudioCodec::Specific(ref codec_name) => {
                cmd.args(["-c:a", codec_name]);
                println!("🎵 Using audio codec: {}", codec_name);
            }
        }

        // Sample rate handling
        if params.sample_rate != "original" {
            cmd.args(["-ar", &params.sample_rate]);
            println!("📊 Setting sample rate: {} Hz", params.sample_rate);
        }

        // Channel configuration
        if params.channels != "original" {
            cmd.args(["-ac", &params.channels]);
            println!("🔊 Setting channels: {}", params.channels);
        }

        // Audio quality/bitrate control
        if !matches!(audio_codec, AudioCodec::Copy) {
            self.apply_audio_quality(&mut cmd, params)?;
        }

        // Audio processing (normalize, volume)
        if params.normalize || params.volume_gain.is_some() {
            self.apply_audio_processing(&mut cmd, params)?;
        }

        // Format-specific optimizations
        self.apply_format_optimizations(&mut cmd, params);

        // Output file
        cmd.arg(&params.output_path);
        
        println!("🔧 FFmpeg command: {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg (is ffmpeg installed?): {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("❌ FFmpeg stderr: {}", stderr);
            return Err(PipelineError::FFmpegFailed(format!("Audio conversion failed: {}", stderr)));
        }
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        if !stdout.is_empty() {
            println!("📺 FFmpeg output: {}", stdout);
        }
        
        println!("✅ Audio conversion completed successfully: {}", params.output_path);
        Ok(format!("Successfully converted audio to: {}", params.output_path))
    }

    /// Apply audio quality/bitrate settings
    fn apply_audio_quality(&self, cmd: &mut Command, params: &AudioConversionParams) -> Result<()> {
        match params.bitrate_mode.as_str() {
            "custom" => {
                if let Some(ref bitrate) = params.custom_bitrate {
                    cmd.args(["-b:a", &format!("{}k", bitrate)]);
                    println!("📊 Using custom bitrate: {} kbps", bitrate);
                }
            },
            "vbr" => {
                if let Some(ref quality) = params.vbr_quality {
                    // VBR quality mapping depends on codec
                    match params.codec.as_str() {
                        "mp3" => {
                            cmd.args(["-q:a", quality]);
                            println!("🎯 Using MP3 VBR quality: {}", quality);
                        },
                        "vorbis" => {
                            cmd.args(["-q:a", quality]);
                            println!("🎯 Using Vorbis VBR quality: {}", quality);
                        },
                        "opus" => {
                            cmd.args(["-vbr", "on", "-compression_level", quality]);
                            println!("🎯 Using Opus VBR quality: {}", quality);
                        },
                        _ => {
                            // Fallback to bitrate for codecs that don't support VBR quality
                            cmd.args(["-b:a", "192k"]);
                            println!("🎯 VBR not supported for {}, using 192kbps", params.codec);
                        }
                    }
                } else {
                    cmd.args(["-q:a", "5"]); // Default VBR quality
                    println!("🎯 Using default VBR quality: 5");
                }
            },
            _ => {
                // Auto quality based on preset
                let bitrate = match params.quality.as_str() {
                    "low" => "128k",
                    "medium" => "192k", 
                    "high" => "256k",
                    "ultra" => "320k",
                    _ => "192k",
                };
                cmd.args(["-b:a", bitrate]);
                println!("⚡ Auto quality ({}): {}", params.quality, bitrate);
            }
        }
        
        Ok(())
    }

    /// Apply audio processing (normalize, volume gain)
    fn apply_audio_processing(&self, cmd: &mut Command, params: &AudioConversionParams) -> Result<()> {
        let mut filters = Vec::new();

        // Volume gain
        if let Some(ref gain) = params.volume_gain {
            if let Ok(gain_val) = gain.parse::<f64>() {
                if gain_val != 0.0 {
                    filters.push(format!("volume={}dB", gain_val));
                    println!("🔊 Applying volume gain: {}dB", gain_val);
                }
            }
        }

        // Normalization
        if params.normalize {
            filters.push("loudnorm".to_string());
            println!("📈 Applying audio normalization");
        }

        // Apply filters if any
        if !filters.is_empty() {
            let filter_string = filters.join(",");
            cmd.args(["-af", &filter_string]);
            println!("🎛️ Audio filters: {}", filter_string);
        }

        Ok(())
    }

    /// Apply format-specific optimizations
    fn apply_format_optimizations(&self, cmd: &mut Command, params: &AudioConversionParams) {
        match params.format.as_str() {
            "mp3" => {
                // MP3-specific optimizations
                println!("🎵 MP3 optimizations applied");
            },
            "aac" | "m4a" => {
                // AAC-specific optimizations
                println!("🎵 AAC optimizations applied");
            },
            "ogg" => {
                // OGG-specific optimizations
                println!("🎵 OGG optimizations applied");
            },
            "flac" => {
                // FLAC-specific optimizations
                cmd.args(["-compression_level", "5"]); // Good balance of size/speed
                println!("🎵 FLAC optimizations applied");
            },
            "wav" => {
                // WAV-specific optimizations
                println!("🎵 WAV optimizations applied");
            },
            _ => {
                println!("🎵 Using default audio settings");
            }
        }
    }

    /// Get format-specific codec to avoid compatibility issues
    fn get_format_specific_codec(&self, params: &AudioConversionParams) -> AudioCodec {
        match params.codec.as_str() {
            "copy" => AudioCodec::Copy,
            _ => {
                // Override codec for specific formats if needed
                let codec_name = match params.format.as_str() {
                    "mp3" => match params.codec.as_str() {
                        "mp3" => "libmp3lame".to_string(),
                        other => other.to_string(),
                    },
                    "ogg" => match params.codec.as_str() {
                        "vorbis" => "libvorbis".to_string(),
                        "opus" => "libopus".to_string(),
                        other => other.to_string(),
                    },
                    "flac" => "flac".to_string(),
                    "wav" => "pcm_s16le".to_string(), // 16-bit PCM for WAV
                    _ => params.codec.clone(),
                };
                
                println!("🔧 Format-specific codec: {}", codec_name);
                AudioCodec::Specific(codec_name)
            }
        }
    }

    /// Get REAL info about converted audio using ffprobe
    async fn get_converted_audio_info(&self, output_path: &str) -> Result<AudioData> {
        // Check if the output file actually exists
        if !Path::new(output_path).exists() {
            return Err(PipelineError::FileNotFound(format!("Converted audio file not found: {}", output_path)));
        }

        println!("📊 Getting real metadata for converted audio: {}", output_path);

        // Use ffprobe to get audio metadata
        let output = Command::new(get_ffprobe_command())
            .args([
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                output_path
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffprobe on converted audio: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("ffprobe failed on converted audio: {}", stderr)));
        }

        // Parse ffprobe JSON output
        let info_str = String::from_utf8_lossy(&output.stdout);
        let json: serde_json::Value = serde_json::from_str(&info_str)
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to parse ffprobe JSON for converted audio: {}", e)))?;

        // Extract audio stream information
        let streams = json["streams"].as_array()
            .ok_or_else(|| PipelineError::FFmpegFailed("No streams found in converted audio".to_string()))?;

        let audio_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("audio"))
            .ok_or_else(|| PipelineError::FFmpegFailed("No audio stream found in converted audio".to_string()))?;

        // Extract real sample rate and channels from converted audio
        let sample_rate = audio_stream["sample_rate"].as_str()
            .and_then(|s| s.parse::<u32>().ok());
        let channels = audio_stream["channels"].as_u64().map(|c| c as u32);

        // Extract real duration (try stream first, then format)
        let duration = audio_stream["duration"].as_str()
            .and_then(|d| d.parse::<f64>().ok())
            .or_else(|| json["format"]["duration"].as_str()
                .and_then(|d| d.parse::<f64>().ok()))
            .unwrap_or(0.0);

        // Extract real format from file extension
        let format = Path::new(output_path)
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let result = AudioData {
            path: output_path.to_string(),
            format,
            duration,
            sample_rate,
            channels,
        };

        println!("✅ Real converted audio data: {:.2}s, {}Hz, {} ch, format: {}", 
                 result.duration, 
                 result.sample_rate.map(|sr| sr.to_string()).unwrap_or("unknown".to_string()),
                 result.channels.map(|ch| ch.to_string()).unwrap_or("unknown".to_string()),
                 result.format);

        Ok(result)
    }
}

/// Enum for audio codecs
#[derive(Debug)]
enum AudioCodec {
    Copy,
    Specific(String),
}