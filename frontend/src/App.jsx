import { useState } from "react"
import axios from "axios"
import { Brain, Upload, MessageSquare, ShieldCheck, Network } from "lucide-react"
import ChatPanel from "./components/ChatPanel"
import UploadPanel from "./components/UploadPanel"
import CompliancePanel from "./components/CompliancePanel"
import GraphPanel from "./components/GraphPanel"

const API = "http://127.0.0.1:8000"

export default function App() {
  const [activeTab, setActiveTab] = useState("chat")

  const tabs = [
    { id: "chat", label: "Knowledge Copilot", icon: MessageSquare },
    { id: "upload", label: "Upload Documents", icon: Upload },
    { id: "compliance", label: "Compliance Check", icon: ShieldCheck },
    { id: "graph", label: "Knowledge Graph", icon: Network },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Brain className="text-green-400" size={28} />
          <div>
            <h1 className="text-xl font-bold text-white">Industrial Knowledge Brain</h1>
            <p className="text-xs text-gray-400">AI-Powered Unified Asset & Operations Intelligence</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-green-400 text-green-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="p-6">
        {activeTab === "chat" && <ChatPanel api={API} />}
        {activeTab === "upload" && <UploadPanel api={API} />}
        {activeTab === "compliance" && <CompliancePanel api={API} />}
        {activeTab === "graph" && <GraphPanel api={API} />}
      </div>
    </div>
  )
}