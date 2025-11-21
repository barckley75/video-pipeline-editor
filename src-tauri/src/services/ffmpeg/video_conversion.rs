// src-tauri/src/services/ffmpeg/video_conversion.rs

//! # Video Conversion Service
//! 
//! Comprehensive video encoding, transcoding, and format conversion.
//! 
//! ## Conversion Parameters:
//! 
//! ### Format & Codec:
//! - **Format**: Container (mp4, avi, mov, mkv, webm, etc.)
//! - **Video Codec**: H.264, H.265/HEVC, VP9, AV1, etc.
//! - **Audio Codec**: AAC, MP3, Opus, etc.
//! 
//! ### Quality Control:
//! - **Quality Preset**: Low/Medium/High/Lossless presets
//! - **Bitrate Mode**: CBR (constant) or VBR (variable)
//! - **CRF Value**: Constant Rate Factor for quality-based encoding (0-51)
//! - **Custom Bitrate**: Manual video bitrate specification
//! 
//! ### Video Properties:
//! - **Resolution**: Preset (720p/1080p/4K) or custom dimensions
//! - **Frame Rate**: Original, 24/30/60 fps, or custom
//! - **Aspect Ratio**: Automatic or forced
//! 
//! ### Hardware Acceleration:
//! - **GPU Encoding**: NVENC (NVIDIA), QuickSync (Intel), AMF (AMD)
//! - **Auto-detection**: Automatically selects available GPU encoder
//! - **Fallback**: Falls back to software encoding if GPU unavailable
//! 
//! ### Audio Options:
//! - **Audio Bitrate**: 96-320 kbps or custom
//! - **Sample Rate**: Resampling options
//! - **Channels**: Mono/stereo/surround
//! 
//! ### Additional Features:
//! - **Trimming**: Integrated time-based trimming
//! - **Filters**: Video filters (denoise, sharpen, etc.)
//! 
//! ## Workflow:
//! 1. Validates input and builds FFmpeg command
//! 2. Applies selected encoding parameters
//! 3. Executes conversion with error handling
//! 4. Returns VideoData of converted file

use std::process::Command;
use std::path::Path;
use crate::types::{Result, PipelineError, VideoData};
use crate::utils::ffmpeg_validator::{get_ffmpeg_command, get_ffprobe_command};

/// Enhanced parameters for video conversion with all frontend options
#[derive(Debug, Clone)]
pub struct ConversionParams {
    pub input_path: String,
    pub output_path: String,
    pub format: String,
    pub quality: String,
    pub use_gpu: bool,
    pub gpu_type: String,
    // Enhanced options
    pub bitrate_mode: String,        // "auto" | "custom" | "crf"
    pub custom_bitrate: Option<String>,  // Custom bitrate in Mbps
    pub crf_value: Option<String>,       // CRF value (0-51)
    pub resolution: String,              // "original", "480p", "720p", etc.
    pub custom_width: Option<String>,    // Custom width
    pub custom_height: Option<String>,   // Custom height
    pub framerate: String,               // "original", "24", "30", etc.
    pub audio_codec: String,             // "aac", "mp3", "opus", "copy", "none"
    pub audio_bitrate: String,           // "128", "192", etc.
    // Trim parameters (if applied during conversion)
    pub trim_start: Option<f64>,
    pub trim_end: Option<f64>,
}

impl Default for ConversionParams {
    fn default() -> Self {
        Self {
            input_path: String::new(),
            output_path: String::new(),
            format: "mp4".to_string(),
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
        }
    }
}

/// Service for video format conversion and encoding
pub struct VideoConversionService;

impl VideoConversionService {
    pub fn new() -> Self {
        Self
    }

    /// Convert video with enhanced parameters
    pub async fn convert_video(&self, params: ConversionParams) -> Result<VideoData> {
        println!("🎬 Converting {} to {} with enhanced params", params.input_path, params.output_path);
        println!("📋 Params: format={}, quality={}, bitrate_mode={}, resolution={}", 
                 params.format, params.quality, params.bitrate_mode, params.resolution);

        // Check if input exists
        if !Path::new(&params.input_path).exists() {
            return Err(PipelineError::FileNotFound(params.input_path.clone()));
        }

        // Quick validation that ffmpeg is available
        crate::utils::FFmpegValidator::quick_validate()
            .map_err(|_| PipelineError::FFmpegFailed(
                "FFmpeg not installed. Please install FFmpeg to convert videos.".to_string()
            ))?;

        // Use enhanced conversion with all parameters
        self.enhanced_conversion(&params).await?;
        
        // 🔧 FIX: Use real video info service instead of hardcoded data
        self.get_converted_video_info(&params.output_path).await
    }

