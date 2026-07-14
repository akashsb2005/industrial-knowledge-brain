import os
import pdfplumber
import spacy
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

# Load spacy model for entity extraction
nlp = spacy.load("en_core_web_sm")

# Directory where our data files are stored
DATA_DIR = "../data"
CHROMA_DIR = "./chroma_db"

def extract_text_from_file(filepath):
    """Read text from .txt or .pdf files"""
    if filepath.endswith(".pdf"):
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    elif filepath.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def extract_entities(text):
    """Extract equipment tags, dates, people from text"""
    doc = nlp(text[:10000])  # limit for speed
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_
        })
    
    # Also extract custom equipment tags like P-101, C-201
    import re
    equipment_tags = re.findall(r'\b[A-Z]-\d{3}\b', text)
    for tag in equipment_tags:
        entities.append({
            "text": tag,
            "label": "EQUIPMENT"
        })
    
    return entities

def ingest_documents():
    """Read all files from data folder and store in ChromaDB"""
    print("Starting document ingestion...")
    
    all_texts = []
    all_metadatas = []
    
    # Read every file in data folder
    for filename in os.listdir(DATA_DIR):
        filepath = os.path.join(DATA_DIR, filename)
        print(f"Reading: {filename}")
        
        text = extract_text_from_file(filepath)
        if not text:
            continue
            
        entities = extract_entities(text)
        
        # Split text into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_text(text)
        
        for chunk in chunks:
            all_texts.append(chunk)
            all_metadatas.append({
                "source": filename,
                "entities": str(entities[:5])  # store first 5 entities
            })
    
    print(f"Total chunks created: {len(all_texts)}")
    
    # Create embeddings and store in ChromaDB
    embeddings = SentenceTransformerEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    
    vectorstore = Chroma.from_texts(
        texts=all_texts,
        embedding=embeddings,
        metadatas=all_metadatas,
        persist_directory=CHROMA_DIR
    )
    
    print("Documents successfully stored in ChromaDB!")
    return len(all_texts)

def get_vectorstore():
    """Load existing ChromaDB vectorstore"""
    embeddings = SentenceTransformerEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )
    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )
    return vectorstore