import os
from groq import Groq
from dotenv import load_dotenv
from ingest import get_vectorstore

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_knowledge_base(question: str):
    """Search documents and answer question using Groq LLM"""
    
    # Step 1: Search ChromaDB for relevant chunks
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(question, k=4)
    
    if not results:
        return {
            "answer": "No relevant information found in the knowledge base.",
            "sources": [],
            "confidence": 0
        }
    
    # Step 2: Build context from search results
    context = ""
    sources = []
    for doc, score in results:
        context += doc.page_content + "\n\n"
        source = doc.metadata.get("source", "Unknown")
        if source not in sources:
            sources.append(source)
    
    # Step 3: Calculate confidence score
    avg_score = sum(score for _, score in results) / len(results)
    confidence = max(0, min(100, int((1 - avg_score) * 100)))
    
    # Step 4: Send to Groq LLM with context
    prompt = f"""You are an expert Industrial Knowledge Assistant for a manufacturing plant.
    
Use ONLY the following context from industrial documents to answer the question.
Always mention which document your answer comes from.
If the answer is not in the context, say "This information is not available in the current knowledge base."

CONTEXT FROM DOCUMENTS:
{context}

QUESTION: {question}

Provide a clear, detailed answer with specific references to the source documents."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=1024,
        temperature=0.1
    )
    
    answer = response.choices[0].message.content
    
    return {
        "answer": answer,
        "sources": sources,
        "confidence": confidence
    }