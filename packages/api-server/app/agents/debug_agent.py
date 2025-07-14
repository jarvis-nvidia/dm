"""Debug agent for analyzing and fixing code issues with memory optimization for M2 Mac."""
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
import logging
import json
import time
import gc

logger = logging.getLogger(__name__)

class DebugAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.system_message = """You are DevMind's Debug Agent, an expert at analyzing code issues.
Your task is to understand code problems, identify their root causes, and suggest fixes.
You should explain your reasoning clearly and provide detailed, actionable solutions.
When providing code fixes, make sure they are complete and correct.
Focus on the most likely cause of the issue rather than listing all possibilities."""

    @property
    def agent_name(self) -> str:
        return "debug_agent"

    @property
    def agent_description(self) -> str:
        return "Analyzes and debugs code issues, identifying root causes and suggesting fixes."

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a debugging request with memory optimization."""
        start_time = time.time()

        try:
            # Extract input parameters
            problem_description = input_data.get("problem_description", "")
            code_snippet = input_data.get("code_snippet", "")
            error_message = input_data.get("error_message", "")
            repository = input_data.get("repository", "")
            file_path = input_data.get("file_path", "")
            language = input_data.get("language", "")

            # Validate required inputs
            if not problem_description:
                return {
                    "success": False,
                    "message": "Problem description is required",
                    "data": None
                }

            # Limit input sizes to prevent memory issues
            if len(code_snippet) > 10000:  # ~10KB limit
                logger.warning(f"Code snippet truncated from {len(code_snippet)} chars")
                code_snippet = code_snippet[:10000] + "\n... [truncated for memory optimization]"

            if len(error_message) > 2000:
                logger.warning(f"Error message truncated from {len(error_message)} chars")
                error_message = error_message[:2000] + "\n... [truncated for memory optimization]"

            # Build the debugging prompt
            prompt = f"""
Debug Request: {problem_description}

{f"Error Message: {error_message}" if error_message else ""}

{f"Code Snippet:\n```{language}\n{code_snippet}\n```" if code_snippet else ""}

{f"File: {file_path}" if file_path else ""}
{f"Repository: {repository}" if repository else ""}
{f"Language: {language}" if language else ""}

Please analyze this issue and provide:
1. The root cause of the problem
2. A detailed explanation of what's happening
3. A solution with fixed code
4. Any additional recommendations to prevent similar issues
"""

            # Search for relevant code context if repository is provided
            context_results = []
            if repository:
                search_query = f"{problem_description} {error_message}".strip()
                context_results = await self.search_code_context(
                    query=search_query,
                    repo_filter=repository,
                    n_results=3,
                    # Limit context to avoid memory issues
                    max_length=5000
                )

            # Generate the debugging response
            if context_results:
                response = await self.generate_response(prompt, context_results, temperature=0.2)
            else:
                response = await self.generate_response(prompt, temperature=0.2)

            # Extract and format the response
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Clean up memory
            gc.collect()

            process_time = time.time() - start_time
            logger.info(f"Debug request processed in {process_time:.2f}s")

            return {
                "success": True,
                "message": "Debug analysis completed",
                "data": {
                    "analysis": content,
                    "context_used": bool(context_results),
                    "processing_time": f"{process_time:.2f}s"
                }
            }

        except Exception as e:
            logger.error(f"Error in debug agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing debug request: {str(e)}",
                "data": None
            }

# Initialize the debug agent
debug_agent = DebugAgent()
