// src/components/ui/FFmpegSettingsDialog.tsx

/**
 * 🎬 FFMPEG SETTINGS DIALOG
 * 
 * Provides UI for configuring FFmpeg and FFprobe paths.
 * Users can auto-detect, manually set paths, or reset to defaults.
 * 
 * FEATURES:
 * - Auto-detection of FFmpeg installations
 * - Manual path entry with validation
 * - Real-time path validation feedback
 * - Installation instructions when FFmpeg not found
 * - Reset to auto-detection
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface FFmpegConfig {
  ffmpegPath: string | null;
  ffprobePath: string | null;
}

interface AutoDetectResult {
  ffmpegFound: boolean;
  ffmpegPath: string | null;
  ffprobeFound: boolean;
  ffprobePath: string | null;
}

interface FFmpegSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FFmpegSettingsDialog({ isOpen, onClose }: FFmpegSettingsDialogProps) {
  const [ffmpegPath, setFfmpegPath] = useState<string>('');
  const [ffprobePath, setFfprobePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [ffmpegValid, setFfmpegValid] = useState<boolean | null>(null);
  const [ffprobeValid, setFfprobeValid] = useState<boolean | null>(null);

  // Load current configuration when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const config = await invoke<FFmpegConfig>('get_ffmpeg_config');
      setFfmpegPath(config.ffmpegPath || '');
      setFfprobePath(config.ffprobePath || '');
      
      // Validate current paths if they exist
      if (config.ffmpegPath) {
        validateFfmpegPathDebounced(config.ffmpegPath);
      }
      if (config.ffprobePath) {
        validateFfprobePathDebounced(config.ffprobePath);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage({ type: 'error', text: `Failed to load config: ${error}` });
    }
  };

  const handleAutoDetect = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await invoke<AutoDetectResult>('auto_detect_ffmpeg');
      
      if (result.ffmpegFound && result.ffmpegPath) {
        setFfmpegPath(result.ffmpegPath);
        await invoke('set_ffmpeg_path', { path: result.ffmpegPath });
        setFfmpegValid(true);
      } else {
        setMessage({ 
          type: 'error', 
          text: 'FFmpeg not found. Please install FFmpeg or specify the path manually.' 
        });
        setFfmpegValid(false);
      }
      
      if (result.ffprobeFound && result.ffprobePath) {
        setFfprobePath(result.ffprobePath);
        await invoke('set_ffprobe_path', { path: result.ffprobePath });
        setFfprobeValid(true);
      } else {
        setMessage({ 
          type: 'error', 
          text: 'FFprobe not found. Please install FFmpeg or specify the path manually.' 
        });
        setFfprobeValid(false);
      }
      
      if (result.ffmpegFound && result.ffprobeFound) {
        setMessage({ 
          type: 'success', 
          text: '✅ FFmpeg and FFprobe detected and configured successfully!' 
        });
      }
    } catch (error) {
      console.error('Auto-detect failed:', error);
      setMessage({ type: 'error', text: `Auto-detect failed: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const validateFfmpegPathDebounced = async (path: string) => {
    if (!path) {
      setFfmpegValid(null);
      return;
    }
    
    try {
      await invoke<string>('validate_ffmpeg_path', { path });
      setFfmpegValid(true);
    } catch (error) {
      setFfmpegValid(false);
    }
  };

  const validateFfprobePathDebounced = async (path: string) => {
    if (!path) {
      setFfprobeValid(null);
      return;
    }
    
    try {
      await invoke<string>('validate_ffprobe_path', { path });
      setFfprobeValid(true);
    } catch (error) {
      setFfprobeValid(false);
    }
  };

  const handleSetFfmpegPath = async () => {
    if (!ffmpegPath) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await invoke<string>('set_ffmpeg_path', { path: ffmpegPath });
      setMessage({ type: 'success', text: result });
      setFfmpegValid(true);
    } catch (error) {
      console.error('Failed to set FFmpeg path:', error);
      setMessage({ type: 'error', text: `Invalid FFmpeg path: ${error}` });
      setFfmpegValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetFfprobePath = async () => {
    if (!ffprobePath) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await invoke<string>('set_ffprobe_path', { path: ffprobePath });
      setMessage({ type: 'success', text: result });
      setFfprobeValid(true);
    } catch (error) {
      console.error('Failed to set FFprobe path:', error);
      setMessage({ type: 'error', text: `Invalid FFprobe path: ${error}` });
      setFfprobeValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await invoke<string>('clear_ffmpeg_config');
      setFfmpegPath('');
      setFfprobePath('');
      setFfmpegValid(null);
      setFfprobeValid(null);
      setMessage({ type: 'success', text: result });
    } catch (error) {
      console.error('Failed to reset config:', error);
      setMessage({ type: 'error', text: `Failed to reset: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getValidationIcon = (valid: boolean | null) => {
    if (valid === null) return null;
    return valid ? '[✓]' : '[✗]';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        color: 'rgba(148, 163, 184, 0.9)',
        fontSize: '12px',
        fontFamily: 'inherit',
        letterSpacing: '0.5px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            $ ffmpeg --configure
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(148, 163, 184, 0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(148, 163, 184, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148, 163, 184, 0.6)'}
          >
            ×
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: message.type === 'success' 
              ? 'rgba(34, 197, 94, 0.1)' 
              : message.type === 'error'
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${
              message.type === 'success' 
                ? 'rgba(34, 197, 94, 0.3)' 
                : message.type === 'error'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(59, 130, 246, 0.3)'
            }`,
            borderRadius: '2px',
            fontSize: '11px'
          }}>
            {message.text}
          </div>
        )}

        {/* Auto-Detect Section */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleAutoDetect}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(148, 163, 184, 0.9)',
              padding: '10px 16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              borderRadius: '2px',
              fontSize: '11px',
              letterSpacing: '0.5px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {isLoading ? '> detecting...' : '> auto_detect_ffmpeg'}
          </button>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '10px', 
            color: 'rgba(148, 163, 184, 0.5)',
            paddingLeft: '4px'
          }}>
            # automatically find FFmpeg and FFprobe on your system
          </div>
        </div>

        {/* Divider */}
        <div style={{
          margin: '20px 0',
          display: 'flex',
          alignItems: 'center',
          fontSize: '10px',
          color: 'rgba(148, 163, 184, 0.4)'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />
          <span style={{ padding: '0 12px' }}>or configure manually</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />
        </div>

        {/* FFmpeg Path */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '11px',
            color: 'rgba(148, 163, 184, 0.8)'
          }}>
            $ ffmpeg_path {getValidationIcon(ffmpegValid)}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={ffmpegPath}
              onChange={(e) => {
                setFfmpegPath(e.target.value);
                validateFfmpegPathDebounced(e.target.value);
              }}
              placeholder="/usr/local/bin/ffmpeg"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(148, 163, 184, 0.9)',
                padding: '8px 12px',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <button
              onClick={handleSetFfmpegPath}
              disabled={isLoading || !ffmpegPath}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(148, 163, 184, 0.9)',
                padding: '8px 16px',
                cursor: (isLoading || !ffmpegPath) ? 'not-allowed' : 'pointer',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'inherit',
                opacity: (isLoading || !ffmpegPath) ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && ffmpegPath) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              set
            </button>
          </div>
        </div>

        {/* FFprobe Path */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '11px',
            color: 'rgba(148, 163, 184, 0.8)'
          }}>
            $ ffprobe_path {getValidationIcon(ffprobeValid)}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={ffprobePath}
              onChange={(e) => {
                setFfprobePath(e.target.value);
                validateFfprobePathDebounced(e.target.value);
              }}
              placeholder="/usr/local/bin/ffprobe"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(148, 163, 184, 0.9)',
                padding: '8px 12px',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <button
              onClick={handleSetFfprobePath}
              disabled={isLoading || !ffprobePath}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(148, 163, 184, 0.9)',
                padding: '8px 16px',
                cursor: (isLoading || !ffprobePath) ? 'not-allowed' : 'pointer',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'inherit',
                opacity: (isLoading || !ffprobePath) ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && ffprobePath) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              set
            </button>
          </div>
        </div>

        {/* Installation Instructions */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            marginBottom: '8px',
            fontSize: '11px',
            color: 'rgba(148, 163, 184, 0.8)'
          }}>
            # installation_guide
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(148, 163, 184, 0.6)' }}>
            <div>macOS: <span style={{ fontFamily: 'monospace' }}>brew install ffmpeg</span></div>
            <div>linux: <span style={{ fontFamily: 'monospace' }}>sudo apt install ffmpeg</span></div>
            <div>windows: <span style={{ fontFamily: 'monospace' }}>choco install ffmpeg</span></div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(148, 163, 184, 0.7)',
              padding: '10px 16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              borderRadius: '2px',
              fontSize: '11px',
              fontFamily: 'inherit',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.color = 'rgba(148, 163, 184, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)';
            }}
          >
            reset
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(148, 163, 184, 0.9)',
              padding: '10px 16px',
              cursor: 'pointer',
              borderRadius: '2px',
              fontSize: '11px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}