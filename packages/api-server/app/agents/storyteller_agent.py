"""Storyteller agent for generating commit messages and PR descriptions."""
import logging
from typing import Dict, Any, Optional
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class StorytellerAgent:
    def __init__(self):
        self.system_prompts = {
            "commit": """You are an expert software developer and storyteller. Your job is to create compelling, informative commit messages that tell the story of code changes.

Given a code diff, analyze the changes and generate a commit message that:
1. Follows conventional commit format (type(scope): description)
2. Clearly explains WHAT was changed and WHY
3. Uses present tense, imperative mood
4. Is concise but descriptive
5. Mentions affected modules/components

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build

Examples:
- feat(auth): add JWT token validation middleware
- fix(api): resolve race condition in user session handling
- refactor(components): extract reusable form validation logic""",

            "pr_title": """You are an expert at creating clear, descriptive pull request titles.

Given a code diff, create a PR title that:
1. Summarizes the main change or feature
2. Is clear and concise (50-80 characters)
3. Uses present tense, imperative mood
4. Indicates the scope/area affected

Examples:
- Add user authentication with JWT tokens
- Fix memory leak in file upload component
- Refactor database connection pooling""",

            "pr_description": """You are an expert at writing comprehensive pull request descriptions.

Given a code diff, create a PR description that includes:
1. ## Summary - Brief overview of changes
2. ## Changes Made - Detailed list of modifications
3. ## Testing - How the changes were tested
4. ## Breaking Changes - Any breaking changes (if applicable)
5. ## Related Issues - Any related issues or tickets

Be thorough but concise. Use bullet points and clear formatting."""
        }

    async def process(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process storyteller request and generate appropriate message."""
        try:
            code_diff = request.get("code_diff", "")
            message_type = request.get("message_type", "commit")
            file_paths = request.get("file_paths", [])
            repository = request.get("repository", "")

            if not code_diff:
                return {
                    "success": False,
                    "message": "Code diff is required",
                    "data": None
                }

            # Build context from the request
            context = self._build_context(code_diff, file_paths, repository)
            
            # Get system prompt based on message type
            system_prompt = self.system_prompts.get(message_type, self.system_prompts["commit"])
            
            # Create user prompt
            user_prompt = self._create_user_prompt(context, message_type)
            
            # Generate response using LLM
            response = await llm_service.generate_completion(
                prompt=user_prompt,
                system_message=system_prompt,
                temperature=0.3
            )
            
            # Extract generated content
            if response and "choices" in response and response["choices"]:
                generated_message = response["choices"][0]["message"]["content"].strip()
                
                return {
                    "success": True,
                    "message": f"Generated {message_type} successfully",
                    "data": {
                        "type": message_type,
                        "content": generated_message,
                        "context": {
                            "files_changed": len(file_paths) if file_paths else 0,
                            "repository": repository,
                            "diff_size": len(code_diff)
                        }
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to generate message from LLM",
                    "data": None
                }

        except Exception as e:
            logger.error(f"Error in storyteller agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing request: {str(e)}",
                "data": None
            }

    def _build_context(self, code_diff: str, file_paths: list, repository: str) -> Dict[str, Any]:
        """Build context for the LLM from the request data."""
        context = {
            "diff": code_diff,
            "file_paths": file_paths,
            "repository": repository,
            "stats": self._analyze_diff(code_diff)
        }
        return context

    def _analyze_diff(self, diff: str) -> Dict[str, Any]:
        """Analyze the diff to extract statistics."""
        lines = diff.split('\n')
        stats = {
            "additions": 0,
            "deletions": 0,
            "files_modified": 0,
            "languages": set(),
            "changes_type": []
        }
        
        current_file = None
        for line in lines:
            if line.startswith('+++') or line.startswith('---'):
                if line.startswith('+++') and not line.endswith('/dev/null'):
                    current_file = line[4:]
                    stats["files_modified"] += 1
                    # Detect language from file extension
                    if '.' in current_file:
                        ext = current_file.split('.')[-1].lower()
                        if ext in ['py', 'js', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'c', 'go', 'rs']:
                            stats["languages"].add(ext)
            elif line.startswith('+') and not line.startswith('+++'):
                stats["additions"] += 1
            elif line.startswith('-') and not line.startswith('---'):
                stats["deletions"] += 1
        
        stats["languages"] = list(stats["languages"])
        return stats

    def _create_user_prompt(self, context: Dict[str, Any], message_type: str) -> str:
        """Create user prompt based on context and message type."""
        stats = context["stats"]
        
        prompt = f"""Please analyze the following code changes and generate a {message_type}.

**Repository**: {context["repository"] or "Unknown"}
**Files Changed**: {len(context["file_paths"])} files
**Lines Added**: {stats["additions"]}
**Lines Deleted**: {stats["deletions"]}
**Languages**: {', '.join(stats["languages"]) or "Unknown"}

**Files Modified**:
{chr(10).join(f"- {fp}" for fp in (context["file_paths"] or [])) if context.get("file_paths") else "- [File paths not provided]"}

**Code Diff**:
```diff
{context["diff"][:5000]}{"..." if len(context["diff"]) > 5000 else ""}
```

Generate a {"commit message" if message_type == "commit" else message_type.replace("_", " ")} that clearly explains the changes made."""
        
        return prompt

# Initialize storyteller agent
storyteller_agent = StorytellerAgent()