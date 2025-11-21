// src-tauri/src/commands/mod.rs

//! # Command Handlers Module
//! 
//! Exports all Tauri command handlers for frontend IPC communication.
//! 
//! ## Submodules:
//! - `metadata`: Video/audio metadata extraction and playability checks
//! - `pipeline`: Pipeline execution and node-based processing
//! - `spectrum`: Real-time audio spectrum analysis commands
//! - `system`: System utilities, file operations, FFmpeg validation
//! - `vmaf`: Video quality metric analysis (VMAF scoring)
//! 
//! These commands serve as the API layer between the Tauri frontend and Rust backend.

pub mod metadata;
pub mod pipeline;
pub mod system;
pub mod vmaf;
pub mod spectrum;