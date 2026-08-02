from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from backend.rag.config import GOOGLE_API_KEY

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GOOGLE_API_KEY
)

db = Chroma(
    persist_directory="backend/vectordb",
    embedding_function=embeddings
)

query = "How do I reset my password?"

results = db.similarity_search(query, k=3)

print("\nTop 3 Results:\n")

for i, doc in enumerate(results, start=1):
    print(f"Result {i}")
    print("-" * 40)
    print(doc.page_content)
    print("Metadata:", doc.metadata)
    print()