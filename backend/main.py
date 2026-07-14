import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import shutil

from ingest import ingest_documents, extract_text_from_file, extract_entities
from rag import query_knowledge_base
from compliance import check_compliance
from graph import build_knowledge_graph

load_dotenv()

app = FastAPI(title="Industrial Knowledge Brain API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
allow_origins=["http://localhost:5173", "http://localhost:5174"],    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

class ComplianceRequest(BaseModel):
    procedure_text: str

@app.get("/")
def root():
    return {"message": "Industrial Knowledge Brain API is running!"}

@app.get("/ingest")
def ingest():
    """Ingest all documents from data folder"""
    try:
        count = ingest_documents()
        return {"message": f"Successfully ingested documents into {count} chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
def ask_question(request: QuestionRequest):
    """Ask a question to the knowledge base"""
    try:
        result = query_knowledge_base(request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a new document to the knowledge base"""
    try:
        # Save uploaded file to data folder
        file_path = f"../data/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text and entities
        text = extract_text_from_file(file_path)
        entities = extract_entities(text)
        
        return {
            "message": f"File {file.filename} uploaded successfully",
            "entities_found": entities[:10],
            "text_preview": text[:300]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compliance")
def compliance_check(request: ComplianceRequest):
    """Check procedure text for compliance gaps"""
    try:
        result = check_compliance(request.procedure_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph")
def get_knowledge_graph():
    """Get knowledge graph data"""
    try:
        graph_data = build_knowledge_graph()
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))