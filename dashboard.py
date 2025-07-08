import streamlit as st
import requests
import os

st.title("DevMind Commit Generator")
st.header("Generate Agent-Powered Commit Message")

# Load commit history
commit_history = []
if os.path.exists("commit_history.txt"):
    with open("commit_history.txt", "r") as f:
        commit_history = [line.strip() for line in f if line.strip()]

# Simulate related files (agent file analysis)
related_files = ["test.py", "main.py", "utils.py"]  # Expand with actual workspace files later
file_context = "\n".join([f"File: {f}" for f in related_files])

diff = st.text_area("Enter your code diff", height=200)
if st.button("Generate Agent-Powered Commit Message"):
    if not diff:
        st.warning("Please enter a code diff.")
    else:
        try:
            # Analyze commit history for style (e.g., common keywords)
            style_hints = " ".join(commit_history) if commit_history else "default style"
            prompt = f"Act as a team of AI agents analyzing this code diff and related files:\nDiff:\n{diff}\nRelated Files:\n{file_context}\n\n- Intent Agent: Determine the intent (e.g., bug fix, feature) and output: 'Intent: [intent]'.\n- Context Agent: Identify affected modules and output: 'Modules: [list]'.\n- Review Agent: Suggest reviewers and output: 'Reviewers: [list]'.\nCombine results into a structured commit message story:\n- Why: [reason based on intent]\n- Modules: [list from Context Agent]\n- Reviewers: [list from Review Agent]\n\nKeep responses concise and reflect multi-agent reasoning."

            # Detect bug patterns
            bug_patterns = ["error", "bug", "fix", "exception"]
            if any(pattern in diff.lower() for pattern in bug_patterns):
                st.warning("Potential bug detected! Tailoring suggestion for debugging.")
                prompt += "\nPrioritize debugging context due to bug detection."

            response = requests.post(
                "https://api.blackbox.ai/chat/completions",
                headers={
                    "Authorization": "Bearer sk-8vK21JMn9O2qpxOAKew83Q",  # Replace with your actual API key
                    "Content-Type": "application/json"
                },
                json={
                    "model": "blackboxai/nousresearch/hermes-2-pro-llama-3-8b",  # Updated model
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            response.raise_for_status()
            data = response.json()
            if data.get("choices") and data["choices"][0]["message"]["content"]:
                story = data["choices"][0]["message"]["content"].strip()
                st.success("Agent-Powered Commit Story:")
                st.code(story, language="text")
            else:
                st.error("No valid response from API")
        except requests.RequestException as e:
            st.error(f"API error: {str(e)}")
        except Exception as e:
            st.error(f"Unexpected error: {str(e)}")

st.markdown("---")
st.write("Generate commit messages with agent-powered contextual insights.")
