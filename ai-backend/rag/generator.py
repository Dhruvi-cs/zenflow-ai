from xml.parsers.expat import model

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from rag.config import GOOGLE_API_KEY


SYSTEM_PROMPT = """
You are ZenFlow's AI Support Assistant.

Use ONLY the provided context to answer the user's question.

If the context does not contain enough information, reply with exactly:

CANNOT_ANSWER_ESCALATE_TO_HUMAN

Do not invent or assume any information.

Context:
{context}

Question:
{question}
"""


llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0,
)

prompt = ChatPromptTemplate.from_template(SYSTEM_PROMPT)

def generate_response(question, context):

    messages = prompt.format_messages(
        context=context,
        question=question
    )

    response = llm.invoke(messages)

    return response.content