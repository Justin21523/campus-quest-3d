# apps/ai-service/app/services/llm_service.py
"""
LLM Service Abstraction Layer
- Local-first strategy: Ollama/Qwen via HTTP API
- Optional remote fallback (disabled by default)
- Lazy initialization: model loaded only on first request
"""

import os
import httpx
import asyncio
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.services.llama_cpp_client import LlamaCppClient, LlamaCppConfig

# Configuration via environment variables (local-first, fallback optional)
class LLMConfig(BaseModel):
    # llama.cpp server settings (OpenAI-compatible)
    local_base_url: str = Field(default="http://localhost:8080/v1")
    local_model: str = Field(default="qwen2.5-7b-instruct")  # or llama3.1, etc.
    local_timeout: float = Field(default=45.0)
    llama_cpp: LlamaCppConfig = Field(default_factory=LlamaCppConfig)

    # Remote fallback (DISABLED by default per user requirement)
    enable_remote_fallback: bool = Field(default=False)
    enable_streaming: bool = Field(default=False)  # For future WebSocket support
    remote_api_key: Optional[str] = Field(default=None)
    remote_base_url: Optional[str] = Field(default=None)
    remote_model: Optional[str] = Field(default=None)
    
    # Generation params
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=512)
    
    # RAG integration toggle
    enable_rag_context: bool = Field(default=True)
    rag_context_top_k: int = Field(default=2)

    class Config:
        env_prefix = "LLM_"  # Allow override via LLM_LOCAL_BASE_URL etc.


class LLMService:
    """
    Abstract LLM service with lazy initialization.
    Thread-safe lazy init via asyncio.Lock.
    """
    
    _instance: Optional["LLMService"] = None
    _init_lock: asyncio.Lock = asyncio.Lock()
    
    def __init__(self, config: Optional[LLMConfig] = None):
        self.config = config or LLMConfig()
        self._client: Optional[httpx.AsyncClient] = None
        self._initialized = False
    
    @classmethod
    async def get_instance(cls) -> "LLMService":
        """Singleton accessor with lazy init."""
        if cls._instance is None:
            async with cls._init_lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance
    
    async def _ensure_initialized(self) -> None:
        """Lazy initialization: create HTTP client on first use."""
        if self._initialized:
            return
        async with self._init_lock:
            if self._initialized:
                return
            # Initialize async HTTP client with timeouts
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.config.local_timeout),
                headers={"Content-Type": "application/json"}
            )
            self._initialized = True
            # NOTE: No model loading here - Ollama handles model lifecycle
    

    async def _generate_local(self, prompt: str, context: Dict[str, Any]) -> str:
        """Generate response via llama.cpp client."""
        # Lazy init client
        client = LlamaCppClient(self.config.llama_cpp)
        
        # Build messages with RAG context
        system_prompt = "You are an NPC in Campus Quest 3D RPG. Stay in character. Keep responses concise (max 3 sentences)."
        
        if self.config.enable_rag_context:
            try:
                from app.services.rag_service import RAGService
                rag = RAGService()
                retrieved = rag.query(f"NPC topic: {prompt} context: {context}")
                if retrieved:
                    system_prompt += "\n\n[Retrieved Campus Knowledge]\n" + "\n".join(retrieved)
            except Exception as e:
                print(f"⚠️ RAG query failed (graceful fallback): {e}")
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        try:
            reply = await client.chat_completion(
                messages=messages,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                stream=False  # Keep non-stream for now; streaming needs WebSocket
            )
            return str(reply)  # Type guard
        finally:
            await client.close()
            
    async def generate_response(
        self, 
        prompt: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Main entry point: generate LLM response with fallback strategy.
        Priority: local model → (optional) remote fallback → mock fallback.
        """
        context = context or {}
        
        try:
            return await self._generate_local(prompt, context)
        except Exception as local_err:
            print(f"⚠️ Local LLM failed: {local_err}")
            
            if self.config.enable_remote_fallback:
                try:
                    print("🔄 Trying remote fallback...")
                    return await self._generate_remote(prompt, context)
                except Exception as remote_err:
                    print(f"⚠️ Remote fallback failed: {remote_err}")
            
            # Final mock fallback for development
            print("🧪 Using mock response (fallback)")
            return f"[Mock] I heard you say: '{prompt}'. (Local LLM unavailable)"
    
    async def close(self) -> None:
        """Cleanup: close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._initialized = False