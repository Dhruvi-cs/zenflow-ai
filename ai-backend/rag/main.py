import logging

from fastapi import FastAPI
from pydantic import BaseModel

from rag.chatbot import ask_chatbot


logging.basicConfig(
    filename="logs/ai_requests.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
)


app = FastAPI(
    title="ZenFlow AI Backend",
    version="1.0.0"
)


class QueryRequest(BaseModel):
    query: str
    category: str | None = None


@app.get("/")
def home():
    return {
        "message": "ZenFlow AI Backend is running!"
    }


@app.post("/api/v1/rag/query")
def query_rag(request: QueryRequest):

    try:
        result = ask_chatbot(
            request.query,
            request.category
        )

        logging.info(
            f"Query: {request.query} | "
            f"Category: {request.category} | "
            f"Confidence: {result['confidence_score']} | "
            f"Retrieval Distance: {result['retrieval_distance']} | "
            f"Sources: {result['retrieved_sources']} | "
            f"Response: {result['response']}"
        )

        return {
            "answer": result["response"],
            "sources": result["retrieved_sources"],
            "confidence_score": result["confidence_score"],
            "retrieval_distance": result["retrieval_distance"],
            "can_deflect": not result["requires_human_agent"]
        }

    except Exception as e:

        logging.error(
            f"Query: {request.query} | "
            f"Category: {request.category} | "
            f"Error: {str(e)}"
        )

        return {
            "answer": "AI service temporarily unavailable. Please connect with a human support agent.",
            "sources": [],
            "confidence_score": None,
            "retrieval_distance": None,
            "can_deflect": False
        }