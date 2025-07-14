"""Review agent for analyzing code changes with memory optimization for M2 Mac."""
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
import logging
import time
import gc

logger = logging.getLogger(__name__)

class ReviewAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_message = """You are DevMind's Review Agent, an expert at analyzing code changes.
Your task is to review code changes, identify potential issues, and provide constructive feedback.
You should consider code quality, performance, security, and maintainability in your reviews.
Be specific in your feedback and provide actionable suggestions for improvement.
Focus on the most important issues rather than minor style preferences."""

    @property
    def agent_name(self) -> str:
        return "review_agent"

    @property
    def agent_description(self) -> str:
        return "Reviews code changes and provides detailed feedback and suggestions."

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a code review request with memory optimization."""
        start_time = time.time()

        try:
            # Extract input parameters
            code_diff = input_data.get("code_diff", "")
            file_path = input_data.get("file_path", "")
            repository = input_data.get("repository", "")
            pr_title = input_data.get("pr_title", "")
            pr_description = input_data.get("pr_description", "")
            language = input_data.get("language", "")

            # Validate required inputs
            if not code_diff and not (repository and file_path):
                return {
                    "success": False,
                    "message": "Either code_diff or both repository and file_path are required",
                    "data": None
                }

            # Limit diff size to prevent memory issues
            if len(code_diff) > 15000:  # ~15KB limit
                logger.warning(f"Code diff truncated from {len(code_diff)} chars")
                code_diff = code_diff[:15000] + "\n... [diff truncated for memory optimization]"

            # Build the review prompt
            prompt = f"""
Code Review Request:
{f"PR Title: {pr_title}" if pr_title else ""}
{f"PR Description: {pr_description}" if pr_description else ""}
{f"File: {file_path}" if file_path else ""}
{f"Repository: {repository}" if repository else ""}
{f"Language: {language}" if language else ""}

Code Changes:
```diff
{code_diff}
Please review these changes and provide:
1. A summary of the changes and their purpose
2. Potential issues or bugs
3. Code quality feedback (readability, maintainability, etc.)
4. Performance considerations
5. Security considerations (if applicable)
6. Specific suggestions for improvement
7. Overall assessment
"""
    # Search for relevant code context if repository is provided
            context_results = []
            if repository and file_path:
                search_query = f"code in {file_path}"
                context_results = await self.search_code_context(
                    query=search_query,
                    repo_filter=repository,
                    n_results=3,
                    # Limit context to avoid memory issues
                    max_length=5000
                )

            # Generate the review response
            if context_results:
                response = await self.generate_response(prompt, context_results, temperature=0.3)
            else:
                response = await self.generate_response(prompt, temperature=0.3)

            # Extract and format the response
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Clean up memory
            gc.collect()

            process_time = time.time() - start_time
            logger.info(f"Review request processed in {process_time:.2f}s")

            return {
                "success": True,
                "message": "Code review completed",
                "data": {
                    "review": content,
                    "context_used": bool(context_results),
                    "processing_time": f"{process_time:.2f}s"
                }
            }

        except Exception as e:
            logger.error(f"Error in review agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing review request: {str(e)}",
                "data": None
            }
review_agent = ReviewAgent()
