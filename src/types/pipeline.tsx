// src/types/pipeline.ts

/**
 * 📐 TYPE DEFINITIONS
 * 
 * Complete TypeScript type definitions for the entire pipeline system.
 * Central source of truth for all data structures.
 * 
 * USED BY:
 * ├── ALL nodes - Data type safety
 * ├── ALL hooks - State typing
 * ├── ALL services - Function signatures
 * └── ALL components - Props typing
 * 
 * TYPE CATEGORIES:
 * 
 * VIDEO DATA:
 * - VideoData: Basic video info (path, format, dimensions, duration)
 * - VideoMetadata: Extended with codec, bitrate, fps, audio info
 * 
 * AUDIO DATA:
 * - AudioData: Basic audio info (path, format, duration, sample rate)
 * - AudioMetadata: Extended with codec, bitrate, levels, metadata
 * - ConvertAudioData: Audio conversion parameters
 * 
 * ANALYSIS:
 * - VmafScore: VMAF quality metrics
 * - VmafFrame: Per-frame quality data
 * 
 * EXECUTION:
 * - ExecutionResult: Backend execution response
 * - Includes: outputs, vmaf_results, audio_outputs
 * 
 * NODE DATA:
 * - InputVideoData, InputAudioData: File selection
 * - ConvertVideoData, ConvertAudioData: Conversion settings
 * - ViewVideoData, GridViewData: Display settings
 * - InfoVideoData, InfoAudioData: Metadata display
 * - TrimParams: Time-based trimming
 * - TrimAudioData: Audio trimming
 * - SequenceExtractData: Frame extraction
 * - VmafAnalysisData: Quality analysis
 * - SpectrumAnalyzerData: Audio spectrum
 * 
 * UTILITIES:
 * - MousePosition: { x, y }
 * - NodeUpdateCallback: Update function signature
 */

// ═══════════════════════════════════════════════════════════════════
// 🎬 VIDEO DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════
export interface VideoData {
  path: string;
  format: string;
  width: number;
  height: number;
  duration: number;
}

export interface VideoMetadata extends VideoData {
  bitrate?: number;
  fps?: number;
  codec?: string;
  size?: number;
  audioCodec?: string;
  audioSampleRate?: number;
  audioChannels?: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🎵 AUDIO DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════

export interface ConvertAudioData {
  format: string;
  quality: string;
  outputPath: string;
  sampleRate: string;
  bitrate: string;
  bitrateMode: 'auto' | 'custom' | 'vbr';
  customBitrate: string;
  vbrQuality: string;
  channels: string;
  codec: string;
  normalize: boolean;
  volumeGain: string;
  audioPath?: string;
  trimParams?: TrimParams;
}

export interface AudioData {
  path: string;
  format: string;
  duration: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
}

export interface AudioMetadata extends AudioData {
  codec?: string;
  size?: number;
  // Extended audio metadata fields
  bitsPerSample?: number;
  channelLayout?: string;
  encoder?: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  totalSamples?: number;
  peakLevel?: number;
  rmsLevel?: number;
  dynamicRange?: number;
  lufsIntegrated?: number;
  lufsRange?: number;
  truePeak?: number;
  hasMetadata?: boolean;
  metadata?: Record<string, any>;
  streams?: Array<any>;
}

// ═══════════════════════════════════════════════════════════════════
// 📊 VMAF ANALYSIS TYPES
// ═══════════════════════════════════════════════════════════════════
export interface VmafScore {
  mean: number;           // Overall average score (0-100)
  min: number;            // Worst frame score
  max: number;            // Best frame score  
  harmonic_mean: number;  // Weighted average
  frame_count: number;    // Total frames analyzed
  model: string;          // VMAF model used
  reference_path: string;
  distorted_path: string;
}

export interface VmafFrame {
  frame_num: number;
  vmaf: number;           // Per-frame VMAF score
  psnr_y?: number;        // Additional metrics
  ssim?: number;
  ms_ssim?: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 PIPELINE EXECUTION RESULTS
// ═══════════════════════════════════════════════════════════════════
export interface ExecutionResult {
  success: boolean;
  message: string;
  outputs: Record<string, VideoData>;
  vmaf_results?: Record<string, VmafScore>; // VMAF analysis results
  audio_outputs?: Record<string, AudioData>; // Audio processing results
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 NODE-SPECIFIC DATA INTERFACES  
// ═══════════════════════════════════════════════════════════════════
export interface InputVideoData {
  filePath: string;
}

export interface InputAudioData {
  filePath: string;
}

export interface ConvertVideoData {
  format: string;
  quality: string;
  outputPath: string;
  useGPU: boolean;
  gpuType: string;
  videoPath?: string;
  trimParams?: TrimParams;
}

export interface ViewVideoData {
  videoPath?: string;
}

export interface InfoVideoData {
  videoPath?: string;
  metadata?: VideoMetadata;
  isAnalyzing?: boolean;
  error?: string | null;
}

export interface InfoAudioData {  // NEW: Audio info node data
  audioPath?: string;
  metadata?: AudioMetadata;
  isAnalyzing?: boolean;
  error?: string | null;
}

export interface GridViewData {
  videoPath?: string;
  gridSize?: number;
}

export interface SequenceExtractData {
  format: string;
  compression: string;
  size: string;
  outputPath: string;
  fps: string;
  quality: string;
  videoPath?: string;
  trimParams?: TrimParams;
}

export interface VmafAnalysisData {
  model: string;
  pooling: string;
  outputFormat: string;
  confidenceInterval: boolean;
  vmafScore?: VmafScore;
  isAnalyzing?: boolean;
  error?: string | null;
  // Add these to track connections
  referenceVideoPath?: string;
  testVideoPath?: string;
}

export interface SpectrumAnalyzerData {
  audioFile: string;
  audioPath?: string;
  videoPath?: string;  
  sensitivity: number;
  smoothing: number;
  barCount: number;
  showFreqLabels: boolean;
  gainBoost: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🔗 SHARED DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════
export interface TrimParams {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface TrimAudioData {
  audioPath?: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🎣 CALLBACK TYPES
// ═══════════════════════════════════════════════════════════════════
export type NodeUpdateCallback = (nodeId: string, newData: any) => void;