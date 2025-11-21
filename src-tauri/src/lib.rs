// src-tauri/src/lib.rs

//! # Video Pipeline Editor Library
//! 
//! Core library for the video pipeline processing application.
//! 
//! ## Module Structure:
//! - `commands`: Frontend-facing command handlers (Tauri IPC endpoints)
//! - `services`: Business logic for video/audio processing and pipeline execution
//! - `types`: Shared data structures, error types, and type definitions
//! - `utils`: Helper utilities for file handling, path management, and validation
//! 
//! ## Architecture Overview:
//! This library implements a node-based video processing pipeline where:
//! 1. Users create graphs of processing nodes (input, trim, convert, etc.)
//! 2. The pipeline executor processes nodes in dependency order
//! 3. FFmpeg operations are abstracted through service interfaces
//! 4. Results flow between nodes through connections
//! 
//! ## Key Features:
//! - Asynchronous video/audio processing with FFmpeg
//! - Dependency-based execution ordering
//! - VMAF quality analysis support
//! - Real-time audio spectrum visualization
//! - Cross-platform file handling

pub mod commands;
pub mod services;
pub mod types;
pub mod utils;