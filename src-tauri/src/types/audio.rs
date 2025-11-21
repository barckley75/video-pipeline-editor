// src-tauri/src/types/audio.rs

//! # Audio Data Structures
//! 
//! Defines data structures for audio files and metadata.
//! 
//! ## AudioData:
//! Lightweight structure for passing audio information between nodes.
//! 
//! ### Fields:
//! - `path`: Full file system path to audio file
//! - `format`: Audio format (mp3, flac, wav, aac, ogg, etc.)
//! - `duration`: Total duration in seconds
//! 
//! ### Use Cases:
//! - Node-to-node data passing in pipelines
//! - Quick audio file identification
//! - Audio input node outputs
//! 
//! ## AudioMetadata:
//! Comprehensive metadata extracted from audio files via FFprobe.
//! 
//! ### Fields:
//! 
//! #### File Properties:
//! - `path`: Full file path
//! - `format`: Container/codec format
//! - `duration`: Total duration in seconds
//! - `size`: File size in bytes
//! - `bit_rate`: Overall bitrate in kbps
//! 
//! #### Audio Stream:
//! - `codec`: Audio codec name (aac, mp3, flac, opus, pcm, etc.)
//! - `sample_rate`: Sampling frequency in Hz (44100, 48000, 96000, etc.)
//! - `channels`: Number of audio channels (1=mono, 2=stereo, 6=5.1, etc.)
//! - `channel_layout`: Descriptive channel configuration (stereo, mono, 5.1, 7.1, etc.)
//! - `bit_depth`: Bits per sample (16, 24, 32) - for PCM formats
//! - `audio_bitrate`: Audio-specific bitrate in kbps
//! 
//! #### Quality Indicators:
//! - `is_lossless`: Boolean indicating if codec is lossless (FLAC, WAV, ALAC)
//! - `compression_ratio`: Approximate ratio if lossy
//! 
//! ## SpectrumData:
//! Audio frequency spectrum analysis data for visualization.
//! 
//! ### Fields:
//! - `timestamp`: Time position in video/audio (seconds)
//! - `frequencies`: Array of frequency bin values (Hz)
//! - `magnitudes`: Array of magnitude values for each frequency (dB)
//! - `sample_rate`: Audio sample rate used for analysis
//! - `fft_size`: FFT window size (1024, 2048, 4096, 8192)
//! 
//! ### Use Cases:
//! - Real-time spectrum visualization during playback
//! - Audio frequency analysis for mixing/mastering
//! - Identifying audio issues (clipping, noise, etc.)
//! 
//! ## Serialization:
//! All structures derive Serialize/Deserialize for JSON communication
//! between Rust backend and TypeScript frontend.

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Extended audio metadata for info display - matches InfoAudioNode.tsx interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub path: String,
    pub format: String,
    pub duration: f64,
    #[serde(rename = "sampleRate")]
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub bitrate: Option<u32>,
    pub codec: Option<String>,
    pub size: Option<u64>,
    
    // Extended audio metadata fields
    #[serde(rename = "bitsPerSample")]
    pub bits_per_sample: Option<u32>,
    #[serde(rename = "channelLayout")]
    pub channel_layout: Option<String>,
    pub encoder: Option<String>,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub year: Option<String>,
    pub genre: Option<String>,
    #[serde(rename = "totalSamples")]
    pub total_samples: Option<u64>,
    #[serde(rename = "peakLevel")]
    pub peak_level: Option<f64>,
    #[serde(rename = "rmsLevel")]
    pub rms_level: Option<f64>,
    #[serde(rename = "dynamicRange")]
    pub dynamic_range: Option<f64>,
    #[serde(rename = "lufsIntegrated")]
    pub lufs_integrated: Option<f64>,
    #[serde(rename = "lufsRange")]
    pub lufs_range: Option<f64>,
    #[serde(rename = "truePeak")]
    pub true_peak: Option<f64>,
    #[serde(rename = "hasMetadata")]
    pub has_metadata: Option<bool>,
    pub metadata: Option<serde_json::Map<String, Value>>,
    pub streams: Option<Vec<Value>>,
}

/// Basic audio data structure (simpler version)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioData {
    pub path: String,
    pub format: String,
    pub duration: f64,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
}

impl AudioMetadata {
    /// Calculate a quality score based on various audio parameters
    pub fn calculate_quality_score(&self) -> f64 {
        let mut score: f64 = 0.0;
        
        // Sample rate score (0-30)
        if let Some(sample_rate) = self.sample_rate {
            score += match sample_rate {
                192000.. => 30.0, // Ultra high
                96000..=191999 => 28.0, // Very high
                48000..=95999 => 25.0, // High
                44100..=47999 => 20.0, // Standard
                _ => 10.0, // Lower
            };
        }
        
        // Bitrate score (0-25)
        if let Some(bitrate) = self.bitrate {
            let kbps = bitrate as f64 / 1000.0;
            score += match kbps as u32 {
                1000.. => 25.0, // Lossless/very high
                320..=999 => 22.0, // High
                256..=319 => 18.0, // Good
                128..=255 => 15.0, // Standard
                _ => 8.0, // Low
            };
        }
        
        // Codec score (0-25)
        if let Some(ref codec) = self.codec {
            let codec_lower = codec.to_lowercase();
            score += if codec_lower.contains("flac") || codec_lower.contains("pcm") {
                25.0 // Lossless
            } else if codec_lower.contains("aac") || codec_lower.contains("opus") {
                20.0 // Modern
            } else if codec_lower.contains("mp3") {
                15.0 // Standard
            } else {
                10.0 // Other
            };
        }
        
        // Channel configuration score (0-20)
        if let Some(channels) = self.channels {
            score += match channels {
                6.. => 20.0, // Surround
                2 => 18.0, // Stereo
                1 => 12.0, // Mono
                _ => 5.0,
            };
        }
        
        score.min(100.0)
    }
}