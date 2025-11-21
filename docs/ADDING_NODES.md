# Adding Custom Nodes

This guide walks you through creating a new node for the Video Pipeline Editor. By the end, you'll understand the architecture and be able to build your own processing nodes.

## Table of Contents

- [Overview](#overview)
- [Quick Start (5-minute version)](#quick-start)
- [Step-by-Step Guide](#step-by-step-guide)
- [Node Anatomy](#node-anatomy)
- [Handle Types](#handle-types)
- [Adding Backend Processing](#adding-backend-processing)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

A node in this editor consists of:

1. **React Component** — The visual UI (`src/nodes/YourNode.tsx`)
2. **Type Registration** — Menu entry and defaults (`src/constants/nodeTypes.tsx`)
3. **Hook Registration** — Connect component to React Flow (`src/hooks/useNodeManagement.tsx`)
4. **(Optional) Rust Backend** — For heavy processing (`src-tauri/src/commands/`)

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Input Node  │────▶│ Process Node│────▶│ Output Node │
│ (file path) │     │ (transform) │     │ (display)   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      └────────────────────┴───────────────────┘
                           │
                    Data propagates
                    through edges
```

## Quick Start

Here's the minimal code to create a new node:

### 1. Create the Component

```tsx
// src/nodes/MyCustomNode.tsx
import React, { memo } from 'react';
import BaseNode from '../components/BaseNode';
import { NodeField } from '../components/NodeUI';

interface MyCustomData {
  inputPath?: string;
  setting: string;
}

interface MyCustomNodeProps {
  id: string;
  data: MyCustomData;
  isConnectable: boolean;
  onDataUpdate?: (nodeId: string, newData: Partial<MyCustomData>) => void;
}

const MyCustomNode: React.FC<MyCustomNodeProps> = ({ id, data, isConnectable, onDataUpdate }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="process"           // Color theme
      title="MY_CUSTOM_NODE"    // Display title
      hasInput={true}           // Left handle
      hasOutput={true}          // Right handle
    >
      <NodeField label="Setting">
        <input
          value={data.setting || ''}
          onChange={(e) => onDataUpdate?.(id, { setting: e.target.value })}
        />
      </NodeField>
    </BaseNode>
  );
};

export default memo(MyCustomNode);
```

### 2. Register the Type

```tsx
// src/constants/nodeTypes.tsx

// Add to NODE_TYPES object:
export const NODE_TYPES = {
  // ... existing types
  MY_CUSTOM: 'myCustom',
} as const;

// Add to NODE_MENU_ITEMS array:
export const NODE_MENU_ITEMS = [
  // ... existing items
  {
    id: 'my_custom',
    type: NODE_TYPES.MY_CUSTOM,
    label: 'MY_CUSTOM_NODE',
    color: 'rgba(139, 92, 246, 0.2)',      // Purple background
    borderColor: 'rgba(139, 92, 246, 0.5)',
    hoverColor: 'rgba(139, 92, 246, 0.3)',
    defaultData: { setting: 'default' }
  },
];
```

### 3. Register the Component

```tsx
// src/hooks/useNodeManagement.tsx

// Add import at top:
import MyCustomNode from '../nodes/MyCustomNode';

// Add to nodeTypes object in useMemo:
const nodeTypes = useMemo(() => ({
  // ... existing registrations
  [NODE_TYPES.MY_CUSTOM]: (props: any) => <MyCustomNode {...props} onDataUpdate={updateNodeData} />,
}), [updateNodeData]);
```

**Done!** Your node will now appear in the node menu.

## Step-by-Step Guide

### Step 1: Plan Your Node

Before coding, answer these questions:

- **What does this node do?** (e.g., "Applies blur filter to video")
- **What inputs does it need?** (e.g., video path, blur intensity)
- **What outputs does it produce?** (e.g., processed video path)
- **Does it need Rust backend?** (Heavy processing = yes)

### Step 2: Create the Data Interface

Define what data your node stores:

```tsx
interface BlurFilterData {
  // Input from connected nodes
  videoPath?: string;
  
  // User-configurable settings
  blurRadius: number;
  blurType: 'gaussian' | 'box' | 'motion';
  
  // Output (set after processing)
  outputPath?: string;
  status?: 'idle' | 'processing' | 'done' | 'error';
}
```

### Step 3: Build the UI

Use the provided UI components from `NodeUI.tsx`:

```tsx
import { NodeField, NodeButton, NodeInfo, NodeSelect } from '../components/NodeUI';

// Inside your component:
<BaseNode {...props}>
  {/* Dropdown select */}
  <NodeField label="Blur Type">
    <NodeSelect
      value={data.blurType}
      onChange={(e) => onDataUpdate?.(id, { blurType: e.target.value })}
      options={[
        { value: 'gaussian', label: 'Gaussian' },
        { value: 'box', label: 'Box' },
        { value: 'motion', label: 'Motion' },
      ]}
    />
  </NodeField>
  
  {/* Number input */}
  <NodeField label="Radius">
    <input
      type="number"
      min={1}
      max={100}
      value={data.blurRadius}
      onChange={(e) => onDataUpdate?.(id, { blurRadius: Number(e.target.value) })}
    />
  </NodeField>
  
  {/* Action button */}
  <NodeButton
    onClick={handleProcess}
    disabled={!data.videoPath}
  >
    Apply Blur
  </NodeButton>
  
  {/* Status info at bottom */}
  <NodeInfo>
    status: {data.status || 'idle'}
  </NodeInfo>
</BaseNode>
```

### Step 4: Handle Data Updates

The `onDataUpdate` callback syncs your node's state with the pipeline:

```tsx
const handleSettingChange = (newValue: string) => {
  // This updates the node data AND triggers data propagation
  onDataUpdate?.(id, { setting: newValue });
};
```

### Step 5: Receive Data from Connected Nodes

Data flows automatically through edges. Your node receives input via `data` prop:

```tsx
// If an InputVideoNode is connected to your node,
// data.videoPath will contain the selected file path
useEffect(() => {
  if (data.videoPath) {
    console.log('Received video:', data.videoPath);
    // Do something with the input
  }
}, [data.videoPath]);
```

## Node Anatomy

### BaseNode Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique node identifier |
| `data` | object | Node's data state |
| `isConnectable` | boolean | Whether handles accept connections |
| `theme` | string | Color theme: `'input'`, `'process'`, `'output'`, `'analysis'`, `'trim'` |
| `title` | string | Display title in header |
| `hasInput` | boolean | Show left input handle |
| `hasOutput` | boolean | Show right output handle |
| `hasDataOutput` | boolean | Show data-only output (cyan color) |

### Available Themes

```tsx
// In BaseNode, themes map to colors:
'input'    → green (#10b981)
'process'  → blue (#3b82f6)
'output'   → purple (#a855f7)
'analysis' → pink (#ec4899)
'trim'     → amber (#f59e0b)
```

## Handle Types

Handles are the connection points on nodes:

```tsx
<BaseNode
  hasInput={true}       // Orange handle on left (video/audio input)
  hasOutput={true}      // Orange handle on right (video/audio output)
  hasDataOutput={true}  // Cyan handle (data only, like trim parameters)
>
```

### Connection Rules

The editor validates connections based on handle types. See `FlowCanvas.tsx` for validation logic.

## Adding Backend Processing

For heavy processing (FFmpeg operations, etc.), add a Rust command:

### 1. Create the Rust Command

```rust
// src-tauri/src/commands/blur_filter.rs
use tauri::command;

#[command]
pub async fn apply_blur_filter(
    input_path: String,
    output_path: String,
    blur_radius: u32,
    blur_type: String,
) -> Result<String, String> {
    // Your FFmpeg logic here
    Ok(output_path)
}
```

### 2. Export the Command

```rust
// src-tauri/src/lib.rs
mod commands;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... existing commands
            commands::blur_filter::apply_blur_filter,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. Call from Frontend

```tsx
import { invoke } from '@tauri-apps/api/core';

const handleProcess = async () => {
  onDataUpdate?.(id, { status: 'processing' });
  
  try {
    const result = await invoke('apply_blur_filter', {
      inputPath: data.videoPath,
      outputPath: `/tmp/blurred_${Date.now()}.mp4`,
      blurRadius: data.blurRadius,
      blurType: data.blurType,
    });
    
    onDataUpdate?.(id, { 
      status: 'done',
      outputPath: result 
    });
  } catch (error) {
    onDataUpdate?.(id, { status: 'error' });
    console.error(error);
  }
};
```

## Examples

### Simple Display Node

A node that just displays information:

```tsx
const InfoDisplayNode = ({ id, data, isConnectable }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      theme="output"
      title="INFO_DISPLAY"
      hasInput={true}
      hasOutput={false}
    >
      <NodeField>
        <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)' }}>
          {data.info || 'No data connected'}
        </div>
      </NodeField>
    </BaseNode>
  );
};
```

### Processing Node with Progress

```tsx
const ProcessingNode = ({ id, data, isConnectable, onDataUpdate }) => {
  const [progress, setProgress] = useState(0);
  
  const handleProcess = async () => {
    onDataUpdate?.(id, { status: 'processing' });
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }
    
    onDataUpdate?.(id, { status: 'done' });
  };
  
  return (
    <BaseNode {...props}>
      <NodeField>
        <div style={{ 
          width: `${progress}%`, 
          height: '4px', 
          background: '#10b981' 
        }} />
      </NodeField>
      <NodeButton onClick={handleProcess}>
        Process
      </NodeButton>
    </BaseNode>
  );
};
```

## Troubleshooting

### Node doesn't appear in menu

- Check `NODE_TYPES` constant is exported
- Check `NODE_MENU_ITEMS` includes your node
- Verify the `id` in menu items is unique

### Data not flowing between nodes

- Ensure `hasOutput={true}` on source node
- Ensure `hasInput={true}` on target node
- Check connection validation in `FlowCanvas.tsx`

### Rust command not found

- Verify function has `#[command]` attribute
- Check it's added to `invoke_handler!`
- Restart `npm run tauri dev`

### Node renders but doesn't update

- Make sure you're calling `onDataUpdate?.(id, {...})`
- Check if component is wrapped in `memo()` (it should be)
- Verify data interface matches what you're passing

## Need Help?

- Check existing node implementations in `src/nodes/`
- Ask in our Discord community
- Open a GitHub issue

---

Happy coding! 🚀
