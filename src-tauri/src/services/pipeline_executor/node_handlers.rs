// src-tauri/src/services/pipeline_executor/node_handlers.rs

//! # Node Handlers
//! 
//! Implements processing logic for each pipeline node type.
//! 
//! ## Node Types & Handlers:
//! 
//! ### Input Nodes:
//! - `inputVideo`: Loads video file and extracts metadata
//! - `inputAudio`: Loads audio file and extracts metadata
//! 
//! ### Processing Nodes:
//! - `trimVideo`: Trims video to specified time range
//! - `trimAudio`: Trims audio to specified time range
//! - `convertVideo`: Converts video format/codec with quality settings
//! - `convertAudio`: Converts audio format/codec with quality settings
//! 
//! ### Extraction Nodes:
//! - `sequenceExtract`: Extracts frames as image sequence
//! 
//! ### Display Nodes:
//! - `viewVideo`: Validates video for display (pass-through)
//! - `gridView`: Prepares grid of video thumbnails (pass-through)
//! - `infoVideo`: Displays video metadata (pass-through)
//! 
//! ### Analysis Nodes:
//! - `spectrumAnalyzer`: Audio spectrum analysis (pass-through)
//! - `vmafAnalysis`: Handled separately by VmafProcessor
//! 
//! ## Processing Pattern:
//! 1. Extract node configuration data using NodeDataExtractor
//! 2. Find connected input nodes using ConnectionHelper
//! 3. Retrieve input data from ExecutionContext
//! 4. Validate parameters using NodeValidator
//! 5. Execute FFmpeg operation via appropriate service
//! 6. Return VideoData output (or None for display-only nodes)
//! 
//! ## Special Features:
//! - **Trim Integration**: Downstream nodes respect upstream trim data
//! - **Auto-paths**: Generates output paths when not specified
//! - **Connection Validation**: Ensures required inputs are connected
//! - **Error Propagation**: Detailed error messages for debugging

use crate::services::{FFmpegService, TrimService, ConversionParams, FrameExtractionParams, TrimParams};
use crate::services::trim_audio_service::{TrimAudioService, TrimAudioParams};

use crate::types::{PipelineError, Result, VideoData, NodeData, ConnectionData};
use super::execution_context::ExecutionContext;
use super::node_helpers::{NodeDataExtractor, ConnectionHelper, NodeValidator};
use std::path::Path;

pub struct NodeHandlers<'a> {
    ffmpeg: &'a FFmpegService,
    trim_service: &'a TrimService,
}

impl<'a> NodeHandlers<'a> {
    pub fn new(ffmpeg: &'a FFmpegService, trim_service: &'a TrimService) -> Self {
        Self {
            ffmpeg,
            trim_service,
        }
    }

    pub async fn process(
        &self,
        node: &NodeData,
        context: &mut ExecutionContext,  // Made mutable for trim data
        connections: &[ConnectionData],
    ) -> Result<Option<VideoData>> {
        match node.node_type.as_str() {
            "inputVideo" => self.handle_input_video(node).await,
            "inputAudio" => self.handle_input_audio(node).await,
            "viewVideo" => self.handle_view_video(node, context, connections).await,
            "trimVideo" => self.handle_trim_video(node, context, connections).await,
            "trimAudio" => self.handle_trim_audio(node, context, connections).await,
            "convertVideo" => self.handle_convert_video(node, context, connections).await,
            "convertAudio" => self.handle_convert_audio(node, context, connections).await,
            "sequenceExtract" => {
                self.handle_sequence_extract(node, context, connections).await?;
                Ok(None)
            },
            "infoVideo" => self.handle_info_video(node, context, connections).await,
            "gridView" => self.handle_grid_view(node, context, connections).await,
            "spectrumAnalyzer" => self.handle_spectrum_analyzer(node, context, connections).await,
            _ => Err(PipelineError::InvalidNodeConfig(format!("Unknown node type: {}", node.node_type)))
        }
    }

    async fn handle_input_video(&self, node: &NodeData) -> Result<Option<VideoData>> {
        let file_path = NodeDataExtractor::extract_string(&node.data, "filePath")
            .map_err(|_| PipelineError::InvalidNodeConfig("Input node needs a file selected".to_string()))?;
        NodeValidator::validate_file_exists(&file_path)?;
        Ok(Some(self.ffmpeg.get_video_info(&file_path).await?))
    }

