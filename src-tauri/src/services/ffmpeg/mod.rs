// src-tauri/src/services/ffmpeg/mod.rs

//! # FFmpeg Services Module
//! 
//! Central orchestrator for all FFmpeg operations, delegating to specialized services.
//! 
//! ## Sub-Services:
//! - `video_info`: Video metadata extraction and validation
//! - `audio_info`: Audio metadata extraction and validation
//! - `video_conversion`: Video format conversion and encoding
//! - `audio_conversion`: Audio format conversion and encoding
//! - `frame_extraction`: Extract frames from videos as image sequences
//! - `vmaf_analysis`: VMAF quality scoring between videos
//! - `video_trimming`: Time-based video trimming
//! - `audio_spectrum`: Real-time spectrum analysis
//! 
//! ## FFmpegService:
//! The main service struct that holds instances of all sub-services and
//! provides unified API access. All sub-services are instantiated in `new()`.
//! 
//! ## Design Pattern:
//! Facade pattern - simplifies complex FFmpeg subsystem into a single interface.

mod video_info;
mod audio_info;
mod video_conversion;
pub mod audio_conversion;
mod frame_extraction;
mod vmaf_analysis;
mod video_trimming;
mod audio_spectrum;

pub use video_info::*;
pub use audio_info::*;
pub use video_conversion::*;
pub use audio_conversion::*;
pub use frame_extraction::*;
pub use vmaf_analysis::*;
pub use video_trimming::*;
pub use audio_spectrum::*;

use crate::types::{Result, VideoData, VideoMetadata, AudioData, AudioMetadata, VmafScore};

/// Main FFmpeg service that orchestrates all video and audio operations
pub struct FFmpegService {
    video_info: VideoInfoService,
    audio_info: AudioInfoService,
    conversion: VideoConversionService,
    frame_extraction: FrameExtractionService,
    vmaf_analysis: VmafAnalysisService,
    trimming: VideoTrimmingService,
    spectrum_service: AudioSpectrumService,
}

impl FFmpegService {
    pub fn new() -> Self {
        Self {
            video_info: VideoInfoService::new(),
            audio_info: AudioInfoService::new(),
            conversion: VideoConversionService::new(),
            frame_extraction: FrameExtractionService::new(),
            vmaf_analysis: VmafAnalysisService::new(),
            trimming: VideoTrimmingService::new(),
            spectrum_service: AudioSpectrumService::new(),
        }
    }

    // === VIDEO INFO OPERATIONS ===
    pub async fn get_video_info(&self, path: &str) -> Result<VideoData> {
        self.video_info.get_video_info(path).await
    }

    pub async fn get_video_metadata(&self, file_path: &str) -> Result<VideoMetadata> {
        self.video_info.get_video_metadata(file_path).await
    }

    pub async fn check_video_playable(&self, file_path: &str) -> Result<bool> {
        self.video_info.check_video_playable(file_path).await
    }

    // === AUDIO INFO OPERATIONS ===
    pub async fn get_audio_metadata(&self, file_path: &str) -> Result<AudioMetadata> {
        self.audio_info.get_audio_metadata(file_path).await
    }

    pub async fn check_audio_playable(&self, file_path: &str) -> Result<bool> {
        self.audio_info.check_audio_playable(file_path).await
    }

    pub async fn get_basic_audio_info(&self, file_path: &str) -> Result<(f64, String)> {
        self.audio_info.get_basic_audio_info(file_path).await
    }

    // === VIDEO CONVERSION ===
    pub async fn convert_video(&self, params: ConversionParams) -> Result<VideoData> {
        self.conversion.convert_video(params).await
    }

    /// Convert audio with enhanced parameters
    pub async fn convert_audio(&self, params: AudioConversionParams) -> Result<AudioData> {
        let audio_converter = AudioConversionService::new();
        audio_converter.convert_audio(params).await
    }


    /// Convert video with trim parameters
    pub async fn convert_video_with_trim(
        &self, 
        params: ConversionParams, 
        start_time: f64, 
        end_time: f64
    ) -> Result<VideoData> {
        self.conversion.convert_video_with_trim(params, start_time, end_time).await
    }

    /// Convert audio with trim parameters applied during conversion
    pub async fn convert_audio_with_trim(
        &self, 
        params: AudioConversionParams, 
        start_time: f64, 
        end_time: f64
    ) -> Result<AudioData> {
        let audio_converter = AudioConversionService::new();
        audio_converter.convert_audio_with_trim(params, start_time, end_time).await
    }

    // === FRAME EXTRACTION ===
    pub async fn extract_frames(&self, params: FrameExtractionParams) -> Result<String> {
        self.frame_extraction.extract_frames(params).await
    }

    /// Extract frames with trim parameters
    pub async fn extract_frames_with_trim(
        &self,
        params: FrameExtractionParams,
        start_time: f64,
        end_time: f64
    ) -> Result<String> {
        self.frame_extraction.extract_frames_with_trim(params, start_time, end_time).await
    }

    // === VMAF ANALYSIS ===
    pub async fn calculate_vmaf(
        &self, 
        reference_path: &str, 
        distorted_path: &str,
        model: Option<&str>
    ) -> Result<VmafScore> {
        self.vmaf_analysis.calculate_vmaf(reference_path, distorted_path, model).await
    }

    pub async fn quick_vmaf(&self, reference_path: &str, distorted_path: &str) -> Result<f64> {
        self.vmaf_analysis.quick_vmaf(reference_path, distorted_path).await
    }

    pub async fn batch_vmaf(&self, reference_path: &str, test_files: Vec<&str>) -> Result<Vec<VmafScore>> {
        self.vmaf_analysis.batch_vmaf(reference_path, test_files).await
    }

    pub async fn check_vmaf_support(&self) -> bool {
        self.vmaf_analysis.check_vmaf_support().await
    }

    // === VIDEO TRIMMING ===
    pub async fn trim_video(&self, params: VideoTrimmingParams) -> Result<VideoData> {
        self.trimming.trim_video(params).await
    }

    // === AUDIO SPECTRUM ANALYSIS ===
    pub async fn start_spectrum_analysis(
        &self,
        app_handle: tauri::AppHandle,
        video_path: String,
        config: AudioSpectrumConfig,
    ) -> Result<()> {
        self.spectrum_service.start_spectrum_analysis(app_handle, video_path, config).await
    }

    pub async fn stop_spectrum_analysis(&self) -> Result<()> {
        self.spectrum_service.stop_spectrum_analysis().await
    }

    pub fn is_spectrum_analyzing(&self) -> bool {
        self.spectrum_service.is_analyzing()
    }

    pub async fn analyze_audio_frame(
        &self,
        video_path: &str,
        config: &AudioSpectrumConfig,
        timestamp: f64,
    ) -> Result<SpectrumData> {
        self.spectrum_service.analyze_audio_frame(video_path, config, timestamp).await
    }
}