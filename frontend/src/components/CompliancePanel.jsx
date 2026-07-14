import { useState } from "react"
import axios from "axios"
import { ShieldCheck, AlertTriangle, CheckCircle, Loader } from "lucide-react"

export default function CompliancePanel({ api }) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const checkCompliance = async () => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const response = await axios.post(`${api}/compliance`, { procedure_text: text })
      setResult(response.data)
    } catch (err) {
      setResult({ error: err.message })
    }
    setLoading(false)
  }

  const loadSample = () => {
    setText("Workers will enter the confined vessel V-301 for cleaning. They will wear helmets. Work will start at 8am. No gas testing required as the vessel looks clean. Hot work welding will be done inside simultaneously. No standby person needed.")
  }

  const getSeverityColor = (severity) => {
    if (!severity) return "border-gray-700"
    if (severity.includes("HIGH")) return "border-red-500 bg-red-900/10"
    if (severity.includes("MEDIUM")) return "border-yellow-500 bg-yellow-900/10"
    return "border-green-500 bg-green-900/10"
  }

  const getSeverityBadge = (severity) => {
    if (!severity) return "bg-gray-500 text-white"
    if (severity.includes("HIGH")) return "bg-red-500 text-white"
    if (severity.includes("MEDIUM")) return "bg-yellow-500 text-black"
    return "bg-green-500 text-white"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Compliance Gap Detection</h2>
        <p className="text-sm text-gray-400">
          Paste any SOP or procedure — AI checks it against OISD Standards and Factories Act 1948
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your procedure or SOP here..."
            className="w-full h-64 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-white resize-none focus:outline-none focus:border-green-500"
          />
          <button
            onClick={checkCompliance}
            disabled={loading || !text.trim()}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Check Compliance
              </>
            )}
          </button>
          <button
            onClick={loadSample}
            className="w-full border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white rounded-lg py-2 text-xs transition-colors"
          >
            Load sample non-compliant procedure
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-xl">
              <p className="text-gray-500 text-sm">Compliance analysis will appear here</p>
            </div>
          )}

          {result && !result.error && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                result.status === "COMPLIANT"
                  ? "bg-green-900/20 border border-green-700"
                  : "bg-red-900/20 border border-red-700"
              }`}>
                {result.status === "COMPLIANT" ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <AlertTriangle size={18} className="text-red-400" />
                )}
                <span className={`font-medium text-sm ${
                  result.status === "COMPLIANT" ? "text-green-400" : "text-red-400"
                }`}>
                  {result.status} — {result.total_gaps} gap(s) found
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.gaps && result.gaps.map((gap, i) => (
                  <div
                    key={i}
                    className={`border rounded-xl p-4 ${getSeverityColor(gap.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-white">Gap {i + 1}</span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityBadge(gap.severity)}`}>
                        {gap.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mb-1">
                      <span className="text-gray-500">Issue: </span>{gap.issue}
                    </p>
                    <p className="text-xs text-gray-300 mb-1">
                      <span className="text-gray-500">Regulation: </span>{gap.regulation}
                    </p>
                    <p className="text-xs text-gray-300">
                      <span className="text-gray-500">Fix: </span>{gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && result.error && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <p className="text-red-400 text-sm">Error: {result.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}