import os
from dotenv import load_dotenv
from groq import Groq
from modules.rag.retriever import retrieve

load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY")
)

def answer(query: str) -> dict:
    if not os.environ.get("GROQ_API_KEY"):
        return {
            "answer": "Error: GROQ_API_KEY is not set in the environment.",
            "sources": []
        }

    # 1. Retrieve chunks
    chunks = retrieve(query, k=25)
    
    # 2. Build prompt
    context_texts = []
    sources = []
    
    for i, chunk in enumerate(chunks):
        context_texts.append(f"--- Chunk {i+1} ---\n{chunk['text']}")
        sources.append(chunk['metadata'])
        
    context_str = "\n\n".join(context_texts)
    
    system_prompt = f"""You are ShelfSense AI, an expert business analyst and assistant for a retail platform.
Your job is to provide helpful, comprehensive, and conversational answers based on the provided context. 
Synthesize the provided data to give insightful, well-rounded answers rather than just narrow facts.
If the context does not contain enough information to fully answer the question, state that you don't have enough data, but still try to provide any related insights you can from the context. Do NOT completely hallucinate metrics.

Context:
{context_str}
"""

    try:
        # 3. Call Groq LLM (using a fast model like llama3-8b-8192)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=500
        )
        
        generated_text = chat_completion.choices[0].message.content
        
        return {
            "answer": generated_text,
            "sources": sources
        }
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {
            "answer": "An error occurred while generating the answer.",
            "sources": sources
        }

if __name__ == "__main__":
    import sys
    q = sys.argv[1] if len(sys.argv) > 1 else "What is the forecast?"
    res = answer(q)
    print("Answer:\n", res["answer"])
    print("\nSources:\n", res["sources"])
