// src/nodes/GridViewNode.tsx
import React, { memo, useMemo, useEffect, useState } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeInfo } from '../components/NodeUI';
import { convertFileSrc } from '@tauri-apps/api/core';

interface GridViewData {
  videoPath?: string;
}

interface GridViewNodeProps {
  id: string;
  data: GridViewData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<GridViewData>) => void;
}

const GridViewNode: React.FC<GridViewNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  console.log(`GridViewNode ${id} render`); // Debug log
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const setupVideo = async () => {
      // Check if we have a video path from connected input node
      const inputPath = data?.videoPath;
      
      if (!inputPath || inputPath === '$ null' || inputPath.trim() === '') {
        setVideoSrc('');
        setError('No video connected');
        return;
      }

      try {
        // Convert the file path to a URL the browser can use
        const videoUrl = await convertFileSrc(inputPath);
        console.log('Converting video path:', inputPath);
        console.log('Generated video URL:', videoUrl);
        setVideoSrc(videoUrl);
        setError('');
      } catch (err) {
        console.error('Failed to convert video path:', err);
        setError('Failed to load video file');
        setVideoSrc('');
      }
    };
    
    setupVideo();
  }, [data?.videoPath]);

  // Use useMemo to prevent video from being recreated on every render
  const memoizedVideo = useMemo(() => {
    if (!videoSrc) {
      return (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '2px dashed rgba(245, 101, 101, 0.4)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '8px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '16px' }}>📹</div>
          <div style={{ 
            fontSize: '10px', 
            color: 'rgba(224, 242, 254, 0.6)',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            {error || 'Connect input video node'}
          </div>
        </div>
      );
    }

    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(245, 101, 101, 0.4)',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '8px'
      }}>
        <video
          key={videoSrc} // Force recreation when source changes
          width="400"
          height="240"
          controls
          preload="metadata"
          playsInline
          style={{ 
            borderRadius: '4px',
            display: 'block',
            objectFit: 'contain' // Show full video without cropping
          }}
          onError={(e) => {
            console.log('Video playback error:', e);
            console.log('Failed to load:', videoSrc);
            setError('Video playback failed');
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully from:', videoSrc);
            setError('');
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          Video not supported
        </video>
      </div>
    );
  }, [videoSrc, error]);

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="output_dysplays"
      title='VIDEO_PREVIEW_02'
      hasInput={true}
      hasOutput={false}
      onDataUpdate={onDataUpdate}
    >
      {memoizedVideo}
      <NodeInfo>
        display: {videoSrc ? 'connected_video' : 'awaiting_input'} | dynamic_source
      </NodeInfo>
    </BaseNode>
  );
};

export default memo(GridViewNode);