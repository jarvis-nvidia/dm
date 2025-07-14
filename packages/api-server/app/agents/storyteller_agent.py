"""Storyteller agent for generating commit messages and code narratives with M2 Mac optimization."""
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
import logging
import time
import gc

logger = logging.getLogger(__name__)

class StorytellerAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_message = """You are DevMind's Storyteller Agent, an expert at creating meaningful commit messages and code narratives.
Your task is to analyze code changes and craft descriptive, informative messages that explain the WHY behind the changes.
Follow conventional commit format (type: description) when appropriate.
Focus on clarity, context, and explaining the developer's intent rather than just listing what files were changed."""

    @property
    def agent_name(self) -> str:
        return "storyteller_agent"

    @property
    def agent_description(self) -> str:
        return "Generates meaningful commit messages and code narratives for changes."

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a commit message generation request with memory optimization."""
        start_time = time.time()

        try:
            # Extract input parameters
            code_diff = input_data.get("code_diff", "")
            file_paths = input_data.get("file_paths", [])
            repository = input_data.get("repository", "")
            message_type = input_data.get("message_type", "commit")  # commit, pr_title, pr_description

            # Validate required inputs
            if not code_diff:
                return {
                    "success": False,
                    "message": "Code diff is required",
                    "data": None
                }

            # Limit diff size to prevent memory issues
            if len(code_diff) > 12000:  # 12KB limit
                logger.warning(f"Code diff truncated from {len(code_diff)} chars")
                code_diff = code_diff[:12000] + "\n... [diff truncated for memory optimization]"

            # Build the prompt based on message type
            if message_type == "commit":
                prompt = self._build_commit_prompt(code_diff, file_paths, repository)
                temp = 0.4  # More creative for commit messages
            elif message_type == "pr_title":
                prompt = self._build_pr_title_prompt(code_diff, file_paths, repository)
                temp = 0.5  # More creative for PR titles
            elif message_type == "pr_description":
                prompt = self._build_pr_description_prompt(code_diff, file_paths, repository)
                temp = 0.3  # More factual for PR descriptions
            else:
                prompt = self._build_commit_prompt(code_diff, file_paths, repository)
                temp = 0.4

            # Search for relevant code context if repository is provided
            context_results = []
            if repository and file_paths:
                # Build a focused search query based on the changed files
                search_files = file_paths[:3]  # Limit to first 3 files for efficiency
                search_query = f"code in {' '.join(search_files)}"

                context_results = await self.search_code_context(
                    query=search_query,
                    repo_filter=repository,
                    n_results=3,
                    # Limit context to avoid memory issues
                    max_length=4000
                )

            # Generate the storyteller response
            if context_results:
                response = await self.generate_response(prompt, context_results, temperature=temp)
            else:
                response = await self.generate_response(prompt, temperature=temp)

            # Extract and format the response
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Clean up memory
            gc.collect()

            process_time = time.time() - start_time
            logger.info(f"Storyteller request processed in {process_time:.2f}s for type: {message_type}")

            return {
                "success": True,
                "message": f"{message_type.replace('_', ' ').title()} generation completed",
                "data": {
                    "message": content,
                    "context_used": bool(context_results),
                    "processing_time": f"{process_time:.2f}s"
                }
            }

        except Exception as e:
            logger.error(f"Error in storyteller agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing {input_data.get('message_type', 'commit')} message request: {str(e)}",
                "data": None
            }

    def _build_commit_prompt(self, code_diff: str, file_paths: List[str], repository: str) -> str:
        """Build a prompt for generating a commit message."""
        files_info = "\n".join(file_paths[:10]) if file_paths else "No file paths provided"
        if len(file_paths) > 10:
            files_info += f"\n... and {len(file_paths) - 10} more files"

        return f"""
I need a meaningful commit message for the following code changes.
{f"Repository: {repository}" if repository else ""}

Changed Files:
{files_info}

Code Changes:
```diff
{code_diff}

Please create a commit message that:
1. Has a clear, concise subject line (50-72 chars)
2. Explains WHY the change was made, not just WHAT was changed
3. Mentions any important technical details
4. Follows the conventional commits format (type: description)
5. References related issues or tickets if identifiable from the context

Generate only the commit message text without any additional explanation.
"""

    def _build_pr_title_prompt(self, code_diff: str, file_paths: List[str], repository: str) -> str:
        """Build a prompt for generating a PR title."""
        files_info = "\n".join(file_paths[:5]) if file_paths else "No file paths provided"
        if len(file_paths) > 5:
            files_info += f"\n... and {len(file_paths) - 5} more files"

        # Use a smaller diff sample for PR title
        diff_preview = code_diff[:3000] + "..." if len(code_diff) > 3000 else code_diff

        return f"""
I need a meaningful PR title for the following code changes.
{f"Repository: {repository}" if repository else ""}

Changed Files:
{files_info}

Code Changes (sample):
```diff
{diff_preview}
```

Please create a PR title that:
1. Is clear and concise (max 100 chars)
2. Summarizes the purpose of the changes
3. Follows format: [Type] Short description
   (Types: Feature, Fix, Refactor, Docs, Test, etc.)
4. References related issues if identifiable from context

Generate only the PR title without any additional explanation.
"""

    def _build_pr_description_prompt(self, code_diff: str, file_paths: List[str], repository: str) -> str:
        """Build a prompt for generating a PR description."""
        files_info = "\n".join(file_paths[:8]) if file_paths else "No file paths provided"
        if len(file_paths) > 8:
            files_info += f"\n... and {len(file_paths) - 8} more files"

        # Use a smaller diff sample for PR description
        diff_preview = code_diff[:6000] + "..." if len(code_diff) > 6000 else code_diff

        return f"""
I need a detailed PR description for the following code changes.
{f"Repository: {repository}" if repository else ""}

Changed Files:
{files_info}

Code Changes (sample):
```diff
{diff_preview}
```

Please create a PR description that includes:
1. A summary of the changes
2. The purpose and background of these changes
3. Implementation details that reviewers should know
4. Testing performed
5. Any related issues or documentation
6. Areas that need special review attention

Format the description in markdown with appropriate sections.
"""

# Initialize the storyteller agent
storyteller_agent = StorytellerAgent()
