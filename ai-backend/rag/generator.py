from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from rag.config import GOOGLE_API_KEY


SYSTEM_PROMPT = """
You are ZenFlow's AI Support Assistant.

Use ONLY the provided context to answer the user's question.

You may use the conversation history to understand what the user is referring to,
but you must NEVER use information from the conversation history as factual
knowledge unless it is supported by the provided context.

If the context does not contain enough information to answer the question, reply with exactly:

CANNOT_ANSWER_ESCALATE_TO_HUMAN

Do not invent or assume any information.

Conversation History:
{chat_history}

Context:
{context}

Current Question:
{question}
"""


llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    google_api_key=GOOGLE_API_KEY,
)


prompt = ChatPromptTemplate.from_template(SYSTEM_PROMPT)


def generate_response(question, context, chat_history=""):

    messages = prompt.format_messages(
        chat_history=chat_history,
        context=context,
        question=question,
    )

    response = llm.invoke(messages)

    content = response.content

    if isinstance(content, list):
        return "".join(
            item.get("text", "")
            for item in content
            if isinstance(item, dict)
        ).strip()

    return str(content).strip()