import { useState } from "react"
import axios from "axios"
import { Send, Loader } from "lucide-react"

export default function ChatPanel({ api }) {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your Industrial Knowledge Copilot. Ask me anything about your plant equipment, maintenance history, safety procedures, or compliance requirements."
    }
  ])
  const [loading, setLoading] = useState(false)

  const askQuestion = async () => {
    if (!question.trim()) return
    const userMessage = { role: "user", content: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion("")
    setLoading(true)
    try {
      const response = await axios.post(`${api}/ask`, { question })
      const { answer, sources, confidence } = response.data
      setMessages(prev => [...prev, {
        role: "assistant",
        content: answer,
        sources: sources,
        confidence: confidence
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error connecting to knowledge base. Please try again."
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-[75vh]">

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-1">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, j) => (
                        <span
                          key={j}
                          className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {msg.confidence !== undefined && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">
                      Confidence:{" "}
                      <span className={`font-medium ${
                        msg.confidence > 70
                          ? "text-green-400"
                          : msg.confidence > 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}>
                        {msg.confidence}%
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader size={16} className="animate-spin text-green-400" />
                <span className="text-sm text-gray-400">Searching knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about equipment, maintenance, safety procedures..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 text-sm resize-none border border-gray-700 focus:outline-none focus:border-green-500"
              rows={2}
            />
            <button
              onClick={askQuestion}
              disabled={loading || !question.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send</p>
        </div>

      </div>
    </div>
  )
}