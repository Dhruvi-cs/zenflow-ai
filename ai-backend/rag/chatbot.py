from rag.retriever import retrieve_documents
from rag.generator import generate_response

CONFIDENCE_THRESHOLD = 0.60


def ask_chatbot(question, category=None):

    # Retrieve relevant documents
    results = retrieve_documents(
        question,
        category=category,
    )

    docs = []
    scores = []
    sources = []

    for doc, score in results:
        docs.append(doc)
        scores.append(score)
        sources.append(doc.metadata.get("title", "Unknown Source"))

    # Best similarity score
    best_score = min(scores)

    # If confidence is low, escalate to human
    if best_score > CONFIDENCE_THRESHOLD:
        return {
            "requires_human_agent": True,
            "confidence_score": best_score,
            "retrieved_sources": sources,
            "response": "CANNOT_ANSWER_ESCALATE_TO_HUMAN",
        }

    # Build context for the LLM
    context = "\n\n".join(doc.page_content for doc in docs)

    # Generate AI response
    response = generate_response(question, context)

    return {
        "requires_human_agent": False,
        "confidence_score": best_score,
        "retrieved_sources": sources,
        "response": response,
    }