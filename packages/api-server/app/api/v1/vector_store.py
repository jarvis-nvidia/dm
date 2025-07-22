"""Vector store and file processing API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from app.services.vectore_store_service import vector_store
from app.services.git_service import git_service
from app.api.deps import get_api_key
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/process-repository")
async def process_repository(
    repo_url: str,
    branch: Optional[str] = "main",
    _: bool = Depends(get_api_key)
):
    """Process a Git repository and index its contents in vector store."""
    try:
        # Clone repository
        repo_path = await git_service.clone_repository(repo_url, branch)
        
        # List files to process
        files = await git_service.list_repository_files(
            repo_path,
            extensions=["py", "js", "ts", "tsx", "jsx", "java", "cpp", "c", "go", "rs"]
        )
        
        processed_files = 0
        total_chunks = 0
        
        # Process each file
        for file_path in files[:10]:  # Limit for demo
            try:
                content, file_ext = await git_service.get_file_content(repo_path, file_path)
                
                metadata = {
                    "repo_url": repo_url,
                    "branch": branch,
                    "file_path": file_path,
                    "file_extension": file_ext
                }
                
                # Process file and store chunks
                async for result in vector_store.process_file_content(file_path, content, metadata):
                    if result['status'] == 'completed':
                        total_chunks += result['total_chunks']
                        processed_files += 1
                        break
                        
            except Exception as e:
                logger.warning(f"Failed to process file {file_path}: {str(e)}")
                continue
        
        # Cleanup repository
        git_service.cleanup_repo(repo_url.split("/")[-1].replace(".git", ""))
        
        return {
            "success": True,
            "message": "Repository processed successfully",
            "data": {
                "repo_url": repo_url,
                "branch": branch,
                "files_processed": processed_files,
                "total_chunks": total_chunks,
                "files_found": len(files)
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing repository: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process repository: {str(e)}"
        )

@router.post("/search")
async def search_code(
    query: str,
    n_results: int = 5,
    project_id: Optional[int] = None,
    file_type: Optional[str] = None,
    _: bool = Depends(get_api_key)
):
    """Search code chunks using vector similarity."""
    try:
        # Build filter
        filter_dict = {}
        if project_id:
            filter_dict["project_id"] = project_id
        if file_type:
            filter_dict["file_extension"] = file_type
            
        # Search vector store
        results = await vector_store.search_code_chunks(
            query=query,
            n_results=n_results,
            filter_dict=filter_dict if filter_dict else None,
            include_metadata=True
        )
        
        return {
            "success": True,
            "message": "Search completed successfully",
            "data": {
                "query": query,
                "results": results,
                "total_found": len(results)
            }
        }
        
    except Exception as e:
        logger.error(f"Error searching code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search code: {str(e)}"
        )

@router.get("/stats")
async def get_vector_store_stats(_: bool = Depends(get_api_key)):
    """Get vector store statistics."""
    try:
        stats = await vector_store.get_collection_stats()
        
        return {
            "success": True,
            "message": "Statistics retrieved successfully",
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Error getting vector store stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )

@router.post("/upload-file")
async def upload_and_process_file(
    file: UploadFile = File(...),
    project_id: Optional[int] = None,
    _: bool = Depends(get_api_key)
):
    """Upload and process a single file."""
    try:
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        metadata = {
            "uploaded_file": True,
            "original_filename": file.filename,
            "project_id": project_id
        }
        
        total_chunks = 0
        
        # Process file content
        async for result in vector_store.process_file_content(file.filename, content_str, metadata):
            if result['status'] == 'completed':
                total_chunks = result['total_chunks']
                break
        
        return {
            "success": True,
            "message": "File processed successfully",
            "data": {
                "filename": file.filename,
                "size": len(content),
                "chunks_created": total_chunks,
                "project_id": project_id
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing uploaded file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )

@router.delete("/repository/{repo_name}")
async def delete_repository_data(repo_name: str, _: bool = Depends(get_api_key)):
    """Delete all vector store data for a repository."""
    try:
        deleted_count = await vector_store.delete_repository_chunks(repo_name)
        
        return {
            "success": True,
            "message": f"Deleted {deleted_count} chunks for repository {repo_name}",
            "data": {
                "repository": repo_name,
                "deleted_chunks": deleted_count
            }
        }
        
    except Exception as e:
        logger.error(f"Error deleting repository data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete repository data: {str(e)}"
        )

@router.post("/ask-context")
async def ask_with_context(
    question: str,
    context_query: Optional[str] = None,
    max_context_chunks: int = 3,
    _: bool = Depends(get_api_key)
):
    """Ask a question with relevant code context from vector store."""
    try:
        from app.services.llm_service import llm_service
        
        # Search for relevant context if query provided
        context_chunks = []
        if context_query:
            search_results = await vector_store.search_code_chunks(
                query=context_query,
                n_results=max_context_chunks,
                include_metadata=True
            )
            context_chunks = [result['content'] for result in search_results]
        
        # Build prompt with context
        if context_chunks:
            context_text = "\n\n".join([f"Context {i+1}:\n```\n{chunk}\n```" for i, chunk in enumerate(context_chunks)])
            prompt = f"""Based on the following code context, please answer the question:

{context_text}

Question: {question}

Please provide a detailed answer based on the code context provided."""
        else:
            prompt = question
        
        # Generate response
        response = await llm_service.generate_completion(
            prompt=prompt,
            system_message="You are an expert software engineer. Answer questions about code clearly and concisely.",
            temperature=0.2
        )
        
        if response and "choices" in response and response["choices"]:
            answer = response["choices"][0]["message"]["content"].strip()
        else:
            answer = "I'm unable to provide a detailed answer at the moment. The AI service may not be available."
        
        return {
            "success": True,
            "message": "Question answered successfully",
            "data": {
                "question": question,
                "answer": answer,
                "context_used": len(context_chunks),
                "context_query": context_query
            }
        }
        
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {str(e)}"
        )