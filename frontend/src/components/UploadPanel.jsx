import { useState } from "react"
import axios from "axios"
import { Upload, CheckCircle } from "lucide-react"

export default function UploadPanel({ api }) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file) => {
    setUploading(true)
    setResult(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await axios.post(`${api}/upload`, formData)
      setResult({ success: true, data: response.data })
    } catch (err) {
      setResult({ success: false, error: err.message })
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Upload Industrial Documents</h2>
        <p className="text-sm text-gray-400">Upload PDFs or text files</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragOver
            ? "border-green-400 bg-green-400/5"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        <Upload size={40} className="mx-auto text-gray-500 mb-4" />
        <p className="text-white font-medium mb-2">Drag and drop your document here</p>
        <p className="text-gray-400 text-sm mb-4">Supports PDF, TXT files</p>
        <label className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg cursor-pointer text-sm transition-colors">
          Browse File
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileInput}
          />
        </label>
      </div>

      {uploading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
          <span className="text-sm text-gray-300">Processing document...</span>
        </div>
      )}

      {result && result.success && (
        <div className="bg-gray-900 border border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-green-400 font-medium text-sm">Uploaded successfully!</span>
          </div>
          <p className="text-xs text-gray-300 bg-gray-800 rounded p-3">
            {result.data.text_preview}...
          </p>
          {result.data.entities_found && result.data.entities_found.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Entities extracted:</p>
              <div className="flex flex-wrap gap-2">
                {result.data.entities_found.map((entity, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded">
                    {entity.text} ({entity.label})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result && !result.success && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <p className="text-red-400 text-sm">Upload failed: {result.error}</p>
        </div>
      )}
    </div>
  )
}