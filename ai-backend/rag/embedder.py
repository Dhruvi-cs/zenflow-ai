from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

from loader import load_documents
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import GOOGLE_API_KEY


def create_chunks():

    documents = load_documents()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(documents)

    return chunks


def create_vector_db():

    chunks = create_chunks()

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY
    )


    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="vectordb"
    )


    print("Vector database created successfully!")


if __name__ == "__main__":
    create_vector_db()