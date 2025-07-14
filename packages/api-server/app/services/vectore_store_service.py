"""Vector store service for RAG capabilities using ChromaDB, optimized for M2 Mac."""
import os
import hashlib
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from app.core.config import settings
import logging
import gc
import threading
import time
logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        # Ensure data directory exists
        os.makedirs("./data/vectordb", exist_ok=True)

        # Configure ChromaDB client with memory-efficient settings
        self.client = chromadb.PersistentClient(
            path="./data/vectordb",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True,
                # Use sqlite WAL mode for better performance
                chroma_db_impl="duckdb+parquet",
                persist_directory="./data/vectordb"
            )
        )

        # Use sentence transformers for embedding (optimized for M2)
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=settings.EMBEDDING_MODEL,
            # Use half precision for better memory usage on M2
            normalize_embeddings=True
        )

        # Track memory usage
        self.memory_monitor = threading.Thread(target=self._monitor_memory_usage, daemon=True)
        self.memory_monitor.start()

        # Create or get the collections
        try:
            self.code_collection = self._get_or_create_collection("code_chunks")
            self.docs_collection = self._get_or_create_collection("documentation")
            logger.info("Vector store collections initialized")
        except Exception as e:
            logger.error(f"Error initializing vector store collections: {str(e)}")
            raise

    def _get_or_create_collection(self, name: str):
        """Get an existing collection or create a new one with optimized settings."""
        try:
            return self.client.get_collection(
                name=name,
                embedding_function=self.embedding_function
            )
        except:
            return self.client.create_collection(
                name=name,
                embedding_function=self.embedding_function,
                metadata={
                    "hnsw:space": "cosine",  # Cosine similarity for code similarity
                    "hnsw:construction_ef": 80,  # Lower for memory efficiency
                    "hnsw:search_ef": 40,     # Lower for faster search
                    "hnsw:M": 8              # Lower for better memory usage
                }
            )

    def _generate_id(self, text: str, prefix: str = "") -> str:
        """Generate a unique ID for a document based on its content."""
        hash_id = hashlib.md5(text.encode()).hexdigest()
        return f"{prefix}{hash_id}" if prefix else hash_id

    def _monitor_memory_usage(self):
        """Monitor memory usage and trigger cleanup if necessary."""
        import time
        import psutil

        while True:
            try:
                process = psutil.Process(os.getpid())
                memory_info = process.memory_info()
                memory_usage_mb = memory_info.rss / 1024 / 1024

                # If memory usage exceeds threshold, trigger garbage collection
                if memory_usage_mb > settings.CACHE_SIZE_MB:
                    logger.warning(f"Memory usage high ({memory_usage_mb:.2f} MB). Triggering cleanup.")
                    gc.collect()
            except Exception as e:
                logger.error(f"Error monitoring memory: {str(e)}")

            time.sleep(60)  # Check every minute

    async def add_code_chunk(self,
                            chunk_text: str,
                            metadata: Dict[str, Any],
                            chunk_id: Optional[str] = None) -> str:
        """Add a code chunk to the vector store."""
        try:
            # Truncate large texts to prevent memory issues
            if len(chunk_text) > 8000:
                logger.warning(f"Truncating large chunk ({len(chunk_text)} chars)")
                chunk_text = chunk_text[:8000] + "... [truncated]"

            chunk_id = chunk_id or self._generate_id(chunk_text, prefix="c_")

            # Add required metadata fields if missing
            if "timestamp" not in metadata:
                metadata["timestamp"] = str(int(time.time()))

            # Add the chunk to the collection
            self.code_collection.add(
                documents=[chunk_text],
                metadatas=[metadata],
                ids=[chunk_id]
            )

            return chunk_id
        except Exception as e:
            logger.error(f"Error adding code chunk to vector store: {str(e)}")
            raise

    async def add_code_chunks_batch(self,
                                   chunks: List[str],
                                   metadatas: List[Dict[str, Any]]) -> List[str]:
        """Add multiple code chunks in a memory-efficient batch process."""
        if not chunks or len(chunks) == 0:
            return []

        try:
            # Generate IDs
            chunk_ids = [self._generate_id(chunk, prefix="c_") for chunk in chunks]

            # Process in memory-efficient batches
            batch_size = min(settings.BATCH_SIZE, 16)  # Further limit batch size for M2
            result_ids = []

            for i in range(0, len(chunks), batch_size):
                batch_end = min(i + batch_size, len(chunks))

                # Truncate large texts to prevent memory issues
                batch_chunks = []
                for chunk in chunks[i:batch_end]:
                    if len(chunk) > 8000:
                        logger.warning(f"Truncating large chunk ({len(chunk)} chars)")
                        batch_chunks.append(chunk[:8000] + "... [truncated]")
                    else:
                        batch_chunks.append(chunk)

                # Add the batch
                self.code_collection.add(
                    documents=batch_chunks,
                    metadatas=metadatas[i:batch_end],
                    ids=chunk_ids[i:batch_end]
                )

                result_ids.extend(chunk_ids[i:batch_end])

                # Force garbage collection after each batch
                if i > 0 and i % (batch_size * 3) == 0:
                    gc.collect()

            return result_ids
        except Exception as e:
            logger.error(f"Error batch adding code chunks: {str(e)}")
            raise

    async def search_code_chunks(self,
                               query: str,
                               n_results: int = 5,
                               filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for relevant code chunks with optimized memory usage."""
        try:
            # Truncate overly long queries
            if len(query) > 1000:
                query = query[:1000]

            # Limit n_results to avoid memory issues
            n_results = min(n_results, 20)

            results = self.code_collection.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_dict,
                include=["documents", "metadatas", "distances", "embeddings"]
            )

            if not results["documents"] or len(results["documents"][0]) == 0:
                return []

            documents = []
            for i, doc in enumerate(results["documents"][0]):
                # Skip empty results
                if not doc:
                    continue

                documents.append({
                    "content": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": float(results["distances"][0][i]) if results["distances"] else None,
                    "id": results["ids"][0][i]
                })

            return documents
        except Exception as e:
            logger.error(f"Error searching code chunks: {str(e)}")
            return []

    async def delete_by_repo(self, repo_name: str) -> int:
        """Delete all chunks from a specific repository."""
        try:
            # First count how many we'll delete (for reporting)
            count_results = self.code_collection.count(
                where={"repo_name": repo_name}
            )

            # Delete the chunks
            self.code_collection.delete(
                where={"repo_name": repo_name}
            )

            # Force cleanup after large deletions
            gc.collect()

            logger.info(f"Deleted {count_results} chunks for repository: {repo_name}")
            return count_results
        except Exception as e:
            logger.error(f"Error deleting repository chunks: {str(e)}")
            return 0

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store collections."""
        try:
            code_count = self.code_collection.count()
            docs_count = self.docs_collection.count()

            return {
                "code_chunks_count": code_count,
                "docs_chunks_count": docs_count,
                "total_chunks": code_count + docs_count
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {"error": str(e)}

# Initialize vector store with memory monitoring
vector_store = VectorStoreService()
