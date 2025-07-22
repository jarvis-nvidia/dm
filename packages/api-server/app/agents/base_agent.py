"""Base agent class for all DevMind agents with memory optimizations for M2 Mac."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, AsyncGenerator
from app.services.llm_service import llm_service
from app.services.vectore_store_service import vector_store
from app.services.git_service import git_service
import logging
import time
import gc

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self):
        self.llm_service = llm_service
        self.vector_store = vector_store
        self.git_service = git_service
        self.system_message = "You are DevMind, an intelligent AI assistant for developers."
        self.max_context_length = 6000  # Character limit for context to avoid memory issues

    @property
    @abstractmethod
    def agent_name(self) -> str:
        """Return the name of the agent."""
        pass

    @property
    @abstractmethod
    def agent_description(self) -> str:
        """Return the description of what this agent does."""
        pass

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process the input data and return a response."""
        pass

    async def search_code_context(self,
                                query: str,
                                repo_filter: Optional[str] = None,
                                n_results: int = 5,
                                max_length: Optional[int] = None) -> List[Dict[str, Any]]:
        """Search for code context related to the query with memory constraints."""
        if max_length is None:
            max_length = self.max_context_length

        start_time = time.time()
        filter_dict = {"repo_name": repo_filter} if repo_filter else None

        try:
            results = await self.vector_store.search_code_chunks(
                query=query,
                n_results=n_results,
                filter_dict=filter_dict
            )

            # Apply length limits to avoid memory issues
            total_chars = 0
            filtered_results = []

            for result in results:
                content = result.get("content", "")
                content_len = len(content)

                # If adding this result would exceed max length, truncate or skip
                if total_chars + content_len > max_length:
                    # If this is the first result, include a truncated version
                    if len(filtered_results) == 0:
                        truncated_content = content[:max_length]
                        result["content"] = truncated_content
                        result["truncated"] = True
                        filtered_results.append(result)
                    break

                total_chars += content_len
                filtered_results.append(result)

            logger.info(f"Code context search completed in {time.time() - start_time:.2f}s, found {len(filtered_results)} relevant chunks")
            return filtered_results

        except Exception as e:
            logger.error(f"Error searching code context: {str(e)}")
            return []

    async def generate_response(self,
                              prompt: str,
                              context: Optional[List[Dict[str, Any]]] = None,
                              temperature: Optional[float] = None) -> Dict[str, Any]:
        """Generate a response using the LLM service with memory optimization."""
        start_time = time.time()

        try:
            if context:
                formatted_context = self._format_code_context(context)
                response = await self.llm_service.generate_completion(
                    prompt=f"Context:\n{formatted_context}\n\n{prompt}",
                    system_message=self.system_message,
                    temperature=temperature
                )
            else:
                response = await self.llm_service.generate_completion(
                    prompt=prompt,
                    system_message=self.system_message,
                    temperature=temperature
                )

            logger.info(f"Response generated in {time.time() - start_time:.2f}s")

            # Force garbage collection after response generation to free memory
            gc.collect()

            return response
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise

    async def generate_streaming_response(self,
                                        prompt: str,
                                        context: Optional[List[Dict[str, Any]]] = None) -> AsyncGenerator[str, None]:
        """Generate a streaming response using the LLM service."""
        try:
            if context:
                formatted_context = self._format_code_context(context)
                enhanced_prompt = f"Context:\n{formatted_context}\n\n{prompt}"

                async for chunk in self.llm_service.stream_completion(
                    prompt=enhanced_prompt,
                    system_message=self.system_message
                ):
                    yield chunk
            else:
                async for chunk in self.llm_service.stream_completion(
                    prompt=prompt,
                    system_message=self.system_message
                ):
                    yield chunk

        except Exception as e:
            logger.error(f"Error in streaming response: {str(e)}")
            yield f"Error generating response: {str(e)}"

    def _format_code_context(self, context_results: List[Dict[str, Any]]) -> str:
        """Format code context results into a readable string with length limits."""
        formatted = []
        total_chars = 0
        max_context_chars = self.max_context_length

        for i, result in enumerate(context_results):
            metadata = result.get("metadata", {})
            file_path = metadata.get("file_path", "Unknown file")
            language = metadata.get("language", "Unknown language")
            content = result.get("content", "")

            # Check if we're approaching the context limit
            entry = f"--- File: {file_path} ({language}) ---\n{content}\n"
            if total_chars + len(entry) > max_context_chars:
                # If this is the first entry, include a truncated version
                if i == 0:
                    available_chars = max_context_chars - len(f"--- File: {file_path} ({language}) ---\n") - 20
                    if available_chars > 100:
                        truncated_content = content[:available_chars] + "... [truncated]"
                        formatted.append(f"--- File: {file_path} ({language}) ---\n{truncated_content}\n")

                break

            formatted.append(entry)
            total_chars += len(entry)

        return "\n".join(formatted)
base_agent = BaseAgent()
