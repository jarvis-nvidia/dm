import streamlit as st
import requests
import os

st.title("DevMind Commit Generator")
st.header("Generate Personalized Commit Message")

# Load commit history
commit_history = []
if os.path.exists("commit_history.txt"):
    with open("commit_history.txt", "r") as f:
        commit_history = [line.strip() for line in f if line.strip()]

diff = st.text_area("Enter your code diff", height=200)
if st.button("Generate Personalized Commit Message"):
    if not diff:
        st.warning("Please enter a code diff.")
    else:
        try:
            # Analyze commit history for style (e.g., common keywords)
            style_hints = " ".join(commit_history) if commit_history else "default style"
            prompt = f"Analyze this code diff:\nDiff:\n{diff}\n\nBased on this commit history style: {style_hints}\nProvide a structured commit message story in this exact format:\n- Why: [reason for change, tailored to user style]\n- Modules: [list of affected modules based on file names]\n- Reviewers: [suggested reviewers, e.g., @kartik, @john]\n\nKeep responses concise."

            # Detect bug patterns
            bug_patterns = ["error", "bug", "fix", "exception"]  # Expand with more patterns as needed
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
                    "model": "blackboxai/mistralai/mistral-small-24b-instruct-2501:free",
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            response.raise_for_status()
            data = response.json()
            if data.get("choices") and data["choices"][0]["message"]["content"]:
                story = data["choices"][0]["message"]["content"].strip()
                st.success("Personalized Commit Story:")
                st.code(story, language="text")
            else:
                st.error("No valid response from API")
        except requests.RequestException as e:
            st.error(f"API error: {str(e)}")
        except Exception as e:
            st.error(f"Unexpected error: {str(e)}")

st.markdown("---")
st.write("Generate tailored commit messages with personalized insights.")
