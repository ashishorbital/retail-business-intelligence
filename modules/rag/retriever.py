from modules.rag.embed import get_chroma_client, get_collection

def retrieve(query: str, k: int = 5, filters: dict = None) -> list:
    client = get_chroma_client()
    collection = get_collection(client)
    
    results = collection.query(
        query_texts=[query],
        n_results=k,
        where=filters
    )
    
    chunks = []
    if results['documents'] and len(results['documents']) > 0:
        docs = results['documents'][0]
        metas = results['metadatas'][0]
        for i in range(len(docs)):
            chunks.append({
                "text": docs[i],
                "metadata": metas[i]
            })
    return chunks

if __name__ == "__main__":
    import sys
    query = sys.argv[1] if len(sys.argv) > 1 else "What is the forecast for tomorrow?"
    res = retrieve(query)
    for c in res:
        print(c)
