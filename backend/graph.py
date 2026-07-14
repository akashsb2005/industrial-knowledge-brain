import networkx as nx
import re
import os

def build_knowledge_graph():
    """Build knowledge graph from data files"""
    G = nx.Graph()
    
    DATA_DIR = "../data"
    
    # Add document nodes
    for filename in os.listdir(DATA_DIR):
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
        
        # Add document as node
        G.add_node(filename, type="document", label=filename)
        
        # Extract equipment tags
        equipment_tags = re.findall(r'\b[A-Z]-\d{3}\b', text)
        for tag in set(equipment_tags):
            G.add_node(tag, type="equipment", label=tag)
            G.add_edge(filename, tag, relation="contains")
        
        # Extract work order numbers
        work_orders = re.findall(r'Work Order #\d+', text)
        for wo in set(work_orders):
            G.add_node(wo, type="work_order", label=wo)
            G.add_edge(filename, wo, relation="contains")
        
        # Extract section references
        sections = re.findall(r'Section \d+[A-Z]?', text)
        for section in set(sections):
            G.add_node(section, type="regulation", label=section)
            G.add_edge(filename, section, relation="references")
    
    # Convert to JSON for frontend
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": node_id,
            "label": data.get("label", node_id),
            "type": data.get("type", "unknown")
        })
    
    edges = []
    for source, target, data in G.edges(data=True):
        edges.append({
            "source": source,
            "target": target,
            "relation": data.get("relation", "related")
        })
    
    return {"nodes": nodes, "edges": edges} 