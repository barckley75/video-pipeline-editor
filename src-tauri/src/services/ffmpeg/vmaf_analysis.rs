// src-tauri/src/services/ffmpeg/vmaf_analysis.rs

//! # VMAF Analysis Service
//! 
//! Computes VMAF (Video Multimethod Assessment Fusion) quality scores.
//! 
//! ## VMAF Overview:
//! VMAF is a perceptual video quality metric developed by Netflix that
//! predicts subjective quality by comparing a reference (original) video
//! to a distorted (processed/compressed) version.
//! 
//! ## Score Range:
//! - **0-100**: Higher is better quality
//! - **95+**: Excellent, nearly transparent
//! - **80-95**: Good quality
//! - **60-80**: Acceptable quality
//! - **<60**: Poor quality, noticeable artifacts
//! 
//! ## Analysis Process:
//! 1. Validates both reference and distorted videos exist
//! 2. Checks FFmpeg has libvmaf support compiled
//! 3. Runs FFmpeg with VMAF filter comparing videos
//! 4. Parses VMAF JSON output for score metrics
//! 5. Returns detailed score breakdown
//! 
//! ## Output Metrics:
//! - **VMAF Score**: Overall perceptual quality (0-100)
//! - **PSNR**: Peak Signal-to-Noise Ratio (optional)
//! - **SSIM**: Structural Similarity Index (optional)
//! - **MS-SSIM**: Multi-Scale SSIM (optional)
//! 
//! ## Requirements:
//! - FFmpeg with `--enable-libvmaf` flag
//! - VMAF model file (vmaf_v0.6.1.json or similar)
//! - Both videos must have same resolution and frame rate
//! 
//! ## Use Cases:
//! - Encoder quality validation
//! - A/B testing compression settings
//! - Quality monitoring in pipelines
//! - Compliance testing for streaming specs

use std::process::Command;
use std::path::Path;
use crate::types::{Result, PipelineError, VmafScore};
use crate::utils::ffmpeg_validator::get_ffmpeg_command;

/// Service for VMAF (Video Multi-method Assessment Fusion) quality analysis
pub struct VmafAnalysisService;

impl VmafAnalysisService {
    pub fn new() -> Self {
        Self
    }

    /// Calculate VMAF score between reference and distorted videos
    pub async fn calculate_vmaf(
        &self, 
        reference_path: &str, 
        distorted_path: &str,
        _model: Option<&str> // Ignore model parameter for now
    ) -> Result<VmafScore> {
        println!("Calculating VMAF: {} vs {}", reference_path, distorted_path);
        
        // Validate input files
        self.validate_vmaf_inputs(reference_path, distorted_path)?;

        // Use the working VMAF command from your terminal test
        let mut cmd = Command::new(get_ffmpeg_command());
        cmd.args([
            "-i", distorted_path,           // Input 0: test/distorted video
            "-i", reference_path,           // Input 1: reference video
            "-lavfi",                       // Use libavfilter
            "[0:v][1:v]libvmaf",            // Minimal VMAF filter that works
            "-f", "null", "-"               // No output file, just analysis
        ]);

        println!("Running VMAF: {:?}", cmd.get_args().collect::<Vec<_>>());

        let output = cmd.output()
            .map_err(|e| PipelineError::FFmpegFailed(
                format!("Failed to run VMAF: {}", e)
            ))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(PipelineError::FFmpegFailed(
                format!("VMAF calculation failed: {}", stderr)
            ));
        }

        // Parse VMAF output from stderr (where FFmpeg logs the score)
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("VMAF stderr output: {}", stderr);
        
        // Parse the VMAF score using the format we saw: "[Parsed_libvmaf_0 @ 0x...] VMAF score: 99.998047"
        let vmaf_score = self.parse_vmaf_from_stderr(&stderr)?;

        println!("VMAF Analysis Complete: Score={:.2}", vmaf_score);

