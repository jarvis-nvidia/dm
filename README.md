# DevMind: AI Debugging & Review Assistant

## Overview
DevMind is an intelligent, agent-powered developer assistant designed to transform how developers debug, review, and document code. This hackathon submission showcases key features with a focus on the Streamlit dashboard, with ongoing work on the VS Code extension.

## Features
- **Commit Storytelling**: Generates structured commit messages with reason, affected modules, and reviewers (fully implemented in the Streamlit dashboard).
- **Personalized Debugging Style**: Learns from commit history and detects bug patterns to tailor suggestions (e.g., prioritizes debugging when bugs are detected), implemented in the dashboard.
- **Multi-Platform Experience**: Functional Streamlit web dashboard; VS Code extension build succeeds, with command registration in progress.
- **Contextual Awareness**: Analyzes code diffs and related files (working via dashboard API integration).
- **Model Used**: "blackboxai/nousresearch/hermes-2-pro-llama-3-8b" for enhanced reasoning and personalization.
## Current Status
- **Dashboard**: Fully operational at `http://localhost:8501`. Test with a diff (e.g., `+if error: pass`) to see personalized debugging in action.
- **VS Code Extension**: Build process works (`npm run package`), but the `DevMind: Generate Commit` command isn’t yet visible in the debug environment due to configuration issues. This is a work in progress.
- **Planned Enhancements**: Agent-powered reasoning (Coral/Fetch), full project understanding (RAG + vector DB), and extension completion.

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
