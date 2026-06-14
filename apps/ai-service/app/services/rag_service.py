# apps/ai-service/app/services/rag_service.py
"""
RAG Knowledge Base Service
- Uses ChromaDB for persistent vector storage
- Sentence-Transformers for embeddings (offline-capable)
- Designed for llama.cpp integration context injection
"""

import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Optional
from pathlib import Path

class RAGService:
    def __init__(self, persist_dir: str = "./rag_data"):
        self.persist_dir = persist_dir
        self.collection_name = "campus_knowledge"
        self._client = None
        self._collection = None
        self._initialized = False

    def initialize(self) -> None:
        """Lazy init: load ChromaDB client & embedding model."""
        if self._initialized:
            return
            
        Path(self.persist_dir).mkdir(parents=True, exist_ok=True)
        
        # Use lightweight sentence-transformer model (cached locally)
        embed_model = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        self._client = chromadb.PersistentClient(path=self.persist_dir)
        self._collection = self._client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=embed_model,
            metadata={"hnsw:space": "cosine"}
        )
        self._initialized = True
        print(f"✅ RAG Service initialized (persist: {self.persist_dir})")

    def add_documents(self, documents: List[str], metadatas: Optional[List[Dict]] = None) -> None:
        """Add campus lore, NPC dialogue templates, or quest hints."""
        if not self._initialized:
            self.initialize()
            
        ids = [f"doc_{i}" for i in range(len(documents))]
        self._collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query(self, query_text: str, top_k: int = 3) -> List[str]:
        """Retrieve relevant context for NPC dialogue generation."""
        if not self._initialized:
            self.initialize()
            
        results = self._collection.query(
            query_texts=[query_text],
            n_results=top_k,
            include=["documents", "distances"]
        )
        return results["documents"][0] if results["documents"] else []