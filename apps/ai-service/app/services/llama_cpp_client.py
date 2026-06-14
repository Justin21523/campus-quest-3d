# apps/ai-service/app/services/llama_cpp_client.py
"""
llama.cpp HTTP Client Wrapper
- OpenAI-compatible /v1/chat/completions endpoint
- Streaming support (optional)
- Health check & GPU stats polling
"""

import httpx
import asyncio
from typing import Optional, Dict, Any, AsyncGenerator
from pydantic import BaseModel, Field

class LlamaCppConfig(BaseModel):
    base_url: str = Field(default="http://localhost:8080/v1")
    model: str = Field(default="qwen2.5-7b-instruct")
    timeout: float = Field(default=45.0)
    max_retries: int = Field(default=2)
    retry_delay_ms: int = Field(default=100)

class LlamaCppClient:
    def __init__(self, config: Optional[LlamaCppConfig] = None):
        self.config = config or LlamaCppConfig()
        self._client: Optional[httpx.AsyncClient] = None
        self._initialized = False
    
    async def _ensure_client(self) -> httpx.AsyncClient:
        if not self._initialized:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.config.timeout),
                headers={"Content-Type": "application/json"}
            )
            self._initialized = True
        assert self._client is not None
        return self._client
    
    async def chat_completion(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 512,
        stream: bool = False
    ) -> str | AsyncGenerator[str, None]:
        """
        Call llama.cpp /v1/chat/completions endpoint.
        Returns: str (non-stream) or AsyncGenerator[str] (stream)
        """
        client = await self._ensure_client()
        payload = {
            "model": self.config.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        for attempt in range(self.config.max_retries + 1):
            try:
                response = await client.post(
                    f"{self.config.base_url}/chat/completions",
                    json=payload
                )
                response.raise_for_status()
                
                if stream:
                    return self._stream_parser(response)
                
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
                
            except httpx.HTTPError as e:
                if attempt == self.config.max_retries:
                    raise
                await asyncio.sleep(self.config.retry_delay_ms * (attempt + 1) / 1000)
    
    async def _stream_parser(self, response: httpx.Response) -> AsyncGenerator[str, None]:
        """Parse SSE stream from llama.cpp"""
        async for line in response.aiter_lines():
            if line.startswith("data: "):
                data = line[6:].strip()
                if data == "[DONE]":
                    break
                try:
                    import json
                    chunk = json.loads(data)
                    content = chunk["choices"][0]["delta"].get("content", "")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue
    
    async def get_health(self) -> Dict[str, Any]:
        """Poll llama.cpp /health endpoint for GPU/stats info"""
        client = await self._ensure_client()
        try:
            # llama.cpp server exposes /health at root, not /v1
            base = self.config.base_url.replace("/v1", "")
            response = await client.get(f"{base}/health")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._initialized = False