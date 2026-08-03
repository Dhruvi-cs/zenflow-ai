from langchain_community.document_loaders import PyPDFLoader


def load_documents():
    pdf_path = "data/faq.pdf"

    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    return documents


if __name__ == "__main__":
    docs = load_documents()

    print("Number of pages:", len(docs))
    print("\nFirst page content:")
    print(docs[0].page_content[:500])