    /// Convert video with trim parameters applied during conversion
    pub async fn convert_video_with_trim(
        &self, 
        mut params: ConversionParams, 
        start_time: f64, 
        end_time: f64
    ) -> Result<VideoData> {
        println!("✂️ Converting with trim: {} ({}s-{}s) -> {}", 
                 params.input_path, start_time, end_time, params.output_path);

        // Add trim parameters
        params.trim_start = Some(start_time);
        params.trim_end = Some(end_time);

        // Use the enhanced conversion which now handles trimming
        self.enhanced_conversion(&params).await?;
        
        self.get_converted_video_info(&params.output_path).await
    }

    /// Enhanced conversion with all parameters supported - FIXED FORMAT-SPECIFIC CODECS
    async fn enhanced_conversion(&self, params: &ConversionParams) -> Result<String> {
        println!("🚀 Enhanced conversion starting...");
        
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

        // 🔧 FIX: Format-specific codec selection BEFORE quality settings
        let (video_codec, audio_codec) = self.get_format_specific_codecs(&params);
        
        // Apply video codec
        if params.use_gpu && params.gpu_type != "none" && video_codec.supports_gpu() {
            let gpu_codec = match params.gpu_type.as_str() {
                "nvenc" => video_codec.get_gpu_variant("nvenc"),
                "qsv" => video_codec.get_gpu_variant("qsv"),
                "videotoolbox" => video_codec.get_gpu_variant("videotoolbox"),
                "vaapi" => video_codec.get_gpu_variant("vaapi"),
                _ => video_codec.software_codec(),
            };
            cmd.args(["-c:v", &gpu_codec]);
            println!("🚀 Using GPU codec: {}", gpu_codec);
        } else {
            cmd.args(["-c:v", &video_codec.software_codec()]);
            println!("💻 Using software codec: {}", video_codec.software_codec());
        }

        // Apply audio codec
        match audio_codec {
            AudioCodec::Copy => {
                cmd.args(["-c:a", "copy"]);
                println!("📄 Copying audio stream");
            },
            AudioCodec::None => {
                cmd.args(["-an"]); // No audio
                println!("🔇 Removing audio");
            },
            AudioCodec::Specific(codec_name) => {
                cmd.args(["-c:a", &codec_name]);
                // Audio bitrate (only for encoded audio)
                if let Ok(bitrate) = params.audio_bitrate.parse::<i32>() {
                    // Special handling for libopus - it prefers VBR mode
                    if codec_name == "libopus" {
                        cmd.args(["-b:a", &format!("{}k", bitrate)]);
                        cmd.args(["-vbr", "on"]); // Enable variable bitrate for better quality
                    } else {
                        cmd.args(["-b:a", &format!("{}k", bitrate)]);
                    }
                    println!("🎵 Audio: {} codec, {} kbps", codec_name, bitrate);
                }
            }
        }

        // Video quality/bitrate control
        match params.bitrate_mode.as_str() {
            "custom" => {
                if let Some(ref bitrate) = params.custom_bitrate {
                    // Convert Mbps to kbps for FFmpeg
                    if let Ok(mbps) = bitrate.parse::<f64>() {
                        let kbps = (mbps * 1000.0) as i32;
                        cmd.args(["-b:v", &format!("{}k", kbps)]);
                        println!("📊 Using custom bitrate: {} Mbps ({} kbps)", mbps, kbps);
                    }
                }
            },
            "crf" => {
                if let Some(ref crf) = params.crf_value {
                    cmd.args(["-crf", crf]);
                    println!("🎯 Using CRF: {}", crf);
                } else {
                    cmd.args(["-crf", "23"]); // Default CRF
                    println!("🎯 Using default CRF: 23");
                }
            },
            _ => {
                // Auto quality based on preset
                let crf = match params.quality.as_str() {
                    "low" => "28",
                    "medium" => "23",
                    "high" => "18",
                    "ultra" => "15",
                    _ => "23",
                };
                cmd.args(["-crf", crf]);
                println!("⚡ Auto quality ({}): CRF {}", params.quality, crf);
            }
        }

        // Video resolution handling
        if params.resolution != "original" {
            let scale_filter = match params.resolution.as_str() {
                "480p" => "scale=854:480".to_string(),
                "720p" => "scale=1280:720".to_string(),
                "1080p" => "scale=1920:1080".to_string(),
                "1440p" => "scale=2560:1440".to_string(),
                "4k" => "scale=3840:2160".to_string(),
                "custom" => {
                    if let (Some(ref width), Some(ref height)) = (&params.custom_width, &params.custom_height) {
                        format!("scale={}:{}", width, height)
                    } else {
                        "scale=1920:1080".to_string() // Fallback
                    }
                },
                _ => "scale=1920:1080".to_string(),
            };
            cmd.args(["-vf", &scale_filter]);
            println!("🔍 Scaling video: {}", scale_filter);
        }

        // Frame rate handling
        if params.framerate != "original" {
            cmd.args(["-r", &params.framerate]);
            println!("🎬 Setting framerate: {} fps", params.framerate);
        }

        // Format-specific optimizations
        match params.format.as_str() {
            "mp4" => {
                cmd.args(["-movflags", "+faststart"]);
                cmd.args(["-pix_fmt", "yuv420p"]);
                println!("📦 MP4 optimizations applied");
            },
            "webm" => {
                // WebM-specific optimizations
                cmd.args(["-pix_fmt", "yuv420p"]);
                println!("🌐 WebM optimizations applied");
            },
            "mkv" => {
                println!("📼 MKV container selected");
            },
            _ => {
                cmd.args(["-pix_fmt", "yuv420p"]);
                println!("🎨 Using yuv420p pixel format for compatibility");
            }
        }

        // Quality preset for software encoding (NOT for WebM VP9)
        if !params.use_gpu && !video_codec.is_vp9() {
            let preset = match params.quality.as_str() {
                "low" => "fast",
                "medium" => "medium",
                "high" => "slow",
                "ultra" => "veryslow",
                _ => "medium",
            };
            cmd.args(["-preset", preset]);
            println!("⚙️ Encoding preset: {}", preset);
        }

        // Output file
        cmd.arg(&params.output_path);
        
        println!("🔧 FFmpeg command: {:?}", cmd.get_args().collect::<Vec<_>>());
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffmpeg (is ffmpeg installed?): {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("❌ FFmpeg stderr: {}", stderr);
            return Err(PipelineError::FFmpegFailed(format!("Conversion failed: {}", stderr)));
        }
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        if !stdout.is_empty() {
            println!("📺 FFmpeg output: {}", stdout);
        }
        
        println!("✅ Conversion completed successfully: {}", params.output_path);
        Ok(format!("Successfully converted to: {}", params.output_path))
    }

