# Video Pipeline Editor

> A visual node-based video processing pipeline editor built with Rust and React

**Because your video tools should look as good as your videos.** 🎬✨

[![Watch Demo](https://img.youtube.com/vi/cacRipkIfvI/maxresdefault.jpg)](https://youtu.be/cacRipkIfvI)

▶️ *Click to watch demo*

## 🎯 Why This Project?

Traditional video processing requires writing complex FFmpeg commands or using heavyweight video editing software. **Video Pipeline Editor** provides a visual, node-based interface where you can:

- **Build reusable workflows** — Create complex pipelines once, save them, and reuse them across projects
- **Visual pipeline design** — Connect nodes intuitively instead of memorizing command-line syntax
- **Advanced analysis tools** — Built-in VMAF quality analysis and audio spectrum visualization
- **Fast and lightweight** — Powered by Rust/Tauri backend with native performance
- **Cyberpunk aesthetics** — When was the last time a professional tool made you feel like a hacker in a sci-fi movie? 😎

> *"I came for the FFmpeg automation, I stayed for the neon glow."* — Probably you, soon

Perfect for video engineers, content creators, researchers, and anyone who wants their tools to spark joy while getting work done.

## ✨ Features

### Current Capabilities

**Video Processing**
- Video format conversion (MP4, AVI, MOV, etc.)
- Trimming and cutting
- Frame extraction for sequence analysis
- VMAF quality analysis (compare video quality objectively)
- Video metadata inspection

**Audio Processing**
- Audio format conversion
- Audio trimming
- Spectrum analysis with real-time visualization
- Audio metadata inspection

**Workflow Management**
- Save and load pipeline configurations
- Visual node-based editor powered by React Flow
- Connect nodes to create complex processing chains
- Reusable workflow templates

### Available Nodes

- `Input Video/Audio` - Load media files
- `Convert Video/Audio` - Format conversion
- `Trim Video/Audio` - Cut segments
- `Info Video/Audio` - Extract metadata
- `Spectrum Analyzer` - Visualize audio frequencies
- `VMAF Analysis` - Measure video quality
- `Frame Extraction` - Export video frames
- `Grid View` - Compare multiple videos side-by-side

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [FFmpeg](https://ffmpeg.org/download.html) - Must be installed and available in PATH

### Installation

```bash
# Clone the repository
git clone https://github.com/barckley75/video-pipeline-editor.git
cd video-pipeline-editor

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Building for Production

```bash
# Build the application
npm run tauri build

# Outputs will be in src-tauri/target/release/bundle/
```

## 🎮 Quick Start Guide

1. **Add Input Node** - Right-click canvas → Select "Input Video" or "Input Audio"
2. **Select File** - Click the input node and choose your media file
3. **Add Processing Nodes** - Add conversion, trimming, or analysis nodes
4. **Connect Nodes** - Drag from output handles to input handles
5. **Execute Pipeline** - Click "Run Pipeline" in the toolbar
6. **Save Workflow** - Save your pipeline for future reuse

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: React Flow (node editor) + Tailwind CSS
- **Backend**: Rust + Tauri
- **Processing**: FFmpeg (via Rust bindings)
- **Build**: Tauri v2

## 🗺️ Roadmap

We're actively looking for contributors! Here are planned features:

### High Priority
- [ ] Drag-and-drop file support
- [ ] Batch processing (multiple files at once)
- [ ] Real-time progress feedback
- [ ] More video filters (blur, sharpen, color correction)

### Future Ideas
- [ ] AI-powered transcription node
- [ ] Subtitle generation and editing
- [ ] Video stabilization
- [ ] Object detection/tracking
- [ ] Cloud rendering support
- [ ] Plugin system for custom nodes

## 🤝 Contributing

We're building a community around this project! 

**Join our Discord**: [Link Coming Soon]

### How to Contribute

1. Check out the [Issues](../../issues) page
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Make your changes
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed development guidelines.

## 📝 Adding Custom Nodes

Want to add your own processing node? Check out the [Node Development Guide](docs/ADDING_NODES.md) — a comprehensive tutorial with examples.

## 🐛 Known Issues

- VMAF analysis requires reference video and can be slow for large files
- Some FFmpeg operations don't show real-time progress yet
- Grid view is limited to 4 videos currently

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) for cross-platform desktop apps
- Powered by [FFmpeg](https://ffmpeg.org/) for media processing
- Node editor using [React Flow](https://reactflow.dev/)
- VMAF implementation by Netflix

## 📧 Contact

**GitHub**: [@barckley75](https://github.com/barckley75)

**Discord Community**: [Join us!] (Coming soon)

---

⭐ Star this project if you find it useful! It helps others discover it.