import { useState, useEffect } from "react"
import axios from "axios"
import { Loader } from "lucide-react"

export default function GraphPanel({ api }) {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadGraph = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${api}/graph`)
      setGraphData(response.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { loadGraph() }, [])

  const nodeColor = (type) => {
    if (type === "document") return "#22c55e"
    if (type === "equipment") return "#3b82f6"
    if (type === "work_order") return "#f59e0b"
    if (type === "regulation") return "#ec4899"
    return "#6b7280"
  }

  const legends = [
    { type: "document", label: "Document", color: "#22c55e" },
    { type: "equipment", label: "Equipment", color: "#3b82f6" },
    { type: "work_order", label: "Work Order", color: "#f59e0b" },
    { type: "regulation", label: "Regulation", color: "#ec4899" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Knowledge Graph</h2>
          <p className="text-sm text-gray-400">Visual map of relationships between documents, equipment, regulations and work orders</p>
        </div>
        <button
          onClick={loadGraph}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {legends.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm">Building knowledge graph...</span>
          </div>
        </div>
      )}

      {graphData && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {graphData.nodes ? graphData.nodes.length : 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total Nodes</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {graphData.edges ? graphData.edges.length : 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Relationships</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {graphData.nodes ? graphData.nodes.filter(n => n.type === "equipment").length : 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Equipment Tags</div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-3">All nodes in knowledge graph:</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {graphData.nodes && graphData.nodes.map((node, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    borderColor: nodeColor(node.type),
                    color: nodeColor(node.type),
                    backgroundColor: nodeColor(node.type) + "20"
                  }}
                >
                  {node.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-3">Relationships:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {graphData.edges && graphData.edges.map((edge, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-green-400">{edge.source}</span>
                  <span className="text-gray-600">→ {edge.relation} →</span>
                  <span className="text-blue-400">{edge.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}