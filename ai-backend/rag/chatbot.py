from rag.retriever import retrieve_documents
from rag.generator import generate_response


CONFIDENCE_THRESHOLD = 0.60


def ask_chatbot(question, category=None, chat_history=None):

    if chat_history is None:
        chat_history = []

    # Keep only the last 5 messages
    chat_history = chat_history[-5:]

    # Convert chat history into readable text
    history_text = ""

    for message in chat_history:
        role = message.get("role", "user")
        content = message.get("content", "")

        history_text += f"{role}: {content}\n"

    # Retrieve relevant documents
    results = retrieve_documents(
        question,
        category=category,
    )

    # No relevant documents found
    if not results:
        return {
            "requires_human_agent": True,
            "confidence_score": None,
            "retrieval_distance": None,
            "retrieved_sources": [],
            "response": "CANNOT_ANSWER_ESCALATE_TO_HUMAN",
        }

    docs = []
    scores = []
    sources = []

    for doc, score in results:
        docs.append(doc)
        scores.append(score)

        sources.append(
            doc.metadata.get("title", "Unknown Source")
        )

    # ChromaDB returns distance:
    # lower distance = better semantic match
    best_distance = min(scores)

    # Convert distance into a normalized similarity score
    similarity_score = 1 / (1 + best_distance)

    # Poor semantic match → escalate
    if best_distance > CONFIDENCE_THRESHOLD:
        return {
            "requires_human_agent": True,
            "confidence_score": similarity_score,
            "retrieval_distance": best_distance,
            "retrieved_sources": sources,
            "response": "CANNOT_ANSWER_ESCALATE_TO_HUMAN",
        }

    # Build context
    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )

    # Generate grounded response
    response = generate_response(
        question=question,
        context=context,
        chat_history=history_text,
    )

    # LLM could not answer from context
    if response == "CANNOT_ANSWER_ESCALATE_TO_HUMAN":
        return {
            "requires_human_agent": True,
            "confidence_score": similarity_score,
            "retrieval_distance": best_distance,
            "retrieved_sources": sources,
            "response": response,
        }

    return {
        "requires_human_agent": False,
        "confidence_score": similarity_score,
        "retrieval_distance": best_distance,
        "retrieved_sources": sources,
        "response": response,
    }