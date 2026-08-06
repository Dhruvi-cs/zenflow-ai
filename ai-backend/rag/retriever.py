from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from rag.config import GOOGLE_API_KEY


embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GOOGLE_API_KEY,
)

db = Chroma(
    persist_directory="vectordb",
    embedding_function=embeddings,
)


def retrieve_documents(query, k=3, category=None):

    if category:
        results = db.similarity_search_with_score(
            query,
            k=k,
            filter={"category": category},
        )
    else:
        results = db.similarity_search_with_score(
            query,
            k=k,
        )

    print("\nRetrieved Documents:\n")

    for i, (doc, score) in enumerate(results, start=1):
        print(f"Result {i}")
        print("Score:", score)
        print("Metadata:", doc.metadata)
        print("Content:", doc.page_content[:200])
        print("-" * 50)

    return results