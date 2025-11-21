// src-tauri/src/services/mod.rs

//! # Services Module
//! 
//! Contains business logic services for video/audio processing and pipeline execution.
//! 
//! ## Submodules:
//! - `ffmpeg`: FFmpeg wrapper services for all media operations
//! - `pipeline_executor`: Node-based pipeline processing engine
//! - `trim_service`: Video trimming operations
//! - `trim_audio_service`: Audio trimming operations
//! 
//! ## Architecture:
//! Services encapsulate complex operations and FFmpeg interactions,
//! providing clean APIs for command handlers. Each service is stateless
//! and can be instantiated as needed.

pub mod ffmpeg;
pub mod pipeline_executor;
pub mod trim_service;
pub mod trim_audio_service;

pub use ffmpeg::*;
pub use pipeline_executor::PipelineExecutor;
pub use trim_service::*;