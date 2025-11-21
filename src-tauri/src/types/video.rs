// src-tauri/src/types/video.rs

//! # Video Data Structures
//! 
//! Defines data structures for video files and metadata.
//! 
//! ## VideoData:
//! Lightweight structure for passing video information between nodes.
//! 
//! ### Fields:
//! - `path`: Full file system path to video
//! - `format`: Container format (mp4, mkv, avi, etc.)
//! - `width`: Video width in pixels
//! - `height`: Video height in pixels
//! - `duration`: Total duration in seconds
//! 
//! ### Use Cases:
//! - Node-to-node data passing in pipelines
//! - Quick video identification
//! - Basic display information
//! 
//! ## VideoMetadata:
//! Comprehensive metadata extracted from video files.
//! 
//! ### Fields:
//! 
//! #### File Properties:
//! - `path`: Full file path
//! - `format`: Container format
//! - `duration`: Duration in seconds
//! - `size`: File size in bytes
//! - `bit_rate`: Overall bitrate in kbps
//! 
//! #### Video Stream:
//! - `video_codec`: Video codec name (h264, hevc, vp9, etc.)
//! - `width`: Frame width in pixels
//! - `height`: Frame height in pixels
//! - `frame_rate`: Frames per second (fps)
//! - `video_bitrate`: Video stream bitrate in kbps
//! - `pixel_format`: Pixel format (yuv420p, yuv444p, rgb24, etc.)
//! - `color_space`: Color space (bt709, bt2020, etc.)
//! - `color_range`: TV/PC range
//! 
//! #### Audio Stream:
//! - `audio_codec`: Audio codec name (aac, mp3, opus, etc.)
//! - `sample_rate`: Audio sample rate in Hz
//! - `channels`: Number of audio channels
//! - `audio_bitrate`: Audio stream bitrate in kbps
//! - `channel_layout`: Channel configuration (stereo, 5.1, etc.)
//! 
//! #### Additional Info:
//! - `has_video`: Boolean indicating video stream presence
//! - `has_audio`: Boolean indicating audio stream presence
//! - `thumbnail_path`: Optional path to generated thumbnail
//! 
//! ## VmafScore:
//! VMAF quality analysis results.
//! 
//! ### Fields:
//! - `score`: Overall VMAF score (0-100)
//! - `reference_path`: Path to reference (original) video
//! - `distorted_path`: Path to distorted (processed) video
//! - `psnr`: Optional Peak Signal-to-Noise Ratio
//! - `ssim`: Optional Structural Similarity Index
//! - `ms_ssim`: Optional Multi-Scale SSIM
//! 
//! ### Interpretation:
//! - 95-100: Excellent, transparent quality
//! - 80-95: Good quality
//! - 60-80: Acceptable quality
//! - 0-60: Poor quality
//! 
//! ## Serialization:
//! All structures are JSON-serializable for frontend communication.

use serde::{Deserialize, Serialize};
use serde_json::Value;

// Video data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoData {
    pub path: String,
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub duration: f64,
}

// Extended video metadata for info display - NOW WITH ALL FIELDS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub path: String,
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub duration: f64,
    pub bitrate: Option<u32>,
    pub fps: Option<f32>,
    pub codec: Option<String>,
    pub size: Option<u64>,
    #[serde(rename = "audioCodec")]
    pub audio_codec: Option<String>,
    #[serde(rename = "audioSampleRate")]
    pub audio_sample_rate: Option<u32>,
    #[serde(rename = "audioChannels")]
    pub audio_channels: Option<u32>,
    // Extended metadata fields that were missing
    pub profile: Option<String>,
    pub level: Option<String>,
    #[serde(rename = "pixelFormat")]
    pub pixel_format: Option<String>,
    #[serde(rename = "colorSpace")]
    pub color_space: Option<String>,
    #[serde(rename = "transferCharacteristics")]
    pub transfer_characteristics: Option<String>,
    #[serde(rename = "colorPrimaries")]
    pub color_primaries: Option<String>,
    #[serde(rename = "chromaLocation")]
    pub chroma_location: Option<String>,
    #[serde(rename = "aspectRatio")]
    pub aspect_ratio: Option<String>,
    #[serde(rename = "startTime")]
    pub start_time: Option<f64>,
    #[serde(rename = "totalFrames")]
    pub total_frames: Option<u32>,
    #[serde(rename = "keyframeInterval")]
    pub keyframe_interval: Option<u32>,
    #[serde(rename = "bFrames")]
    pub b_frames: Option<u32>,
    #[serde(rename = "hasSubtitles")]
    pub has_subtitles: Option<bool>,
    pub metadata: Option<serde_json::Map<String, Value>>,
    pub streams: Option<Vec<Value>>,
}

// VMAF Score structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VmafScore {
    pub mean: f64,
    pub min: f64,
    pub max: f64,
    pub harmonic_mean: f64,
    pub frame_count: u32,
    pub model: String,
    pub reference_path: String,
    pub distorted_path: String,
}

// VMAF Report structure for parsing JSON output
#[derive(Debug, Deserialize)]
pub struct VmafReport {
    pub pooled_metrics: PooledMetrics,
    pub frames: Vec<Frame>,
}

#[derive(Debug, Deserialize)]
pub struct PooledMetrics {
    pub vmaf: VmafMetrics,
}

#[derive(Debug, Deserialize)]
pub struct VmafMetrics {
    pub mean: f64,
    pub min: f64,
    pub max: f64,
    pub harmonic_mean: f64,
}

#[derive(Debug, Deserialize)]
pub struct Frame {
    #[serde(rename = "frameNum")]
    pub frame_num: u32,
    pub metrics: FrameMetrics,
}

#[derive(Debug, Deserialize)]
pub struct FrameMetrics {
    pub vmaf: f64,
}