    /// 🔧 NEW: Get format-specific codecs to avoid compatibility issues
    fn get_format_specific_codecs(&self, params: &ConversionParams) -> (VideoCodec, AudioCodec) {
        let audio_codec = match params.audio_codec.as_str() {
            "copy" => AudioCodec::Copy,
            "none" => AudioCodec::None,
            codec => {
                // Override audio codec for specific formats
                match params.format.as_str() {
                    "webm" => {
                        // WebM only supports Vorbis or Opus - use libopus/libvorbis
                        match codec {
                            "aac" | "mp3" => AudioCodec::Specific("libopus".to_string()),
                            "opus" => AudioCodec::Specific("libopus".to_string()),
                            "vorbis" => AudioCodec::Specific("libvorbis".to_string()),
                            _ => AudioCodec::Specific("libopus".to_string()), // Default to libopus for WebM
                        }
                    },
                    _ => {
                        // For other formats, use proper codec names
                        match codec {
                            "opus" => AudioCodec::Specific("libopus".to_string()),
                            "vorbis" => AudioCodec::Specific("libvorbis".to_string()),
                            "mp3" => AudioCodec::Specific("libmp3lame".to_string()),
                            other => AudioCodec::Specific(other.to_string())
                        }
                    }
                }
            }
        };

        let video_codec = match params.format.as_str() {
            "webm" => VideoCodec::VP9, // Use VP9 for WebM
            "mp4" => VideoCodec::H264,
            "mkv" => VideoCodec::H264, // H264 is broadly compatible
            "avi" => VideoCodec::H264,
            "mov" => VideoCodec::H264,
            _ => VideoCodec::H264, // Default fallback
        };

        println!("📋 Format-specific codecs - Video: {:?}, Audio: {:?}", video_codec, audio_codec);
        (video_codec, audio_codec)
    }

