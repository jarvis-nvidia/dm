"""Review agent for code review and analysis."""
import logging
from typing import Dict, Any, List
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class ReviewAgent:
    def __init__(self):
        self.system_prompt = """You are an expert senior software engineer conducting thorough code reviews. 
Your role is to provide constructive, actionable feedback on code changes.

Review the code for:
1. **Security Issues**: Potential vulnerabilities, injection risks, authentication issues
2. **Performance**: Optimization opportunities, memory usage, algorithmic efficiency  
3. **Code Quality**: Readability, maintainability, following best practices
4. **Logic & Correctness**: Edge cases, error handling, business logic issues
5. **Architecture**: Design patterns, separation of concerns, modularity
6. **Testing**: Missing tests, test coverage, testability

For each issue found:
- Specify the exact location (file and line if possible)
- Explain WHY it's an issue
- Provide a specific suggestion for improvement
- Rate severity: Critical, High, Medium, Low

Be thorough but constructive. Focus on significant issues that impact code quality, security, or performance."""

    async def process(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process code review request."""
        try:
            code_diff = request.get("code_diff", "")
            file_path = request.get("file_path", "")
            repository = request.get("repository", "")
            pr_title = request.get("pr_title", "")
            pr_description = request.get("pr_description", "")
            language = request.get("language", "")

            if not code_diff and not file_path:
                return {
                    "success": False,
                    "message": "Either code_diff or file_path is required",
                    "data": None
                }

            # Build context for the review
            context = self._build_review_context(
                code_diff, file_path, repository, pr_title, pr_description, language
            )
            
            # Create user prompt
            user_prompt = self._create_review_prompt(context)
            
            # Generate review using LLM
            response = await llm_service.generate_completion(
                prompt=user_prompt,
                system_message=self.system_prompt,
                temperature=0.2  # Lower temperature for more consistent reviews
            )
            
            if response and "choices" in response and response["choices"]:
                review_content = response["choices"][0]["message"]["content"].strip()
                
                # Parse the review to extract structured feedback
                parsed_review = self._parse_review(review_content)
                
                return {
                    "success": True,
                    "message": "Code review completed successfully",
                    "data": {
                        "review": review_content,
                        "structured_feedback": parsed_review,
                        "context": {
                            "repository": repository,
                            "file_path": file_path,
                            "language": language,
                            "pr_title": pr_title
                        },
                        "summary": self._generate_review_summary(parsed_review)
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to generate review from LLM",
                    "data": None
                }

        except Exception as e:
            logger.error(f"Error in review agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing review request: {str(e)}",
                "data": None
            }

    def _build_review_context(self, code_diff: str, file_path: str, repository: str, 
                             pr_title: str, pr_description: str, language: str) -> Dict[str, Any]:
        """Build context for the code review."""
        context = {
            "code_diff": code_diff,
            "file_path": file_path,
            "repository": repository,
            "pr_title": pr_title,
            "pr_description": pr_description,
            "language": language or self._detect_language(file_path, code_diff),
            "diff_stats": self._analyze_diff(code_diff) if code_diff else {}
        }
        return context

    def _detect_language(self, file_path: str, code_diff: str) -> str:
        """Detect programming language from file path or code content."""
        if file_path:
            ext = file_path.split('.')[-1].lower() if '.' in file_path else ''
            lang_map = {
                'py': 'Python',
                'js': 'JavaScript', 
                'ts': 'TypeScript',
                'tsx': 'TypeScript React',
                'jsx': 'JavaScript React',
                'java': 'Java',
                'cpp': 'C++',
                'c': 'C',
                'go': 'Go',
                'rs': 'Rust',
                'php': 'PHP',
                'rb': 'Ruby',
                'cs': 'C#'
            }
            return lang_map.get(ext, 'Unknown')
        return 'Unknown'

    def _analyze_diff(self, diff: str) -> Dict[str, Any]:
        """Analyze diff to extract basic statistics."""
        lines = diff.split('\n')
        stats = {
            "additions": sum(1 for line in lines if line.startswith('+')),
            "deletions": sum(1 for line in lines if line.startswith('-')),
            "files_changed": len([line for line in lines if line.startswith('+++')]),
            "total_changes": 0
        }
        stats["total_changes"] = stats["additions"] + stats["deletions"]
        return stats

    def _create_review_prompt(self, context: Dict[str, Any]) -> str:
        """Create a detailed prompt for code review."""
        prompt_parts = []
        
        # Add context information
        prompt_parts.append(f"**Repository**: {context['repository'] or 'Unknown'}")
        if context['pr_title']:
            prompt_parts.append(f"**PR Title**: {context['pr_title']}")
        if context['pr_description']:
            prompt_parts.append(f"**PR Description**: {context['pr_description']}")
        
        prompt_parts.append(f"**Language**: {context['language']}")
        
        if context['file_path']:
            prompt_parts.append(f"**File**: {context['file_path']}")
        
        # Add diff statistics
        if context['diff_stats']:
            stats = context['diff_stats']
            prompt_parts.append(f"**Changes**: +{stats['additions']} -{stats['deletions']} lines, {stats['files_changed']} files")
        
        # Add the code diff
        if context['code_diff']:
            prompt_parts.append(f"\n**Code Diff to Review**:")
            prompt_parts.append("```diff")
            # Truncate very large diffs
            diff_content = context['code_diff']
            if len(diff_content) > 8000:
                diff_content = diff_content[:8000] + "\n... [diff truncated for length]"
            prompt_parts.append(diff_content)
            prompt_parts.append("```")
        
        prompt_parts.append("\nPlease provide a thorough code review with specific, actionable feedback.")
        
        return '\n'.join(prompt_parts)

    def _parse_review(self, review_content: str) -> Dict[str, Any]:
        """Parse the review content to extract structured feedback."""
        # Basic parsing - in a real implementation, you might want more sophisticated parsing
        issues = []
        suggestions = []
        
        lines = review_content.split('\n')
        current_section = None
        current_issue = ""
        
        for line in lines:
            line = line.strip()
            if line.lower().startswith(('critical', 'high', 'medium', 'low')):
                if current_issue:
                    issues.append({
                        "content": current_issue.strip(),
                        "severity": line.split(':')[0] if ':' in line else "Medium"
                    })
                current_issue = line
            elif line.startswith('**') and line.endswith('**'):
                current_section = line.replace('*', '').strip()
                if current_issue:
                    issues.append({
                        "content": current_issue.strip(),
                        "severity": "Medium"
                    })
                current_issue = ""
            elif line and current_issue:
                current_issue += "\n" + line
            elif line.startswith('- ') or line.startswith('* '):
                suggestions.append(line[2:])
        
        # Add the last issue if exists
        if current_issue:
            issues.append({
                "content": current_issue.strip(),
                "severity": "Medium"
            })
        
        return {
            "issues": issues,
            "suggestions": suggestions,
            "total_issues": len(issues)
        }

    def _generate_review_summary(self, parsed_review: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a summary of the review findings."""
        issues = parsed_review.get("issues", [])
        severity_counts = {}
        
        for issue in issues:
            severity = issue.get("severity", "Medium")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            "total_issues": len(issues),
            "severity_breakdown": severity_counts,
            "total_suggestions": len(parsed_review.get("suggestions", [])),
            "overall_status": self._determine_overall_status(severity_counts)
        }

    def _determine_overall_status(self, severity_counts: Dict[str, int]) -> str:
        """Determine overall review status based on issue severity."""
        if severity_counts.get("Critical", 0) > 0:
            return "Needs Major Changes"
        elif severity_counts.get("High", 0) > 2:
            return "Needs Changes"
        elif severity_counts.get("High", 0) > 0 or severity_counts.get("Medium", 0) > 3:
            return "Needs Minor Changes"
        elif sum(severity_counts.values()) > 0:
            return "Looks Good with Suggestions"
        else:
            return "Approved"

# Initialize review agent
review_agent = ReviewAgent()