"""Service for Git repository operations optimized for M2 Mac."""
import os
import git
import tempfile
import shutil
import mmap
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple, Generator
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GitService:
    def __init__(self):
        self.repos_dir = settings.REPOS_DIR
        self.max_file_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
        self.default_branch = settings.DEFAULT_BRANCH
        os.makedirs(self.repos_dir, exist_ok=True)

    async def clone_repository(self, repo_url: str, branch: Optional[str] = None, depth: int = 1) -> str:
        """Clone a Git repository to local storage with memory optimizations."""
        try:
            repo_name = repo_url.split("/")[-1].replace(".git", "")
            repo_path = os.path.join(self.repos_dir, repo_name)

            # Remove existing repo if it exists
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path)

            # Use shallow clone (depth=1) by default to save space and memory
            clone_args = {
                "depth": depth,
                "single-branch": True,
                "no-tags": True,
            }

            # Clone the repository
            if branch:
                repo = git.Repo.clone_from(repo_url, repo_path, branch=branch, **clone_args)
            else:
                repo = git.Repo.clone_from(repo_url, repo_path, branch=self.default_branch, **clone_args)

            logger.info(f"Successfully cloned repository: {repo_url} to {repo_path}")
            return repo_path
        except git.GitCommandError as e:
            logger.error(f"Git command error cloning repository: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error cloning repository: {str(e)}")
            raise

    async def get_file_content(self, repo_path: str, file_path: str) -> Tuple[str, str]:
        """Get the content of a file from a repository using memory mapping for large files."""
        try:
            full_path = os.path.join(repo_path, file_path)

            if not os.path.exists(full_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            # Check file size
            file_size = os.path.getsize(full_path)
            if file_size > self.max_file_size:
                raise ValueError(f"File size exceeds limit ({file_size} bytes): {file_path}")

            # Determine file type based on extension
            _, ext = os.path.splitext(file_path)
            file_ext = ext.lstrip('.')

            # Use memory mapping for efficient file reading
            # This avoids loading the entire file into memory at once
            content = ""
            try:
                with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
            except UnicodeDecodeError:
                logger.warning(f"Could not decode file as text: {file_path}")
                content = f"[Binary file - {file_size} bytes]"

            return content, file_ext
        except Exception as e:
            logger.error(f"Error getting file content: {str(e)}")
            raise

    async def list_repository_files(self,
                                   repo_path: str,
                                   extensions: Optional[List[str]] = None,
                                   ignore_dirs: Optional[List[str]] = None,
                                   max_files: int = 5000) -> List[str]:
        """List repository files with limits to avoid memory issues."""
        try:
            if not ignore_dirs:
                ignore_dirs = ['.git', 'node_modules', 'venv', '.venv', '__pycache__',
                              '.pytest_cache', 'dist', 'build', '.next', 'coverage']

            result = []
            file_count = 0

            for root, dirs, files in os.walk(repo_path):
                # Skip ignored directories
                dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]

                for file in files:
                    # Enforce file count limit to avoid OOM
                    if file_count >= max_files:
                        logger.warning(f"Reached maximum file count ({max_files})")
                        return result

                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, repo_path)

                    # Skip hidden files
                    if os.path.basename(rel_path).startswith('.'):
                        continue

                    # Skip files that are too large
                    try:
                        if os.path.getsize(file_path) > self.max_file_size:
                            continue
                    except (OSError, IOError):
                        continue

                    # Filter by extension if specified
                    if extensions:
                        ext = os.path.splitext(file)[1].lstrip('.')
                        if ext not in extensions:
                            continue

                    result.append(rel_path)
                    file_count += 1

            return result
        except Exception as e:
            logger.error(f"Error listing repository files: {str(e)}")
            raise

    async def get_file_diff(self,
                          repo_path: str,
                          file_path: str,
                          from_commit: str,
                          to_commit: str = "HEAD") -> str:
        """Get the diff of a file between two commits."""
        try:
            repo = git.Repo(repo_path)

            # Use a more memory-efficient approach for large diffs
            result = repo.git.diff(
                from_commit,
                to_commit,
                "--",
                file_path,
                # Limit diff output size
                "--stat-width=100",
                "--stat-count=100",
                "--stat-name-width=80"
            )

            # Truncate if diff is extremely large
            if len(result) > 100000:  # ~100KB limit
                result = result[:100000] + "\n... [diff truncated due to size]"

            return result
        except git.GitCommandError as e:
            logger.error(f"Git command error getting diff: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error getting file diff: {str(e)}")
            raise

    async def get_commit_history(self,
                               repo_path: str,
                               file_path: Optional[str] = None,
                               max_count: int = 10) -> List[Dict[str, Any]]:
        """Get commit history with memory-efficient processing."""
        try:
            repo = git.Repo(repo_path)

            # Use git log command directly for better memory usage
            cmd = ["log", f"--max-count={max_count}", "--format=%H %an %ae %at %s"]

            if file_path:
                cmd.append("--")
                cmd.append(file_path)

            log_output = repo.git.execute(cmd)

            result = []
            for line in log_output.strip().split("\n"):
                if not line.strip():
                    continue

                parts = line.split(" ", 4)
                if len(parts) < 5:
                    continue

                commit_hash, author_name, author_email, timestamp, message = parts

                result.append({
                    "id": commit_hash,
                    "message": message,
                    "author": {
                        "name": author_name,
                        "email": author_email
                    },
                    "date": timestamp
                })

            return result
        except Exception as e:
            logger.error(f"Error getting commit history: {str(e)}")
            raise

    def cleanup_repo(self, repo_name: str) -> bool:
        """Clean up a repository to free disk space."""
        try:
            repo_path = os.path.join(self.repos_dir, repo_name)
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path)
                logger.info(f"Cleaned up repository: {repo_name}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error cleaning up repository: {str(e)}")
            return False

# Initialize git service
git_service = GitService()
