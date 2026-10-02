import json
import os

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

from backend.rag.config import GOOGLE_API_KEY


# Paths
FAQ_PATH = "backend/data/faqs/faq.json"
VECTOR_DB_PATH = "backend/vectordb"


def load_faqs():

    with open(FAQ_PATH, "r", encoding="utf-8") as file:
        faqs = json.load(file)

    return faqs



def create_documents():

    faqs = load_faqs()

    documents = []

    for faq in faqs:

        text = f"""
        Title: {faq['title']}
        Category: {faq['category']}
        Question: {faq['question']}
        Answer: {faq['answer']}
        """

        documents.append(
            {
                "text": text,
                "metadata": {
                    "title": faq["title"],
                    "category": faq["category"]
                }
            }
        )

    return documents



def ingest():

    raw_documents = create_documents()


    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )


    texts = []
    metadatas = []


    for doc in raw_documents:

        chunks = splitter.split_text(doc["text"])

        for chunk in chunks:
            texts.append(chunk)
            metadatas.append(doc["metadata"])



    print("Total chunks:", len(texts))


    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY
    )


    Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory=VECTOR_DB_PATH
    )


    print("✅ Vector database created successfully!")


if __name__ == "__main__":
    ingest()