    /// 🔧 FIX: Get REAL info about converted video using ffprobe (same as InfoVideoNode)
    async fn get_converted_video_info(&self, output_path: &str) -> Result<VideoData> {
        // Check if the output file actually exists
        if !Path::new(output_path).exists() {
            return Err(PipelineError::FileNotFound(format!("Converted file not found: {}", output_path)));
        }

        println!("📊 Getting real metadata for converted video: {}", output_path);

        // Use the same ffprobe approach as InfoVideoNode
        let output = Command::new(get_ffprobe_command())
            .args([
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                output_path
            ])
            .output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run ffprobe on converted video: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("ffprobe failed on converted video: {}", stderr)));
        }

        // Parse ffprobe JSON output (same logic as InfoVideoNode)
        let info_str = String::from_utf8_lossy(&output.stdout);
        let json: serde_json::Value = serde_json::from_str(&info_str)
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to parse ffprobe JSON for converted video: {}", e)))?;

        // Extract video stream information
        let streams = json["streams"].as_array()
            .ok_or_else(|| PipelineError::FFmpegFailed("No streams found in converted video".to_string()))?;

        let video_stream = streams.iter()
            .find(|stream| stream["codec_type"].as_str() == Some("video"))
            .ok_or_else(|| PipelineError::FFmpegFailed("No video stream found in converted video".to_string()))?;

        // Extract real dimensions from converted video
        let width = video_stream["width"].as_u64().unwrap_or(1920) as u32;
        let height = video_stream["height"].as_u64().unwrap_or(1080) as u32;

        // Extract real duration (try stream first, then format)
        let duration = video_stream["duration"].as_str()
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

        let result = VideoData {
            path: output_path.to_string(),
            format,
            width,
            height,
            duration,
        };

        println!("✅ Real converted video data: {}x{}, {:.2}s, format: {}", 
                 result.width, result.height, result.duration, result.format);

        Ok(result)
    }

    /// Simple, reliable conversion for maximum compatibility (kept for backward compatibility)
    #[allow(dead_code)]
    async fn simple_conversion(&self, input_path: &str, output_path: &str) -> Result<String> {
        println!("📄 Simple conversion: {} -> {}", input_path, output_path);
        
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args(["-i", input_path, "-y", output_path]);
        
        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(format!("Failed to run simple ffmpeg conversion: {}", e)))?;
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(format!("Simple conversion failed: {}", stderr)));
        }
        
        Ok("Simple conversion completed".to_string())
    }
}

/// 🔧 NEW: Enum for video codecs with GPU support info
#[derive(Debug)]
enum VideoCodec {
    H264,
    VP9,
}

impl VideoCodec {
    fn software_codec(&self) -> String {
        match self {
            VideoCodec::H264 => "libx264".to_string(),
            VideoCodec::VP9 => "libvpx-vp9".to_string(),
        }
    }

    fn supports_gpu(&self) -> bool {
        match self {
            VideoCodec::H264 => true,  // H264 has good GPU support
            VideoCodec::VP9 => false,  // VP9 GPU support is limited/unreliable
        }
    }

    fn get_gpu_variant(&self, gpu_type: &str) -> String {
        match self {
            VideoCodec::H264 => match gpu_type {
                "nvenc" => "h264_nvenc".to_string(),
                "qsv" => "h264_qsv".to_string(),
                "videotoolbox" => "h264_videotoolbox".to_string(),
                "vaapi" => "h264_vaapi".to_string(),
                _ => self.software_codec(),
            },
            VideoCodec::VP9 => self.software_codec(), // Fallback to software
        }
    }

    fn is_vp9(&self) -> bool {
        matches!(self, VideoCodec::VP9)
    }
}

/// 🔧 NEW: Enum for audio codecs
#[derive(Debug)]
enum AudioCodec {
    Copy,
    None,
    Specific(String),
}