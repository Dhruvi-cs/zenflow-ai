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
    ticket_id: str
    user_query: str
    category: str | None = None


@app.get("/")
def home():
    return {"message": "ZenFlow AI Backend is running!"}


@app.post("/api/ai/query")
def query_ai(request: QueryRequest):

    try:
        result = ask_chatbot(
            request.user_query,
            request.category,
        )

        logging.info(
            f"Ticket: {request.ticket_id} | "
            f"Query: {request.user_query} | "
            f"Category: {request.category} | "
            f"Confidence: {result['confidence_score']} | "
            f"Sources: {result['retrieved_sources']} | "
            f"Response: {result['response']}"
        )

        return {
            "ticket_id": request.ticket_id,
            "deflected": not result["requires_human_agent"],
            "ai_response": result["response"],
            "confidence_score": result["confidence_score"],
            "retrieved_sources": result["retrieved_sources"],
        }

    except Exception as e:
        logging.error(
            f"Ticket: {request.ticket_id} | "
            f"Query: {request.user_query} | "
            f"Category: {request.category} | "
            f"Error: {str(e)}"
        )

        return {
            "ticket_id": request.ticket_id,
            "deflected": False,
            "ai_response": "AI service temporarily unavailable. Please assign this ticket to a human agent.",
            "confidence_score": None,
            "retrieved_sources": [],
            "error": str(e),
        }