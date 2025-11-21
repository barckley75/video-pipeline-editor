# Contributing to Video Pipeline Editor

First off, thanks for taking the time to contribute! 🎉

This project is open to contributions from everyone. Whether you're fixing a bug, adding a feature, improving documentation, or just asking questions — you're welcome here.

## ⏰ A Note on Response Times

I maintain this project in my spare time alongside work and life. I'll do my best to review PRs and respond to issues, but please be patient — it might take a few days (or sometimes longer). 

That said, I genuinely appreciate every contribution and will always get back to you eventually. If something is urgent, ping me on Discord!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Creating a New Node](#creating-a-new-node)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

Be respectful and constructive. We're all here to learn and build something useful together.

## Getting Started

1. **Join our Discord** — [https://discord.gg/PFz3zMT5eq](https://discord.gg/PFz3zMT5eq) — Best place to discuss ideas before coding
2. **Check existing issues** — Someone might already be working on it
3. **Start small** — Good first issues are labeled `good first issue`

## How Can I Contribute?

### 🐛 Reporting Bugs

Open an issue with:
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your OS and version

### 💡 Suggesting Features

Open an issue with:
- Clear description of the feature
- Why it would be useful
- Example use cases

### 🔧 Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push and open a Pull Request

## Development Setup

### Prerequisites

- **Node.js** v18 or higher
- **Rust** (latest stable) — [Install Rust](https://www.rust-lang.org/tools/install)
- **FFmpeg** — Must be installed and in your PATH
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt install ffmpeg`
  - Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/video-pipeline-editor.git
cd video-pipeline-editor

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Useful Commands

```bash
# Run development server (frontend + backend)
npm run tauri dev

# Build for production
npm run tauri build

# Run frontend only (for UI work)
npm run dev

# Type check
npm run build
```

## Project Structure

```
video-pipeline-editor/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Reusable UI components
│   │   ├── BaseNode.tsx      # Base wrapper for all nodes
│   │   ├── NodeUI.tsx        # Node UI primitives (fields, buttons)
│   │   └── layout/           # App layout components
│   ├── nodes/                # Individual node implementations
│   │   ├── InputVideoNode.tsx
│   │   ├── ConvertVideoNode.tsx
│   │   └── ...
│   ├── hooks/                # React hooks
│   │   ├── useNodeManagement.tsx  # Node registry & creation
│   │   ├── usePipeline.tsx        # Pipeline state management
│   │   └── ...
│   ├── constants/
│   │   └── nodeTypes.tsx     # Node definitions & menu config
│   ├── services/             # Business logic
│   │   ├── pipelineExecution.tsx
│   │   └── nodeDataPropagation.tsx
│   └── App.tsx               # Main application component
│
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   ├── lib.rs            # Command exports
│   │   ├── commands/         # Tauri commands (called from frontend)
│   │   ├── services/         # Core processing logic
│   │   └── utils/            # Helper functions
│   └── Cargo.toml
│
├── docs/                     # Documentation
│   └── ADDING_NODES.md       # How to create custom nodes
│
└── package.json
```

## Creating a New Node

**See the detailed guide:** [docs/ADDING_NODES.md](docs/ADDING_NODES.md)

### Quick Overview

Adding a new node requires changes in 3 places:

1. **Create the node component** — `src/nodes/YourNode.tsx`
2. **Register the node type** — `src/constants/nodeTypes.tsx`
3. **Add to node registry** — `src/hooks/useNodeManagement.tsx`
4. **(If needed) Add Rust backend** — `src-tauri/src/commands/`

## Pull Request Process

1. **Update documentation** if you're adding features
2. **Test your changes** thoroughly
3. **Keep PRs focused** — One feature/fix per PR
4. **Write clear commit messages**:
   ```
   feat: add blur filter node
   fix: handle empty file paths in InputNode
   docs: update node creation guide
   ```
5. **Reference related issues** in your PR description

### PR Title Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `style:` Formatting, styling
- `test:` Adding tests

## Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use TypeScript strict mode
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

### Rust

- Follow Rust naming conventions
- Use `Result` for error handling
- Document public functions

### Commits

- Use present tense ("Add feature" not "Added feature")
- Keep first line under 72 characters
- Reference issues when applicable

## Questions?

- **Discord** — [Join here](https://discord.gg/PFz3zMT5ex) — Best for discussions
- **GitHub Issues** — For bugs and feature requests
- **GitHub Discussions** — For broader topics

---

Thanks for contributing! Every bit helps make this project better. 🚀