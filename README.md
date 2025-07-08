# DevMind: AI Debugging & Review Assistant

## Overview
DevMind is an intelligent, agent-powered developer assistant designed to transform how developers debug, review, and document code. This hackathon submission showcases key features with a focus on the Streamlit dashboard, with ongoing work on the VS Code extension.

## Features
- **Agent-Powered Contextual Awareness**: Uses "blackboxai/nousresearch/hermes-2-pro-llama-3-8b" for multi-agent reasoning (implemented in dashboard).
- **Personalized Debugging Style**: Uses "blackboxai/nousresearch/hermes-2-pro-llama-3-8b" with commit history and bug detection (implemented).
- **Full Project Understanding**: Uses "blackboxai/meta-llama/llama-4-scout" for cross-file context with file indexing (implemented); RAG and vector DB planned.
- **Commit Storytelling**: Uses "blackboxai/nousresearch/hermes-2-pro-llama-3-8b" for structured messages (implemented).
- **Multi-Platform Experience**: Functional Streamlit dashboard; VS Code extension build succeeds, command registration in progress.

## Current Status
- **Dashboard**: Fully operational at `http://localhost:8501` with all features selectable.
- **VS Code Extension**: Build succeeds, but command registration pending (90% complete).
- **Full Project Understanding**: Basic file indexing with "blackboxai/meta-llama/llama-4-scout"; advanced RAG and vector DB are future work.
## How to Run
- **Dashboard**:
  1. Navigate to `~/Downloads/DevMind`.
  2. Activate the virtual environment: `source venv/bin/activate`.
  3. Run: `streamlit run dashboard.py`.
- **Extension**:
  1. Navigate to `~/Downloads/DevMind/devmind`.
  2. Build: `npm run package`.
  3. Launch in VS Code: Open the folder, press `F5` (command TBD).

## Demo
- Screenshot or record a demo of the dashboard generating a personalized commit story (e.g., with a bug-related diff).
- Include in your submission to highlight functionality.

## Acknowledgments
- Built with xAI’s guidance and BLACKBOX.AI for AI insights.
