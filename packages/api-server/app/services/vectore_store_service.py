"""Vector store service for RAG capabilities using ChromaDB, optimized for M2 Mac."""
import os
import hashlib
from typing import List, Dict, Any, Optional, AsyncGenerator
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from app.core.config import settings
from app.services.chunky import chunking_strategy, CodeChunk
import logging
import gc
import threading
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        # Initialize directories
        os.makedirs("./data/vectordb", exist_ok=True)
        os.makedirs("./data/cache", exist_ok=True)

        # Configure ChromaDB client with optimized settings
        self.client = chromadb.PersistentClient(
            path="./data/vectordb"
        )

        # Initialize embedding function with default
        try:
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=settings.EMBEDDING_MODEL
            )
        except Exception as e:
            logger.warning(f"Failed to initialize SentenceTransformer embedding: {e}")
            # Use default embedding function as fallback
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()

        # Initialize collections with optimized settings
        self.collections = {
            'code': self._get_or_create_collection("code_chunks"),
            'docs': self._get_or_create_collection("documentation"),
            'metadata': self._get_or_create_collection("chunk_metadata")
        }

        # Start memory monitoring
        self._start_memory_monitor()

    def _start_memory_monitor(self):
        """Start memory monitoring thread."""
        self.memory_monitor = threading.Thread(
            target=self._monitor_memory_usage,
            daemon=True
        )
        self.memory_monitor.start()

    async def process_file_content(
        self,
        file_path: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process file content and store chunks in vector store."""
        try:
            chunk_counter = 0
            async for chunk in chunking_strategy.process_file(file_path, content, metadata):
                chunk_id = await self._store_chunk(chunk)
                chunk_counter += 1

                # Yield progress information
                yield {
                    'status': 'processing',
                    'chunk_id': chunk_id,
                    'progress': chunk_counter,
                    'file_path': file_path
                }

            # Yield completion status
            yield {
                'status': 'completed',
                'total_chunks': chunk_counter,
                'file_path': file_path
            }

        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            yield {
                'status': 'error',
                'error': str(e),
                'file_path': file_path
            }

    async def _store_chunk(self, chunk: CodeChunk) -> str:
        """Store a code chunk in the vector store."""
        try:
            # Generate chunk ID
            chunk_id = self._generate_chunk_id(chunk)

            # Prepare chunk data
            document = chunk.content
            metadata = {
                **chunk.metadata,
                'chunk_type': chunk.chunk_type,
                'language': chunk.language,
                'start_line': chunk.start_line,
                'end_line': chunk.end_line,
                'semantic_score': chunk.semantic_score,
                'complexity': chunk.complexity
            }

            # Store imports and dependencies in metadata collection
            if chunk.imports or chunk.dependencies:
                self.collections['metadata'].upsert(
                    ids=[f"{chunk_id}_meta"],
                    documents=[str({
                        'imports': chunk.imports,
                        'dependencies': chunk.dependencies
                    })],
                    metadatas=[{'chunk_id': chunk_id}]
                )

            # Store the main chunk
            self.collections['code'].upsert(
                ids=[chunk_id],
                documents=[document],
                metadatas=[metadata]
            )

            return chunk_id

        except Exception as e:
            logger.error(f"Error storing chunk: {str(e)}")
            raise

    async def search_code_chunks(
        self,
        query: str,
        n_results: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None,
        include_metadata: bool = True
    ) -> List[Dict[str, Any]]:
        """Search for relevant code chunks with enhanced metadata."""
        try:
            # Limit n_results for memory efficiency
            n_results = min(n_results, 20)

            # Perform the search
            results = self.collections['code'].query(
                query_texts=[query],
                n_results=n_results,
                where=filter_dict,
                include=['documents', 'metadatas', 'distances']
            )

            if not results['documents'] or len(results['documents'][0]) == 0:
                return []

            # Process results
            documents = []
            for i, doc in enumerate(results['documents'][0]):
                chunk_data = {
                    'content': doc,
                    'metadata': results['metadatas'][0][i],
                    'distance': float(results['distances'][0][i]),
                    'id': results['ids'][0][i]
                }

                # Include additional metadata if requested
                if include_metadata:
                    await self._enrich_chunk_metadata(chunk_data)

                documents.append(chunk_data)

            return documents

        except Exception as e:
            logger.error(f"Error searching code chunks: {str(e)}")
            return []

    async def _enrich_chunk_metadata(self, chunk_data: Dict[str, Any]):
        """Enrich chunk data with additional metadata."""
        try:
            meta_results = self.collections['metadata'].query(
                query_texts=[chunk_data['id']],
                where={'chunk_id': chunk_data['id']},
                n_results=1
            )

            if meta_results['documents'] and meta_results['documents'][0]:
                import ast
                additional_meta = ast.literal_eval(meta_results['documents'][0][0])
                chunk_data['metadata'].update(additional_meta)

        except Exception as e:
            logger.error(f"Error enriching chunk metadata: {str(e)}")

    def _generate_chunk_id(self, chunk: CodeChunk) -> str:
        """Generate a unique ID for a chunk."""
        content_hash = hashlib.md5(chunk.content.encode()).hexdigest()
        return f"c_{content_hash}_{chunk.start_line}_{chunk.end_line}"

    def _get_or_create_collection(self, name: str):
        """Get or create a collection with optimized settings."""
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
                    'hnsw:space': 'cosine',
                    'hnsw:construction_ef': 80,
                    'hnsw:search_ef': 40,
                    'hnsw:M': 8
                }
            )

    async def delete_repository_chunks(self, repo_name: str) -> int:
        """Delete all chunks from a specific repository."""
        try:
            # Count chunks to be deleted
            count = self.collections['code'].count(
                where={'repo_name': repo_name}
            )

            # Delete chunks and their metadata
            chunks = self.collections['code'].get(
                where={'repo_name': repo_name},
                include=['ids']
            )

            if chunks['ids']:
                # Delete from code collection
                self.collections['code'].delete(
                    where={'repo_name': repo_name}
                )

                # Delete associated metadata
                meta_ids = [f"{chunk_id}_meta" for chunk_id in chunks['ids']]
                self.collections['metadata'].delete(
                    ids=meta_ids
                )

            # Force cleanup
            gc.collect()

            return count

        except Exception as e:
            logger.error(f"Error deleting repository chunks: {str(e)}")
            return 0

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get detailed statistics about the vector store collections."""
        try:
            stats = {
                'code_chunks': self.collections['code'].count(),
                'documentation': self.collections['docs'].count(),
                'metadata': self.collections['metadata'].count(),
                'total_chunks': 0,
                'languages': {},
                'chunk_types': {}
            }

            # Calculate total
            stats['total_chunks'] = sum(
                count for key, count in stats.items()
                if key in ['code_chunks', 'documentation']
            )

            # Get language and chunk type distribution
            code_chunks = self.collections['code'].get(
                include=['metadatas'],
                limit=1000  # Sample size for performance
            )

            if code_chunks['metadatas']:
                for metadata in code_chunks['metadatas']:
                    lang = metadata.get('language', 'unknown')
                    chunk_type = metadata.get('chunk_type', 'unknown')

                    stats['languages'][lang] = stats['languages'].get(lang, 0) + 1
                    stats['chunk_types'][chunk_type] = stats['chunk_types'].get(chunk_type, 0) + 1

            return stats

        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {'error': str(e)}

    def _monitor_memory_usage(self):
        """Monitor memory usage and trigger cleanup if necessary."""
        import psutil
        while True:
            try:
                process = psutil.Process(os.getpid())
                memory_info = process.memory_info()
                memory_usage_mb = memory_info.rss / 1024 / 1024

                if memory_usage_mb > settings.CACHE_SIZE_MB:
                    logger.warning(f"Memory usage high ({memory_usage_mb:.2f} MB). Triggering cleanup.")
                    gc.collect()

            except Exception as e:
                logger.error(f"Error monitoring memory: {str(e)}")

            time.sleep(60)  # Check every minute

# Initialize vector store service
vector_store = VectorStoreService()
