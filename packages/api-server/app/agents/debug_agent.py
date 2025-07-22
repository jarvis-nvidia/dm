"""Debug agent for analyzing and resolving code issues."""
import logging
from typing import Dict, Any, List
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class DebugAgent:
    def __init__(self):
        self.system_prompt = """You are an expert software debugging specialist with deep knowledge across multiple programming languages and frameworks.

Your role is to analyze code issues, error messages, and problems to provide:

1. **Root Cause Analysis**: Identify the underlying cause of the issue
2. **Step-by-Step Debugging**: Provide a systematic approach to debug the problem
3. **Solution Recommendations**: Offer specific, actionable solutions
4. **Prevention Strategies**: Suggest how to avoid similar issues in the future
5. **Code Examples**: Provide corrected code snippets when applicable

When analyzing issues:
- Consider common pitfalls for the specific language/framework
- Look for edge cases and race conditions
- Check for memory leaks, performance bottlenecks
- Verify error handling and input validation
- Consider environmental and configuration issues

Be thorough, practical, and provide working solutions. Always explain your reasoning."""

    async def process(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process debug request and provide analysis."""
        try:
            problem_description = request.get("problem_description", "")
            code_snippet = request.get("code_snippet", "")
            error_message = request.get("error_message", "")
            repository = request.get("repository", "")
            file_path = request.get("file_path", "")
            language = request.get("language", "")

            if not problem_description:
                return {
                    "success": False,
                    "message": "Problem description is required",
                    "data": None
                }

            # Build context for debugging
            context = self._build_debug_context(
                problem_description, code_snippet, error_message, 
                repository, file_path, language
            )
            
            # Create user prompt
            user_prompt = self._create_debug_prompt(context)
            
            # Generate debug analysis using LLM
            response = await llm_service.generate_completion(
                prompt=user_prompt,
                system_message=self.system_prompt,
                temperature=0.1  # Very low temperature for consistent debugging advice
            )
            
            if response and "choices" in response and response["choices"]:
                debug_analysis = response["choices"][0]["message"]["content"].strip()
                
                # Parse the debug response
                parsed_analysis = self._parse_debug_response(debug_analysis)
                
                return {
                    "success": True,
                    "message": "Debug analysis completed successfully",
                    "data": {
                        "analysis": debug_analysis,
                        "structured_response": parsed_analysis,
                        "context": {
                            "repository": repository,
                            "file_path": file_path,
                            "language": language,
                            "has_error_message": bool(error_message),
                            "has_code_snippet": bool(code_snippet)
                        },
                        "debugging_steps": self._extract_debugging_steps(debug_analysis),
                        "confidence_score": self._calculate_confidence_score(context)
                    }
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to generate debug analysis from LLM",
                    "data": None
                }

        except Exception as e:
            logger.error(f"Error in debug agent: {str(e)}")
            return {
                "success": False,
                "message": f"Error processing debug request: {str(e)}",
                "data": None
            }

    def _build_debug_context(self, problem_description: str, code_snippet: str, 
                           error_message: str, repository: str, file_path: str, 
                           language: str) -> Dict[str, Any]:
        """Build comprehensive context for debugging."""
        context = {
            "problem_description": problem_description,
            "code_snippet": code_snippet,
            "error_message": error_message,
            "repository": repository,
            "file_path": file_path,
            "language": language or self._detect_language_from_context(code_snippet, file_path, error_message),
            "error_type": self._classify_error_type(error_message),
            "code_analysis": self._analyze_code_snippet(code_snippet) if code_snippet else {}
        }
        return context

    def _detect_language_from_context(self, code_snippet: str, file_path: str, error_message: str) -> str:
        """Detect programming language from available context."""
        # Check file extension first
        if file_path and '.' in file_path:
            ext = file_path.split('.')[-1].lower()
            ext_map = {
                'py': 'Python', 'js': 'JavaScript', 'ts': 'TypeScript',
                'tsx': 'TypeScript React', 'jsx': 'JavaScript React',
                'java': 'Java', 'cpp': 'C++', 'c': 'C', 'go': 'Go',
                'rs': 'Rust', 'php': 'PHP', 'rb': 'Ruby', 'cs': 'C#'
            }
            if ext in ext_map:
                return ext_map[ext]
        
        # Check code patterns
        if code_snippet:
            if 'def ' in code_snippet or 'import ' in code_snippet or 'from ' in code_snippet:
                return 'Python'
            elif 'function' in code_snippet or 'const ' in code_snippet or 'let ' in code_snippet:
                return 'JavaScript/TypeScript'
            elif 'public class' in code_snippet or 'public static void main' in code_snippet:
                return 'Java'
        
        # Check error message patterns
        if error_message:
            if 'Traceback' in error_message or 'NameError' in error_message:
                return 'Python'
            elif 'ReferenceError' in error_message or 'TypeError' in error_message and 'undefined' in error_message:
                return 'JavaScript'
            elif 'NullPointerException' in error_message:
                return 'Java'
        
        return 'Unknown'

    def _classify_error_type(self, error_message: str) -> str:
        """Classify the type of error based on error message."""
        if not error_message:
            return "Unknown"
        
        error_message_lower = error_message.lower()
        
        # Common error type patterns
        if any(keyword in error_message_lower for keyword in ['syntax', 'invalid syntax', 'unexpected token']):
            return "Syntax Error"
        elif any(keyword in error_message_lower for keyword in ['name', 'not defined', 'undefined', 'reference']):
            return "Name/Reference Error"
        elif any(keyword in error_message_lower for keyword in ['type', 'cannot read property', 'attribute']):
            return "Type Error"
        elif any(keyword in error_message_lower for keyword in ['index', 'out of bounds', 'range']):
            return "Index/Range Error"
        elif any(keyword in error_message_lower for keyword in ['null', 'nullptr', 'nullpointer']):
            return "Null Pointer Error"
        elif any(keyword in error_message_lower for keyword in ['import', 'module', 'package']):
            return "Import/Module Error"
        elif any(keyword in error_message_lower for keyword in ['permission', 'access', 'denied']):
            return "Permission Error"
        elif any(keyword in error_message_lower for keyword in ['network', 'connection', 'timeout']):
            return "Network Error"
        elif any(keyword in error_message_lower for keyword in ['memory', 'out of memory', 'heap']):
            return "Memory Error"
        else:
            return "Runtime Error"

    def _analyze_code_snippet(self, code_snippet: str) -> Dict[str, Any]:
        """Perform basic analysis of the provided code snippet."""
        if not code_snippet:
            return {}
        
        analysis = {
            "lines_of_code": len([line for line in code_snippet.split('\n') if line.strip()]),
            "has_error_handling": any(keyword in code_snippet.lower() for keyword in ['try', 'catch', 'except', 'finally']),
            "has_loops": any(keyword in code_snippet for keyword in ['for', 'while', 'forEach']),
            "has_conditionals": any(keyword in code_snippet for keyword in ['if', 'else', 'elif', 'switch', 'case']),
            "has_functions": any(keyword in code_snippet for keyword in ['def ', 'function', '=>', 'lambda']),
            "complexity_indicators": []
        }
        
        # Check for potential complexity indicators
        if analysis["has_loops"] and analysis["has_conditionals"]:
            analysis["complexity_indicators"].append("nested control structures")
        if code_snippet.count('\n') > 50:
            analysis["complexity_indicators"].append("long code block")
        if len([line for line in code_snippet.split('\n') if 'TODO' in line or 'FIXME' in line]) > 0:
            analysis["complexity_indicators"].append("has TODO/FIXME comments")
        
        return analysis

    def _create_debug_prompt(self, context: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for debugging analysis."""
        prompt_parts = []
        
        prompt_parts.append(f"**Problem**: {context['problem_description']}")
        
        if context['repository']:
            prompt_parts.append(f"**Repository**: {context['repository']}")
        if context['file_path']:
            prompt_parts.append(f"**File**: {context['file_path']}")
        if context['language'] != 'Unknown':
            prompt_parts.append(f"**Language**: {context['language']}")
        if context['error_type'] != 'Unknown':
            prompt_parts.append(f"**Error Type**: {context['error_type']}")
        
        # Add error message if available
        if context['error_message']:
            prompt_parts.append(f"\n**Error Message**:")
            prompt_parts.append(f"```")
            prompt_parts.append(context['error_message'])
            prompt_parts.append(f"```")
        
        # Add code snippet if available
        if context['code_snippet']:
            prompt_parts.append(f"\n**Code Snippet**:")
            prompt_parts.append(f"```{context['language'].lower().split()[0] if context['language'] != 'Unknown' else ''}")
            prompt_parts.append(context['code_snippet'])
            prompt_parts.append(f"```")
        
        # Add code analysis insights
        if context['code_analysis']:
            analysis = context['code_analysis']
            prompt_parts.append(f"\n**Code Analysis**:")
            prompt_parts.append(f"- Lines of code: {analysis['lines_of_code']}")
            prompt_parts.append(f"- Has error handling: {analysis['has_error_handling']}")
            if analysis['complexity_indicators']:
                prompt_parts.append(f"- Complexity indicators: {', '.join(analysis['complexity_indicators'])}")
        
        prompt_parts.append(f"\nPlease provide a thorough debug analysis with root cause identification, step-by-step debugging approach, and actionable solutions.")
        
        return '\n'.join(prompt_parts)

    def _parse_debug_response(self, debug_analysis: str) -> Dict[str, Any]:
        """Parse the debug analysis to extract structured information."""
        sections = {
            "root_cause": "",
            "debugging_steps": [],
            "solutions": [],
            "prevention_tips": [],
            "code_examples": []
        }
        
        lines = debug_analysis.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Identify sections based on headers
            if any(keyword in line_lower for keyword in ['root cause', 'cause analysis']):
                current_section = "root_cause"
                current_content = []
            elif any(keyword in line_lower for keyword in ['debugging', 'debug steps', 'step-by-step']):
                current_section = "debugging_steps"
                current_content = []
            elif any(keyword in line_lower for keyword in ['solution', 'fix', 'resolution']):
                current_section = "solutions"
                current_content = []
            elif any(keyword in line_lower for keyword in ['prevention', 'avoid', 'best practice']):
                current_section = "prevention_tips"
                current_content = []
            elif line.strip().startswith('```'):
                # Code example detected
                if current_section:
                    sections["code_examples"].append('\n'.join(current_content))
                current_content = []
            elif current_section:
                current_content.append(line)
        
        # Add the last section content
        if current_section and current_content:
            if current_section == "debugging_steps":
                sections[current_section] = [step.strip('- ').strip() for step in current_content if step.strip()]
            else:
                sections[current_section] = '\n'.join(current_content).strip()
        
        return sections

    def _extract_debugging_steps(self, debug_analysis: str) -> List[str]:
        """Extract debugging steps from the analysis."""
        steps = []
        lines = debug_analysis.split('\n')
        
        in_steps_section = False
        for line in lines:
            line_clean = line.strip()
            if 'step' in line.lower() and any(keyword in line.lower() for keyword in ['debug', 'approach', 'process']):
                in_steps_section = True
                continue
            elif in_steps_section:
                if line_clean.startswith(('1.', '2.', '3.', '4.', '5.', '-', '*')):
                    steps.append(line_clean.lstrip('1234567890.- *').strip())
                elif line_clean and not line_clean.startswith(('**', '#')):
                    if steps:
                        steps[-1] += " " + line_clean
                elif line_clean.startswith('**') and steps:
                    break
        
        return steps[:10]  # Limit to 10 steps for practical use

    def _calculate_confidence_score(self, context: Dict[str, Any]) -> float:
        """Calculate confidence score based on available context information."""
        score = 0.0
        
        # Base score for having a problem description
        if context['problem_description']:
            score += 0.3
        
        # Bonus for having error message
        if context['error_message']:
            score += 0.3
        
        # Bonus for having code snippet
        if context['code_snippet']:
            score += 0.2
        
        # Bonus for known language
        if context['language'] != 'Unknown':
            score += 0.1
        
        # Bonus for classified error type
        if context['error_type'] != 'Unknown':
            score += 0.1
        
        return min(1.0, score)

# Initialize debug agent
debug_agent = DebugAgent()