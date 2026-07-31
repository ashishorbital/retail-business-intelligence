import argparse
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions
from modules.rag.ingest import ingest_all

BASE_DIR = Path(__file__).resolve().parent.parent.parent
VECTOR_STORE_DIR = BASE_DIR / "data" / "vector_store"

def get_chroma_client():
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(VECTOR_STORE_DIR))

def get_collection(client):
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    collection = client.get_or_create_collection(name="shelfsense_rag", embedding_function=emb_fn)
    return collection

def build_index():
    print("Ingesting data chunks...")
    chunks = ingest_all()
    if not chunks:
        print("No chunks found to ingest.")
        return

    print(f"Loaded {len(chunks)} chunks. Initializing Vector Store...")
    client = get_chroma_client()
    collection = get_collection(client)

    ids = [chunk["id"] for chunk in chunks]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]

    print("Upserting chunks into ChromaDB (this may take a moment to embed)...")
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    print(f"Index built successfully. Collection contains {collection.count()} items.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="Rebuild the vector index")
    args = parser.parse_args()

    if args.rebuild:
        build_index()
    else:
        print("Use --rebuild to rebuild the index.")
