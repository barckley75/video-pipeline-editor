// src-tauri/src/types/mod.rs

//! # Types Module
//! 
//! Central module for all shared data structures and type definitions.
//! 
//! ## Submodules:
//! - `errors`: Error types and Result alias for the application
//! - `pipeline`: Pipeline graph structures (nodes, connections, results)
//! - `video`: Video-related data structures (VideoData, VideoMetadata)
//! - `audio`: Audio-related data structures (AudioData, AudioMetadata)
//! 
//! ## AppState:
//! Global application state managed by Tauri:
//! - `pipeline`: Mutex-wrapped optional pipeline data
//! - `ffmpeg_service`: Shared FFmpegService instance
//! 
//! ## Design Philosophy:
//! All types use Serde for JSON serialization/deserialization, enabling
//! seamless IPC communication between Rust backend and TypeScript frontend.

pub mod errors;
pub mod pipeline;
pub mod video;
pub mod audio;  // Add this line

pub use errors::*;
pub use pipeline::*;
pub use video::*;
pub use audio::*;  // Add this line

use tokio::sync::Mutex;
use crate::services::FFmpegService;

// Application state
pub struct AppState {
    pub pipeline: Mutex<Option<PipelineData>>,
    pub ffmpeg_service: FFmpegService,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            pipeline: Mutex::new(None),
            ffmpeg_service: FFmpegService::new(),
        }
    }
}