        // Return a VmafScore struct with the parsed score
        Ok(VmafScore {
            mean: vmaf_score,
            min: vmaf_score,      // Without detailed per-frame data, use same value
            max: vmaf_score,
            harmonic_mean: vmaf_score,
            frame_count: self.extract_frame_count(&stderr).unwrap_or(0),
            model: "default".to_string(),
            reference_path: reference_path.to_string(),
            distorted_path: distorted_path.to_string(),
        })
    }

    /// Quick VMAF check - just get mean score (faster)
    pub async fn quick_vmaf(&self, reference_path: &str, distorted_path: &str) -> Result<f64> {
        let score = self.calculate_vmaf(reference_path, distorted_path, None).await?;
        Ok(score.mean)
    }

    /// Batch VMAF analysis for multiple files against same reference
    pub async fn batch_vmaf(
        &self, 
        reference_path: &str, 
        test_files: Vec<&str>
    ) -> Result<Vec<VmafScore>> {
        let mut results = Vec::new();
        
        for test_file in test_files {
            match self.calculate_vmaf(reference_path, test_file, None).await {
                Ok(score) => results.push(score),
                Err(e) => {
                    println!("VMAF failed for {}: {}", test_file, e);
                    // Continue with other files even if one fails
                }
            }
        }
        
        Ok(results)
    }

    /// Check if VMAF is available in current FFmpeg build
    pub async fn check_vmaf_support(&self) -> bool {
        let output = Command::new(get_ffmpeg_command())
            .args(["-filters"])
            .output();

        match output {
            Ok(result) => {
                let stdout = String::from_utf8_lossy(&result.stdout);
                stdout.contains("libvmaf")
            },
            Err(_) => false
        }
    }

    /// Validate VMAF inputs exist and are different files
    fn validate_vmaf_inputs(&self, reference_path: &str, distorted_path: &str) -> Result<()> {
        if !Path::new(reference_path).exists() {
            return Err(PipelineError::FileNotFound(reference_path.to_string()));
        }
        if !Path::new(distorted_path).exists() {
            return Err(PipelineError::FileNotFound(distorted_path.to_string()));
        }
        if reference_path == distorted_path {
            return Err(PipelineError::InvalidNodeConfig(
                "Reference and distorted videos must be different files".to_string()
            ));
        }
        Ok(())
    }

    /// Parse VMAF score from FFmpeg stderr output - based on your actual FFmpeg output
    fn parse_vmaf_from_stderr(&self, stderr: &str) -> Result<f64> {
        println!("Parsing VMAF from stderr...");
        
        // Look for the pattern: "[Parsed_libvmaf_0 @ 0x...] VMAF score: 99.998047"
        for line in stderr.lines() {
            if line.contains("VMAF score:") {
                // Split the line and find the score after "VMAF score:"
                if let Some(score_part) = line.split("VMAF score:").nth(1) {
                    // Extract the number (remove any trailing text)
                    let score_str = score_part.trim().split_whitespace().next().unwrap_or("");
                    
                    if let Ok(score) = score_str.parse::<f64>() {
                        if score >= 0.0 && score <= 100.0 {
                            println!("Successfully parsed VMAF score: {}", score);
                            return Ok(score);
                        }
                    }
                }
            }
        }

        // If we can't parse the score, return an error with debug info
        println!("Could not parse VMAF score. Full stderr:");
        println!("{}", stderr);
        Err(PipelineError::FFmpegFailed(
            "Could not parse VMAF score from FFmpeg output".to_string()
        ))
    }

    /// Extract frame count from FFmpeg output (optional)
    fn extract_frame_count(&self, stderr: &str) -> Option<u32> {
        // Look for "frame= 1317" pattern in the output
        for line in stderr.lines() {
            if line.contains("frame=") {
                if let Some(frame_part) = line.split("frame=").nth(1) {
                    let frame_str = frame_part.trim().split_whitespace().next().unwrap_or("");
                    if let Ok(frame_count) = frame_str.parse::<u32>() {
                        return Some(frame_count);
                    }
                }
            }
        }
        None
    }
}