from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import motor.motor_asyncio
import weaviate
import openai
import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt

# Load environment variables
load_dotenv()

app = FastAPI(title="DevMind AI Assistant", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database and AI clients setup
MONGO_URL = os.getenv("MONGO_URL")
XAI_API_KEY = os.getenv("XAI_API_KEY")
WEAVIATE_URL = os.getenv("WEAVIATE_URL", "http://localhost:8080")

# MongoDB setup
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = mongo_client.devmind

# Weaviate setup
weaviate_client = weaviate.Client(url=WEAVIATE_URL)

# OpenAI/Grok setup
openai.api_key = XAI_API_KEY
openai.base_url = "https://api.x.ai/v1/"

# Pydantic Models
class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    file_path: Optional[str] = None
    context: Optional[str] = None

class CommitAnalysisRequest(BaseModel):
    diff: str
    files_changed: List[str]
    project_context: Optional[str] = None

class DebugRequest(BaseModel):
    error_message: str
    code_context: str
    language: str
    stack_trace: Optional[str] = None

class CodeEmbeddingRequest(BaseModel):
    code: str
    file_path: str
    language: str
    project_id: str

class SimilarCodeSearchRequest(BaseModel):
    query_code: str
    language: Optional[str] = None
    limit: int = 5

class ProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    repository_url: Optional[str] = None

# Initialize Weaviate schema
async def init_weaviate_schema():
    try:
        # Create CodeSnippet class if it doesn't exist
        existing_classes = weaviate_client.schema.get()['classes']
        class_names = [cls['class'] for cls in existing_classes]
        
        if 'CodeSnippet' not in class_names:
            code_snippet_class = {
                "class": "CodeSnippet",
                "vectorizer": "none",
                "properties": [
                    {"name": "code", "dataType": ["text"]},
                    {"name": "file_path", "dataType": ["text"]},
                    {"name": "language", "dataType": ["text"]},
                    {"name": "project_id", "dataType": ["text"]},
                    {"name": "created_at", "dataType": ["date"]},
                ]
            }
            weaviate_client.schema.create_class(code_snippet_class)
            print("Created CodeSnippet class in Weaviate")
    except Exception as e:
        print(f"Error initializing Weaviate schema: {e}")

# AI Helper Functions
@retry(stop=stop_after_attempt(3))
async def get_grok_analysis(prompt: str, system_message: str = "You are an expert code analyst."):
    try:
        response = openai.chat.completions.create(
            model="grok-3",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grok API error: {str(e)}")

async def get_code_embedding(code: str):
    """Generate embedding for code using a simple approach (in production, use proper embeddings)"""
    # This is a placeholder - in production, you'd use a proper embedding model
    # For now, we'll create a simple hash-based embedding
    import hashlib
    hash_obj = hashlib.md5(code.encode())
    hex_dig = hash_obj.hexdigest()
    
    # Convert hex to float array (simplified approach)
    embedding = []
    for i in range(0, len(hex_dig), 2):
        embedding.append(float(int(hex_dig[i:i+2], 16)) / 255.0)
    
    # Pad or truncate to fixed size (e.g., 128)
    while len(embedding) < 128:
        embedding.append(0.0)
    return embedding[:128]

# API Endpoints

@app.on_event("startup")
async def startup_event():
    await init_weaviate_schema()
    print("DevMind backend started successfully!")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "DevMind backend is running"}

# Project Management
@app.post("/api/projects")
async def create_project(project: ProjectRequest):
    try:
        project_data = {
            "id": str(uuid.uuid4()),
            "name": project.name,
            "description": project.description,
            "repository_url": project.repository_url,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.projects.insert_one(project_data)
        return {"id": project_data["id"], "message": "Project created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def get_projects():
    try:
        projects = []
        async for project in db.projects.find():
            project["_id"] = str(project["_id"])
            projects.append(project)
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Code Analysis
@app.post("/api/code/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        analysis_prompt = f"""Analyze the following {request.language} code for:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance optimizations
4. Security concerns
5. Maintainability suggestions

Code:
```{request.language}
{request.code}
```

File Path: {request.file_path or "Not specified"}
Context: {request.context or "No additional context provided"}

Provide a detailed analysis with specific recommendations."""

        analysis = await get_grok_analysis(analysis_prompt, 
            "You are an expert code reviewer and analyzer. Provide detailed, actionable feedback.")
        
        # Store analysis in database
        analysis_data = {
            "id": str(uuid.uuid4()),
            "code": request.code,
            "language": request.language,
            "file_path": request.file_path,
            "analysis": analysis,
            "created_at": datetime.utcnow()
        }
        await db.code_analyses.insert_one(analysis_data)
        
        return {"analysis": analysis, "analysis_id": analysis_data["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Commit Analysis and Storytelling
@app.post("/api/commits/analyze")
async def analyze_commit(request: CommitAnalysisRequest):
    try:
        commit_prompt = f"""Analyze this code diff and create a comprehensive commit story:

Diff:
{request.diff}

Files Changed: {', '.join(request.files_changed)}
Project Context: {request.project_context or "No context provided"}

Please provide:
1. A concise commit message (50 chars max for title)
2. Detailed description of changes
3. Why these changes were made (intent/reasoning)
4. Which modules/components are affected
5. Who should review this (suggested reviewers based on changes)
6. Potential impact on the system
7. Testing recommendations

Format the response as a commit story that tells the complete narrative."""

        story = await get_grok_analysis(commit_prompt,
            "You are an expert at analyzing code changes and creating meaningful commit stories.")
        
        # Store commit analysis
        commit_data = {
            "id": str(uuid.uuid4()),
            "diff": request.diff,
            "files_changed": request.files_changed,
            "story": story,
            "created_at": datetime.utcnow()
        }
        await db.commit_analyses.insert_one(commit_data)
        
        return {"commit_story": story, "analysis_id": commit_data["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Debugging Assistant
@app.post("/api/debug/session")
async def debug_assistance(request: DebugRequest):
    try:
        debug_prompt = f"""Help debug this {request.language} error:

Error Message: {request.error_message}

Code Context:
```{request.language}
{request.code_context}
```

Stack Trace: {request.stack_trace or "Not provided"}

Please provide:
1. Root cause analysis
2. Step-by-step debugging approach
3. Specific fix recommendations
4. Prevention strategies for similar issues
5. Testing suggestions to verify the fix

Be specific and actionable in your recommendations."""

        debug_response = await get_grok_analysis(debug_prompt,
            "You are an expert debugging assistant. Provide clear, actionable solutions.")
        
        # Store debugging session
        debug_data = {
            "id": str(uuid.uuid4()),
            "error_message": request.error_message,
            "code_context": request.code_context,
            "language": request.language,
            "debug_response": debug_response,
            "created_at": datetime.utcnow()
        }
        await db.debug_sessions.insert_one(debug_data)
        
        return {"debug_suggestions": debug_response, "session_id": debug_data["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vector Database Operations
@app.post("/api/embeddings/store")
async def store_code_embedding(request: CodeEmbeddingRequest):
    try:
        # Generate embedding for the code
        embedding = await get_code_embedding(request.code)
        
        # Store in Weaviate
        weaviate_client.data_object.create(
            data_object={
                "code": request.code,
                "file_path": request.file_path,
                "language": request.language,
                "project_id": request.project_id,
                "created_at": datetime.utcnow().isoformat()
            },
            class_name="CodeSnippet",
            vector=embedding
        )
        
        return {"message": "Code embedding stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/code/search-similar")
async def search_similar_code(request: SimilarCodeSearchRequest):
    try:
        # Generate embedding for query code
        query_embedding = await get_code_embedding(request.query_code)
        
        # Search in Weaviate
        where_filter = None
        if request.language:
            where_filter = {
                "path": ["language"],
                "operator": "Equal",
                "valueText": request.language
            }
        
        query_builder = (
            weaviate_client.query
            .get("CodeSnippet", ["code", "file_path", "language", "project_id"])
            .with_near_vector({"vector": query_embedding})
            .with_limit(request.limit)
        )
        
        if where_filter:
            query_builder = query_builder.with_where(where_filter)
        
        response = query_builder.do()
        
        results = response.get('data', {}).get('Get', {}).get('CodeSnippet', [])
        return {"similar_code": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Learning and Patterns
@app.get("/api/learn/patterns/{project_id}")
async def get_learning_patterns(project_id: str):
    try:
        # Get debugging patterns for a project
        debug_sessions = []
        async for session in db.debug_sessions.find({"project_id": project_id}):
            session["_id"] = str(session["_id"])
            debug_sessions.append(session)
        
        # Get code analysis patterns
        analyses = []
        async for analysis in db.code_analyses.find({"project_id": project_id}):
            analysis["_id"] = str(analysis["_id"])
            analyses.append(analysis)
        
        # Analyze patterns using AI
        if debug_sessions or analyses:
            pattern_prompt = f"""Analyze these debugging sessions and code analyses to identify patterns:

Debug Sessions: {len(debug_sessions)} sessions
Code Analyses: {len(analyses)} analyses

Based on this data, identify:
1. Common bug patterns
2. Frequently occurring code issues
3. Developer coding style preferences
4. Areas for improvement
5. Personalized recommendations

Provide insights that can help improve the developer's workflow."""

            patterns = await get_grok_analysis(pattern_prompt,
                "You are an expert at identifying developer patterns and providing personalized insights.")
            
            return {"patterns": patterns, "sessions_count": len(debug_sessions), "analyses_count": len(analyses)}
        else:
            return {"patterns": "Not enough data to identify patterns yet.", "sessions_count": 0, "analyses_count": 0}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)