    async fn handle_input_audio(&self, node: &NodeData) -> Result<Option<VideoData>> {
        let file_path = NodeDataExtractor::extract_string(&node.data, "filePath")
            .map_err(|_| PipelineError::InvalidNodeConfig("Input audio node needs a file selected".to_string()))?;
        NodeValidator::validate_file_exists(&file_path)?;
        
        // For now, we can reuse the existing audio info method
        // Later you might want to create a specific handle_input_audio method
        let (duration, format) = self.ffmpeg.get_basic_audio_info(&file_path).await?;
        
        // Convert to VideoData for compatibility (we might want to create AudioData later)
        Ok(Some(VideoData {
            path: file_path,
            format,
            width: 0,  // Not applicable for audio
            height: 0, // Not applicable for audio
            duration,
        }))
    }

    async fn handle_trim_video(&self, node: &NodeData, context: &mut ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_video = ConnectionHelper::get_input_video(&node.id, context, connections, "video-input")?;
        
        let start_time = NodeDataExtractor::extract_f64_or_default(&node.data, "startTime", 0.0);
        let end_time = NodeDataExtractor::extract_f64_or_default(&node.data, "endTime", 60.0);
        
        NodeValidator::validate_range(start_time, 0.0, f64::MAX, "start_time")?;
        NodeValidator::validate_range(end_time, start_time + 0.1, f64::MAX, "end_time")?;
        
        // 🔧 SIMPLIFIED: Trim node now ONLY stores data, never creates files
        let trim_params = TrimParams {
            input_path: input_video.path.clone(),
            output_path: String::new(), // Not used in data-only mode
            start_time,
            end_time,
            create_file: false, // Always false - only data output
        };

        // Execute the trim operation in passthrough mode only
        let _result_video = self.trim_service.trim_video(trim_params).await?;
        
        // ✅ ALWAYS store trim data in context for downstream nodes
        context.add_trim_data(input_video.path.clone(), start_time, end_time);
        
        println!("📋 Trim data-only mode: {} ({}s-{}s) - trim data stored in context", 
                 input_video.path, start_time, end_time);
        
        // Return None since this node only outputs data, not video files
        Ok(None)
    }

    // Add this method to the NodeHandlers impl:
    async fn handle_trim_audio(&self, node: &NodeData, context: &mut ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_audio = ConnectionHelper::get_input_video(&node.id, context, connections, "audio-input")?;
        
        let start_time = NodeDataExtractor::extract_f64_or_default(&node.data, "startTime", 0.0);
        let end_time = NodeDataExtractor::extract_f64_or_default(&node.data, "endTime", 60.0);
        
        NodeValidator::validate_range(start_time, 0.0, f64::MAX, "start_time")?;
        NodeValidator::validate_range(end_time, start_time + 0.1, f64::MAX, "end_time")?;
        
        // Create the audio trim service locally
        let audio_trim_service = TrimAudioService::new();
        
        let trim_params = TrimAudioParams {
            input_path: input_audio.path.clone(),
            output_path: String::new(),
            start_time,
            end_time,
            create_file: false,
        };

        let _result_audio = audio_trim_service.trim_audio(trim_params).await?;
        
        context.add_trim_data(input_audio.path.clone(), start_time, end_time);
        
        println!("📋 Audio trim data-only mode: {} ({}s-{}s) - trim data stored in context", 
                input_audio.path, start_time, end_time);
        
        Ok(None)
    }

