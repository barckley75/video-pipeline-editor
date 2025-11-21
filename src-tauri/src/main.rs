// src-tauri/src/main.rs

//! # Application Entry Point
//! 
//! Main entry point for the Tauri-based video pipeline editor application.
//! 
//! ## Responsibilities:
//! - Initializes the Tauri application with required plugins (dialog, opener)
//! - Sets up application state management (AppState with FFmpeg service)
//! - Registers all command handlers for IPC communication between frontend and backend
//! 
//! ## Command Categories:
//! - **Pipeline**: Executes node-based video processing pipelines
//! - **Metadata**: Retrieves video/audio file information and playability checks
//! - **System**: File operations, format listing, FFmpeg validation
//! - **VMAF**: Video quality analysis calculations
//! - **Spectrum**: Real-time audio spectrum analysis
//! 
//! ## Architecture:
//! Uses Tauri's IPC system to expose Rust functions to the frontend via the `invoke_handler`.
//! All business logic is delegated to the commands module, keeping this file focused on app initialization.

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use video_pipeline_editor::{
    commands::{metadata, pipeline, system, vmaf, spectrum},
    types::AppState,
};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            pipeline::execute_pipeline,
            metadata::get_video_metadata,
            metadata::get_audio_metadata,
            metadata::check_video_playable,
            metadata::check_audio_playable,
            system::list_video_formats,
            system::open_output_folder,
            system::open_specific_folder,
            system::convert_video_simple,
            system::convert_audio_simple,
            system::check_ffmpeg_installation,
            system::validate_ffmpeg_quick,
            system::get_ffmpeg_version,
            system::run_diagnostics,
            system::get_ffmpeg_config,
            system::set_ffmpeg_path,
            system::set_ffprobe_path,
            system::validate_ffmpeg_path,
            system::validate_ffprobe_path,
            system::auto_detect_ffmpeg,
            system::clear_ffmpeg_config,
            vmaf::calculate_vmaf_score,
            vmaf::check_vmaf_support,
            vmaf::quick_vmaf_check,
            spectrum::start_spectrum_analysis,
            spectrum::stop_spectrum_analysis,
            spectrum::get_spectrum_analysis_status,
            spectrum::analyze_audio_frame,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}