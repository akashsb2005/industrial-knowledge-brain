import os
from groq import Groq
from dotenv import load_dotenv
from ingest import get_vectorstore

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def check_compliance(procedure_text: str):
    """Check a procedure against OISD and Factories Act"""
    
    # Search for relevant regulations
    vectorstore = get_vectorstore()
    
    # Search for OISD and Factories Act content
    results = vectorstore.similarity_search(
        "safety compliance requirements permit work regulations", 
        k=5
    )
    
    regulations_context = ""
    for doc in results:
        regulations_context += doc.page_content + "\n\n"
    
    prompt = f"""You are an Industrial Safety Compliance Expert.

Analyze the following procedure/document against OISD Standards and Factories Act 1948.
Identify ALL compliance gaps and violations.

REGULATIONS AND STANDARDS:
{regulations_context}

PROCEDURE TO CHECK:
{procedure_text}

Respond in this EXACT format for each gap found:

GAP 1:
- Issue: [What is missing or violated]
- Regulation: [Which OISD standard or Factories Act section is violated]
- Severity: [HIGH / MEDIUM / LOW]
- Recommendation: [What needs to be added or changed]

GAP 2:
- Issue: ...
- Regulation: ...
- Severity: ...
- Recommendation: ...

If no gaps found, say "COMPLIANT: This procedure meets all checked standards."
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=1500,
        temperature=0.1
    )
    
    result_text = response.choices[0].message.content
    
    # Parse the gaps from response
    gaps = parse_compliance_gaps(result_text)
    
    return {
        "raw_analysis": result_text,
        "gaps": gaps,
        "total_gaps": len(gaps),
        "status": "NON-COMPLIANT" if gaps else "COMPLIANT"
    }

def parse_compliance_gaps(text: str):
    """Parse compliance gaps from LLM response"""
    gaps = []
    
    if "COMPLIANT:" in text and "GAP" not in text:
        return gaps
    
    # Split by GAP sections
    sections = text.split("GAP ")
    for section in sections[1:]:  # skip first empty split
        lines = section.strip().split("\n")
        gap = {}
        for line in lines:
            line = line.strip()
            if line.startswith("- Issue:"):
                gap["issue"] = line.replace("- Issue:", "").strip()
            elif line.startswith("- Regulation:"):
                gap["regulation"] = line.replace("- Regulation:", "").strip()
            elif line.startswith("- Severity:"):
                gap["severity"] = line.replace("- Severity:", "").strip()
            elif line.startswith("- Recommendation:"):
                gap["recommendation"] = line.replace("- Recommendation:", "").strip()
        
        if gap:
            gaps.append(gap)
    
    return gaps