import streamlit as st
import requests
import os

# Index project files for context
def index_project_files(directory):
    file_context = ""
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.py', '.ts', '.js')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()[:500]  # Limit to first 500 chars
                    file_context += f"File: {file_path}\nContent Snippet: {content}\n\n"
    return file_context

project_dir = os.path.dirname(os.path.abspath(__file__))
project_context = index_project_files(project_dir)

# Load commit history
commit_history = []
if os.path.exists("commit_history.txt"):
    with open("commit_history.txt", "r") as f:
        commit_history = [line.strip() for line in f if line.strip()]

st.title("DevMind Commit Generator")
st.header("Select Feature to Generate Commit Message")

# Feature selection
feature = st.radio("Choose a feature:", ["Agent-Powered Contextual Awareness", "Personalized Debugging Style",
                                        "Full Project Understanding", "Commit Storytelling"])

diff = st.text_area("Enter your code diff", height=200)

if st.button("Generate Commit Message"):
    if not diff:
        st.warning("Please enter a code diff.")
    else:
        try:
            style_hints = " ".join(commit_history) if commit_history else "default style"
            related_files = ["test.py", "main.py", "utils.py"]  # Simulated related files
            file_context = "\n".join([f"File: {f}" for f in related_files])
            bug_patterns = ["error", "bug", "fix", "exception"]

            if feature == "Agent-Powered Contextual Awareness":
                prompt = f"Act as a team of AI agents using blackboxai/nousresearch/hermes-2-pro-llama-3-8b:\nDiff:\n{diff}\nRelated Files:\n{file_context}\n\n- Intent Agent: Determine intent, output: 'Intent: [intent]'.\n- Context Agent: Identify modules, output: 'Modules: [list]'.\n- Review Agent: Suggest reviewers, output: 'Reviewers: [list]'.\nCombine into:\n- Why: [reason based on intent]\n- Modules: [list]\n- Reviewers: [list]\n\nKeep concise."
                model = "blackboxai/nousresearch/hermes-2-pro-llama-3-8b"

            elif feature == "Personalized Debugging Style":
                prompt = f"Analyze diff with personalization using blackboxai/nousresearch/hermes-2-pro-llama-3-8b:\nDiff:\n{diff}\nStyle Hints: {style_hints}\nProvide:\n- Why: [reason, tailored to style]\n- Modules: [affected modules]\n- Reviewers: [e.g., @kartik, @john]\n\nKeep concise."
                if any(pattern in diff.lower() for pattern in bug_patterns):
                    st.warning("Potential bug detected! Tailoring for debugging.")
                    prompt += "\nPrioritize debugging context."
                model = "blackboxai/nousresearch/hermes-2-pro-llama-3-8b"

            elif feature == "Full Project Understanding":
                prompt = f"Analyze diff and project context using blackboxai/meta-llama/llama-4-scout:\nDiff:\n{diff}\nProject Context:\n{project_context}\n\n- Intent Agent: Determine intent, output: 'Intent: [intent]'.\n- Context Agent: Identify modules and cross-file relationships, output: 'Modules: [list]'.\n- Review Agent: Suggest reviewers, output: 'Reviewers: [list]'.\nCombine into:\n- Why: [reason based on intent and context]\n- Modules: [list with relationships]\n- Reviewers: [list]\n\nKeep concise."
                if any(pattern in diff.lower() for pattern in bug_patterns):
                    st.warning("Potential bug detected! Tailoring for debugging.")
                    prompt += "\nPrioritize debugging context."
                model = "blackboxai/meta-llama/llama-4-scout"

            else:  # Commit Storytelling
                prompt = f"Generate a commit story using blackboxai/nousresearch/hermes-2-pro-llama-3-8b:\nDiff:\n{diff}\nProvide:\n- Why: [reason for change]\n- Modules: [affected modules]\n- Reviewers: [e.g., @kartik, @john]\n\nKeep concise."
                model = "blackboxai/nousresearch/hermes-2-pro-llama-3-8b"

            response = requests.post(
                "https://api.blackbox.ai/chat/completions",
                headers={
                    "Authorization": "Bearer sk-8vK21JMn9O2qpxOAKew83Q",  # Replace with your key
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            response.raise_for_status()
            data = response.json()
            if data.get("choices") and data["choices"][0]["message"]["content"]:
                story = data["choices"][0]["message"]["content"].strip()
                st.success(f"{feature} Commit Story:")
                st.code(story, language="text")
            else:
                st.error("No valid response from API")
        except requests.RequestException as e:
            st.error(f"API error: {str(e)}")
        except Exception as e:
            st.error(f"Unexpected error: {str(e)}")

st.markdown("---")
st.write("Generate commit messages with various AI-powered features.")
