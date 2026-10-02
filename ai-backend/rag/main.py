import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

# Import chatbot logic if available in the same directory
try:
    from rag.chatbot import get_rag_response
except ImportError:
    try:
        from chatbot import get_rag_response
    except ImportError:
        get_rag_response = None

app = FastAPI(title="ZenFlow AI Microservice")

# 1. Configure CORS Middleware
# Explicitly allowing frontend origins (Live Server & Node.js backend)
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "*"  # Wildcard allows preflight and direct browser requests during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],            # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],            # Allows Content-Type and custom headers
)

# 2. Request / Response Schemas
class QueryRequest(BaseModel):
    query: str
    category: str = "General"

class QueryResponse(BaseModel):
    answer: str
    category: str = "General"
    status: str = "success"

# 3. Endpoints
@app.get("/")
def read_root():
    return {"status": "online", "service": "ZenFlow AI RAG Microservice"}

@app.post("/api/v1/rag/query", response_model=QueryResponse)
async def query_rag(payload: QueryRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # Call chatbot / RAG pipeline if imported, otherwise return model fallback
        if get_rag_response:
            ai_answer = get_rag_response(payload.query, payload.category)
        else:
            ai_answer = f"Received query: '{payload.query}'. Context matching is active."

        return QueryResponse(
            answer=ai_answer,
            category=payload.category,
            status="success"
        )
    except Exception as e:
        print(f"Error executing RAG query: {e}")
        return QueryResponse(
            answer="AI service is currently processing, but encountered an internal retrieval error.",
            category=payload.category,
            status="error"
        )