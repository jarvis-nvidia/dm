"""Advanced file chunking utilities for DevMind."""
from typing import List, Dict, Any, Optional, Tuple, Generator
import re
from dataclasses import dataclass
from pathlib import Path
import logging
import ast
import tokenize
from io import StringIO
import sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)

@dataclass
class CodeChunk:
    content: str
    metadata: Dict[str, Any]
    start_line: int
    end_line: int
    chunk_type: str
    language: str
    semantic_score: float = 0.0
    imports: List[str] = None
    dependencies: List[str] = None
    complexity: int = 0

    def __post_init__(self):
        self.imports = self.imports or []
        self.dependencies = self.dependencies or []
        if self.language == 'python':
            self._analyze_python_chunk()

    def _analyze_python_chunk(self):
        """Analyze Python code chunk for imports and complexity."""
        try:
            tree = ast.parse(self.content)
            analyzer = CodeAnalyzer()
            analyzer.visit(tree)
            self.imports = analyzer.imports
            self.complexity = analyzer.complexity
            self.dependencies = analyzer.dependencies
        except SyntaxError:
            # Handle partial code blocks that might not be valid Python
            pass

class CodeAnalyzer(ast.NodeVisitor):
    """AST visitor for analyzing code chunks."""
    def __init__(self):
        self.imports = []
        self.complexity = 0
        self.dependencies = []
        self.functions = set()
        self.classes = set()

    def visit_Import(self, node):
        """Record import statements."""
        for name in node.names:
            self.imports.append(name.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        """Record from-import statements."""
        module = node.module or ''
        for name in node.names:
            self.imports.append(f"{module}.{name.name}")
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        """Analyze function definitions."""
        self.functions.add(node.name)
        self.complexity += self._count_branches(node)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        """Analyze class definitions."""
        self.classes.add(node.name)
        self.generic_visit(node)

    def visit_Name(self, node):
        """Track variable dependencies."""
        if isinstance(node.ctx, ast.Load):
            name = node.id
            if (name not in self.functions and
                name not in self.classes and
                name not in self.imports):
                self.dependencies.append(name)
        self.generic_visit(node)

    def _count_branches(self, node) -> int:
        """Calculate cyclomatic complexity."""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Break,
                                ast.Continue, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity

class ChunkingStrategy:
    def __init__(self,
                 min_chunk_size: int = 50,
                 max_chunk_size: int = 1500,
                 overlap: int = 50,
                 max_workers: int = 4):
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size
        self.overlap = overlap
        self.max_workers = max_workers
        self.language_patterns = self._init_language_patterns()
        self.chunk_buffer = []
        self.buffer_size = 10  # Number of chunks to buffer before processing

    def _init_language_patterns(self) -> Dict[str, Dict[str, str]]:
        """Initialize regex patterns for different languages."""
        return {
            'python': {
                'function': r'(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*(?:->.*?)?\s*:',
                'class': r'class\s+([a-zA-Z_]\w*)\s*(?:\([^)]*\))?\s*:',
                'method': r'(?:async\s+)?def\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*(?:->.*?)?\s*:',
                'docstring': r'"""[\s\S]*?"""|\'\'\'\s*[\s\S]*?\'\'\'',
                'comment_single': r'#.*$',
                'comment_multi': r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'',
                'decorator': r'@\w+(?:\(.*\))?',
            },
            'typescript': {
                'function': r'(?:async\s+)?function\s+([a-zA-Z_]\w*)|const\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>',
                'class': r'class\s+([a-zA-Z_]\w*)',
                'method': r'(?:async\s+)?([a-zA-Z_]\w*)\s*\([^)]*\)\s*{',
                'interface': r'interface\s+([a-zA-Z_]\w*)',
                'type': r'type\s+([a-zA-Z_]\w*)\s*=',
                'comment_single': r'\/\/.*$',
                'comment_multi': r'\/\*[\s\S]*?\*\/',
                'decorator': r'@\w+(?:\(.*\))?',
            },
            'javascript': {
                'function': r'(?:async\s+)?function\s+([a-zA-Z_]\w*)|const\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>',
                'class': r'class\s+([a-zA-Z_]\w*)',
                'method': r'(?:async\s+)?([a-zA-Z_]\w*)\s*\([^)]*\)\s*{',
                'comment_single': r'\/\/.*$',
                'comment_multi': r'\/\*[\s\S]*?\*\/',
                'jsx': r'<[A-Z]\w*',
            }
        }

    def process_file(self, file_path: str, content: str, metadata: Dict[str, Any]) -> Generator[CodeChunk, None, None]:
        """Process file content and yield chunks asynchronously."""
        language = self.detect_language(file_path, content)
        chunks = self.create_chunks(content, file_path, metadata, language)

        for chunk in chunks:
            self.chunk_buffer.append(chunk)

            if len(self.chunk_buffer) >= self.buffer_size:
                yield from self._process_chunk_buffer()

        # Process remaining chunks
        if self.chunk_buffer:
            yield from self._process_chunk_buffer()

    def _process_chunk_buffer(self) -> Generator[CodeChunk, None, None]:
        """Process buffered chunks in parallel."""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Process chunks in parallel
            futures = [
                executor.submit(self._enrich_chunk, chunk)
                for chunk in self.chunk_buffer
            ]

            # Yield processed chunks
            for future in futures:
                try:
                    yield future.result()
                except Exception as e:
                    logger.error(f"Error processing chunk: {str(e)}")

        # Clear buffer
        self.chunk_buffer = []

    def _enrich_chunk(self, chunk: CodeChunk) -> CodeChunk:
        """Enrich chunk with additional metadata and analysis."""
        try:
            # Calculate semantic score based on content structure
            chunk.semantic_score = self._calculate_semantic_score(chunk)

            # Add language-specific enrichment
            if chunk.language == 'python':
                self._enrich_python_chunk(chunk)
            elif chunk.language in ['typescript', 'javascript']:
                self._enrich_js_chunk(chunk)

            return chunk
        except Exception as e:
            logger.error(f"Error enriching chunk: {str(e)}")
            return chunk

    def _calculate_semantic_score(self, chunk: CodeChunk) -> float:
        """Calculate semantic score based on chunk characteristics."""
        score = 0.0

        # Score based on chunk type
        type_scores = {
            'function': 0.8,
            'class': 1.0,
            'method': 0.7,
            'interface': 0.9,
            'block': 0.5
        }
        score += type_scores.get(chunk.chunk_type, 0.3)

        # Score based on content length
        content_length = len(chunk.content)
        if self.min_chunk_size <= content_length <= self.max_chunk_size:
            score += 0.5

        # Score based on complexity
        if chunk.complexity > 0:
            score += min(0.5, chunk.complexity / 20)

        # Normalize score
        return min(1.0, score)

    def _enrich_python_chunk(self, chunk: CodeChunk):
        """Add Python-specific enrichment."""
        try:
            # Add type hints analysis
            chunk.metadata['has_type_hints'] = bool(re.search(r':\s*[A-Z]\w+', chunk.content))

            # Check for async code
            chunk.metadata['is_async'] = bool(re.search(r'\basync\s+def\b', chunk.content))

            # Extract decorators
            decorators = re.findall(self.language_patterns['python']['decorator'], chunk.content)
            if decorators:
                chunk.metadata['decorators'] = decorators
        except Exception as e:
            logger.error(f"Error enriching Python chunk: {str(e)}")

    def _enrich_js_chunk(self, chunk: CodeChunk):
        """Add JavaScript/TypeScript-specific enrichment."""
        try:
            # Check for React components
            chunk.metadata['is_react_component'] = bool(re.search(r'React\.Component|function\s+\w+\s*\(\s*props\s*\)', chunk.content))

            # Check for hooks
            chunk.metadata['has_hooks'] = bool(re.search(r'use[A-Z]\w+', chunk.content))

            # Check for async/await
            chunk.metadata['is_async'] = bool(re.search(r'\basync\b', chunk.content))
        except Exception as e:
            logger.error(f"Error enriching JS chunk: {str(e)}")

    def create_chunks(self, content: str, file_path: str, metadata: Dict[str, Any], language: str) -> List[CodeChunk]:
        """Create intelligent code chunks based on language and structure."""
        if language == 'unknown':
            return self._create_default_chunks(content, metadata)

        chunks = []
        lines = content.split('\n')
        current_chunk = []
        current_metadata = metadata.copy()
        start_line = 1

        patterns = self.language_patterns.get(language, {})

        i = 0
        while i < len(lines):
            line = lines[i]

            # Detect chunk type and boundaries
            chunk_info = self._detect_chunk_type(line, patterns)

            if chunk_info:
                # Save previous chunk if exists
                if current_chunk:
                    chunks.append(self._create_chunk(
                        current_chunk, start_line, i,
                        language, 'block', current_metadata
                    ))
                    current_chunk = []

                # Process new chunk
                chunk_type, chunk_name = chunk_info
                current_chunk, i, end_line = self._extract_block(
                    lines, i, self._get_indentation_level(line)
                )

                # Create chunk with enhanced metadata
                current_metadata = metadata.copy()
                current_metadata.update({
                    'chunk_type': chunk_type,
                    'name': chunk_name,
                    'indentation': self._get_indentation_level(line)
                })

                chunks.append(self._create_chunk(
                    current_chunk, start_line, end_line,
                    language, chunk_type, current_metadata
                ))

                start_line = end_line + 1
                current_chunk = []
                continue

            # Handle regular lines
            current_chunk.append(line)

            # Check chunk size and create new chunk if needed
            if len('\n'.join(current_chunk)) >= self.max_chunk_size:
                chunks.append(self._create_chunk(
                    current_chunk, start_line, i + 1,
                    language, 'block', current_metadata
                ))
                current_chunk = []
                start_line = i + 1

            i += 1

        # Handle remaining lines
        if current_chunk:
            chunks.append(self._create_chunk(
                current_chunk, start_line, len(lines),
                language, 'block', current_metadata
            ))

        return chunks

    def _detect_chunk_type(self, line: str, patterns: Dict[str, str]) -> Optional[Tuple[str, str]]:
        """Detect chunk type and name from a line."""
        for chunk_type, pattern in patterns.items():
            match = re.search(pattern, line)
            if match:
                # Get the first non-None group as the chunk name
                chunk_name = next((g for g in match.groups() if g is not None), '')
                return chunk_type, chunk_name
        return None

    def _extract_block(self, lines: List[str], start: int, base_indent: int) -> Tuple[List[str], int, int]:
        """Extract a complete code block maintaining proper indentation."""
        block = [lines[start]]
        i = start + 1
        while i < len(lines):
            line = lines[i]
            current_indent = self._get_indentation_level(line)

            # Check if we're still in the same block
            if line.strip() and current_indent <= base_indent:
                break

            block.append(line)
            i += 1

        return block, i - 1, i

    def detect_language(self, file_path: str, content: str) -> str:
        """Detect programming language from file extension and content."""
        ext = Path(file_path).suffix.lower()
        ext_to_lang = {
            '.py': 'python',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript'
        }

        # Use file extension first
        language = ext_to_lang.get(ext)
        if language:
            return language

        # Fall back to content analysis
        if re.search(r'import\s+.*\s+from\s+[\'"]', content):
            return 'javascript'  # or typescript
        elif re.search(r'def\s+\w+\s*\(', content):
            return 'python'

        return 'unknown'

    def _get_indentation_level(self, line: str) -> int:
        """Get indentation level of a line."""
        return len(line) - len(line.lstrip())

    def _create_chunk(self,
                     lines: List[str],
                     start_line: int,
                     end_line: int,
                     language: str,
                     chunk_type: str,
                     metadata: Dict[str, Any]) -> CodeChunk:
        """Create a code chunk with enhanced metadata."""
        content = '\n'.join(lines)

        # Create basic chunk
        chunk = CodeChunk(
            content=content,
            metadata=metadata,
            start_line=start_line,
            end_line=end_line,
            chunk_type=chunk_type,
            language=language
        )

        return chunk

# Initialize chunking strategy with optimal settings for M2 Mac
chunking_strategy = ChunkingStrategy(
    min_chunk_size=settings.MIN_CHUNK_SIZE,
    max_chunk_size=settings.MAX_CHUNK_SIZE,
    overlap=settings.CHUNK_OVERLAP,
    max_workers=settings.MAX_WORKERS
)
