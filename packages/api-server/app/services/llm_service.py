"""
LLM Service for DevMind.
Provides integration with Groq API with memory-efficient streaming capabilities.
"""
import os
import json
import httpx
from typing import Dict, Any, AsyncGenerator, List, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.max_tokens = settings.MAX_TOKENS
        self.temperature = settings.TEMPERATURE
        self.base_url = "https://api.groq.com/v1"

        # Validate configuration
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set. LLM functionality will be limited.")

    async def generate_completion(self,
                                 prompt: str,
                                 system_message: Optional[str] = None,
                                 temperature: Optional[float] = None) -> Dict[str, Any]:
        """Generate a completion response for the given prompt."""
        if not self.api_key:
            return self._mock_completion_response(prompt)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})

        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": temperature if temperature is not None else self.temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Groq API: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request error when calling Groq API: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling Groq API: {str(e)}")
            raise

    async def stream_completion(self,
                               prompt: str,
                               system_message: Optional[str] = None,
                               temperature: Optional[float] = None) -> AsyncGenerator[str, None]:
        """Stream a completion response for the given prompt."""
        if not self.api_key:
            yield "No API key configured. Please set GROQ_API_KEY in environment variables."
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})

        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": temperature if temperature is not None else self.temperature,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    buffer = ""

                    async for line in response.aiter_lines():
                        if not line or line == "data: [DONE]":
                            continue

                        if line.startswith("data: "):
                            try:
                                chunk = json.loads(line[6:])
                                content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")

                                if content:
                                    buffer += content
                                    # Yield in larger chunks to reduce overhead
                                    if len(buffer) >= 80:
                                        yield buffer
                                        buffer = ""
                            except json.JSONDecodeError:
                                continue

                    # Yield any remaining content in buffer
                    if buffer:
                        yield buffer
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Groq API: {e.response.status_code} - {e.response.text}")
            yield f"Error: API returned {e.response.status_code}"
        except httpx.RequestError as e:
            logger.error(f"Request error when calling Groq API: {str(e)}")
            yield f"Error: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error in stream_completion: {str(e)}")
            yield f"Error: {str(e)}"

    def _mock_completion_response(self, prompt: str) -> Dict[str, Any]:
        """Generate a mock response for local development without API key."""
        return {
            "id": "mock-completion",
            "object": "chat.completion",
            "created": 1689315735,
            "model": "mock-model",
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": f"This is a mock response as no API key is configured. Your prompt was: {prompt[:100]}..."
                },
                "index": 0,
                "finish_reason": "mock"
            }]
        }

# Initialize LLM service
llm_service = LLMService()