    async fn handle_convert_video(&self, node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_video = ConnectionHelper::get_input_video(&node.id, context, connections, "video-input")?;
        
        println!("🎬 Processing convert video node: {}", node.id);
        
        // Extract basic parameters
        let format = NodeDataExtractor::extract_string_or_default(&node.data, "format", "mp4");
        let quality = NodeDataExtractor::extract_string_or_default(&node.data, "quality", "medium");
        let use_gpu = NodeDataExtractor::extract_bool_or_default(&node.data, "useGPU", false);
        let gpu_type = NodeDataExtractor::extract_string_or_default(&node.data, "gpuType", "auto");

        // Extract enhanced parameters
        let bitrate_mode = NodeDataExtractor::extract_string_or_default(&node.data, "bitrateMode", "auto");
        let custom_bitrate = if bitrate_mode == "custom" {
            NodeDataExtractor::extract_string(&node.data, "customBitrate").ok()
        } else {
            None
        };
        let crf_value = if bitrate_mode == "crf" {
            NodeDataExtractor::extract_string(&node.data, "crfValue").ok()
        } else {
            None
        };

        let resolution = NodeDataExtractor::extract_string_or_default(&node.data, "resolution", "original");
        
        // Extract custom resolution if needed
        let (custom_width, custom_height) = if resolution == "custom" {
            let width = node.data.get("customResolution")
                .and_then(|v| v.get("width"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let height = node.data.get("customResolution")
                .and_then(|v| v.get("height"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            (width, height)
        } else {
            (None, None)
        };

        let framerate = NodeDataExtractor::extract_string_or_default(&node.data, "framerate", "original");
        let audio_codec = NodeDataExtractor::extract_string_or_default(&node.data, "audioCodec", "aac");
        let audio_bitrate = NodeDataExtractor::extract_string_or_default(&node.data, "audioBitrate", "128");

        // Determine output path
        let output_path = match NodeDataExtractor::extract_string(&node.data, "outputPath") {
            Ok(path) if !path.is_empty() && path != "$ auto_generate" => path,
            _ => {
                // When no output path is specified, use the same directory as the source video
                let source_path = Path::new(&input_video.path);
                let source_dir = source_path.parent()
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source video directory".to_string()))?;
                
                // Get the video filename without extension
                let video_name = source_path.file_stem()
                    .and_then(|name| name.to_str())
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source video filename".to_string()))?;
                
                // Generate the output path in the same directory with converted suffix
                let output_filename = format!("{}_converted.{}", video_name, format);
                source_dir.join(output_filename).to_string_lossy().to_string()
            }
        };

        // Check for trim parameters from upstream trim node
        let (trim_start, trim_end) = if let Ok(trim_data) = context.get_trim_data(&input_video.path) {
            (Some(trim_data.start_time), Some(trim_data.end_time))
        } else {
            (None, None)
        };

        // Build enhanced conversion parameters
        let conversion_params = ConversionParams {
            input_path: input_video.path.clone(),
            output_path: output_path.clone(),
            format: format.clone(),
            quality,
            use_gpu,
            gpu_type,
            // Enhanced parameters
            bitrate_mode,
            custom_bitrate,
            crf_value,
            resolution,
            custom_width,
            custom_height,
            framerate,
            audio_codec,
            audio_bitrate,
            trim_start,
            trim_end,
        };

        let converted_video = self.ffmpeg.convert_video(conversion_params).await?;
        Ok(Some(converted_video))
    }

    async fn handle_convert_audio(&self, node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        // Note: We return VideoData for compatibility, but it represents audio data
        let input_audio = ConnectionHelper::get_input_video(&node.id, context, connections, "audio-input")?;
        
        println!("🎵 Processing convert audio node: {}", node.id);
        
        // Extract audio conversion parameters
        let format = NodeDataExtractor::extract_string_or_default(&node.data, "format", "mp3");
        let quality = NodeDataExtractor::extract_string_or_default(&node.data, "quality", "medium");
        let sample_rate = NodeDataExtractor::extract_string_or_default(&node.data, "sampleRate", "original");
        let bitrate_mode = NodeDataExtractor::extract_string_or_default(&node.data, "bitrateMode", "auto");
        let custom_bitrate = if bitrate_mode == "custom" {
            NodeDataExtractor::extract_string(&node.data, "customBitrate").ok()
        } else {
            None
        };
        let vbr_quality = if bitrate_mode == "vbr" {
            NodeDataExtractor::extract_string(&node.data, "vbrQuality").ok()
        } else {
            None
        };
        let channels = NodeDataExtractor::extract_string_or_default(&node.data, "channels", "original");
        let codec = NodeDataExtractor::extract_string_or_default(&node.data, "codec", "mp3");
        let normalize = NodeDataExtractor::extract_bool_or_default(&node.data, "normalize", false);
        let volume_gain = NodeDataExtractor::extract_string(&node.data, "volumeGain").ok()
            .filter(|s| !s.is_empty() && s != "0" && s != "0.0");

        // Determine output path
        let output_path = match NodeDataExtractor::extract_string(&node.data, "outputPath") {
            Ok(path) if !path.is_empty() && path != "$ auto_generate" => path,
            _ => {
                // When no output path is specified, use the same directory as the source audio
                let source_path = Path::new(&input_audio.path);
                let source_dir = source_path.parent()
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source audio directory".to_string()))?;
                
                // Get the audio filename without extension
                let audio_name = source_path.file_stem()
                    .and_then(|name| name.to_str())
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source audio filename".to_string()))?;
                
                // Generate the output path in the same directory with converted suffix
                let output_filename = format!("{}_converted.{}", audio_name, format);
                source_dir.join(output_filename).to_string_lossy().to_string()
            }
        };

        // Check for trim parameters from upstream trim node
        let (trim_start, trim_end) = if let Ok(trim_data) = context.get_trim_data(&input_audio.path) {
            (Some(trim_data.start_time), Some(trim_data.end_time))
        } else {
            (None, None)
        };

        // Build audio conversion parameters
        let conversion_params = crate::services::AudioConversionParams {
            input_path: input_audio.path.clone(),
            output_path: output_path.clone(),
            format: format.clone(),
            quality,
            sample_rate,
            bitrate: "auto".to_string(), // Will be determined by quality/bitrate_mode
            bitrate_mode,
            custom_bitrate,
            vbr_quality,
            channels,
            codec,
            normalize,
            volume_gain,
            trim_start,
            trim_end,
        };

        // Convert the audio
        let converted_audio = self.ffmpeg.convert_audio(conversion_params).await?;
        
        // Convert AudioData to VideoData for compatibility with existing pipeline
        let converted_video_data = VideoData {
            path: converted_audio.path,
            format: converted_audio.format,
            width: 0,  // Not applicable for audio
            height: 0, // Not applicable for audio
            duration: converted_audio.duration,
        };
        
        Ok(Some(converted_video_data))
    }

    async fn handle_sequence_extract(&self, node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<()> {
        let input_video = ConnectionHelper::get_input_video(&node.id, context, connections, "video-input")?;
        
        let format = NodeDataExtractor::extract_string_or_default(&node.data, "format", "png");
        let compression = NodeDataExtractor::extract_string_or_default(&node.data, "compression", "medium");
        let size = NodeDataExtractor::extract_string_or_default(&node.data, "size", "original");
        let fps = NodeDataExtractor::extract_string_or_default(&node.data, "fps", "original");
        let quality = NodeDataExtractor::extract_string_or_default(&node.data, "quality", "high");
        
        let output_path = match NodeDataExtractor::extract_string(&node.data, "outputPath") {
            Ok(path) if !path.is_empty() => path,
            _ => {
                // When no output path is specified, create a folder based on the source video name
                let source_path = Path::new(&input_video.path);
                let source_dir = source_path.parent()
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source video directory".to_string()))?;
                
                // Get the video filename without extension for the folder name
                let video_name = source_path.file_stem()
                    .and_then(|name| name.to_str())
                    .ok_or_else(|| PipelineError::InvalidNodeConfig("Cannot determine source video filename".to_string()))?;
                
                // Create frames directory named after the video file
                let frames_dir = source_dir.join(format!("{}_frames", video_name));
                let frames_dir_str = frames_dir.to_string_lossy().to_string();
                
                // Generate the output pattern with video name prefix
                format!("{}/{}_%04d.{}", frames_dir_str, video_name, format)
            }
        };

        let output_dir = std::path::Path::new(&output_path)
            .parent()
            .unwrap_or_else(|| std::path::Path::new(&output_path))
            .to_string_lossy()
            .to_string();

        std::fs::create_dir_all(&output_dir)
            .map_err(|e| PipelineError::DirectoryCreationFailed(format!("Failed to create directory {}: {}", output_dir, e)))?;

        let params = FrameExtractionParams {
            input_path: input_video.path.clone(),
            output_pattern: output_path,
            format,
            compression,
            size,
            fps,
            quality,
        };

        // Check if we have trim parameters from upstream trim node
        if let Ok(trim_data) = context.get_trim_data(&input_video.path) {
            println!("📸 Extracting frames with trim: {}s-{}s", trim_data.start_time, trim_data.end_time);
            self.ffmpeg.extract_frames_with_trim(params, trim_data.start_time, trim_data.end_time).await?;
        } else {
            println!("📸 Extracting frames from full video");
            self.ffmpeg.extract_frames(params).await?;
        }
        
        Ok(())
    }

    async fn handle_view_video(&self, _node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_video = ConnectionHelper::get_input_video(&_node.id, context, connections, "video-input")?;
        Ok(Some(input_video.clone()))
    }

    async fn handle_info_video(&self, node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_video = ConnectionHelper::get_input_video(&node.id, context, connections, "video-input")?;
        let _metadata = self.ffmpeg.get_video_metadata(&input_video.path).await?;
        Ok(None)
    }

    async fn handle_grid_view(&self, _node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        let input_video = ConnectionHelper::get_input_video(&_node.id, context, connections, "video-input")?;
        Ok(Some(input_video.clone()))
    }

    async fn handle_spectrum_analyzer(&self, node: &NodeData, context: &ExecutionContext, connections: &[ConnectionData]) -> Result<Option<VideoData>> {
        println!("🎵 Processing spectrum analyzer node: {}", node.id);
        
        // Debug: Print all connections for this node
        let all_connections: Vec<_> = connections.iter()
            .filter(|conn| conn.to == node.id)
            .collect();
        
        println!("🎵 Spectrum analyzer connections: {:?}", all_connections);
        
        // Try multiple input handle names
        let input_video = ConnectionHelper::get_input_video(&node.id, context, connections, "video-input")
            .or_else(|_| ConnectionHelper::get_input_video(&node.id, context, connections, "audio-input"))
            .or_else(|_| ConnectionHelper::get_input_video(&node.id, context, connections, "video-output"))
            .or_else(|_| {
                // Try any connection to this node
                if let Some(connection) = all_connections.first() {
                    match context.get_result(&connection.from) {
                        Ok(source_video) => Ok(source_video),
                        Err(e) => Err(PipelineError::InvalidNodeConfig(
                            format!("Source node {} has no video data: {}", connection.from, e)
                        ))
                    }
                } else {
                    Err(PipelineError::InvalidNodeConfig(
                        "Spectrum analyzer has no input connections".to_string()
                    ))
                }
            })
            .map_err(|_| PipelineError::InvalidNodeConfig(
                "Spectrum analyzer needs an audio/video input connection".to_string()
            ))?;

        println!("🎵 Spectrum analyzer connected to: {}", input_video.path);

        // Extract spectrum analyzer configuration
        let bar_count = node.data.get("barCount")
            .and_then(|v| v.as_u64())
            .unwrap_or(64) as u32;
            
        let sensitivity = node.data.get("sensitivity")
            .and_then(|v| v.as_f64())
            .unwrap_or(80.0) as f32 / 100.0; // Convert percentage to decimal
            
        let smoothing = node.data.get("smoothing")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.8) as f32;
            
        let gain_boost = node.data.get("gainBoost")
            .and_then(|v| v.as_f64())
            .unwrap_or(1.5) as f32;

        println!("🎵 Spectrum config - bars: {}, sensitivity: {:.2}, smoothing: {:.2}, gain: {:.2}", 
                 bar_count, sensitivity, smoothing, gain_boost);

        // For pipeline execution, we don't start the real-time analysis
        // Instead, we just pass through the video data and mark the node as configured
        // The real-time analysis is handled separately via the spectrum commands
        
        // Create a copy of the video data with spectrum analyzer path for downstream nodes
        let mut spectrum_video = input_video.clone();
        spectrum_video.path = input_video.path.clone(); // Keep the original video path
        
        println!("✅ Spectrum analyzer node {} configured successfully", node.id);
        
        // Return the input video so downstream nodes can use it
        Ok(Some(spectrum_video))
    }
}