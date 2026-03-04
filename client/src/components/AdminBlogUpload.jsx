import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function AdminBlogUpload({ apiBaseUrl }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    // Check password from environment variable
    const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD || 'admin123'
    if (password === adminPassword) {
      setAuthenticated(true)
      setMessage('')
    } else {
      setMessage('Incorrect password')
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.md')) {
      setFile(selectedFile)
      setMessage('')
    } else {
      setMessage('Please select a .md file')
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    setMessage('')

    try {
      // Read file content
      const content = await file.text()
      const fileName = file.name

      // Upload to vector store via API
      const response = await fetch(`${apiBaseUrl}/api/upload-blog-to-vectorstore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, fileName })
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      setStatus('success')
      setMessage(`Successfully uploaded "${fileName}" to vector store (File ID: ${result.fileId})`)
      setFile(null)

      // Reset file input
      const fileInput = document.getElementById('blog-file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setStatus('error')
      setMessage(`Upload failed: ${error.message}`)
    }
  }

  if (!authenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8 bg-[#16161A] border-[#2A2A35]">
        <CardHeader>
          <CardTitle className="text-white">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-[#A1A1AA] mb-2">
                Enter admin password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D0D0F] border border-[#2A2A35] rounded text-white"
                placeholder="Password"
              />
            </div>
            {message && <p className="text-sm text-red-400">{message}</p>}
            <Button type="submit" className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-[#16161A] border-[#2A2A35]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Blog Post to Vector Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-[#A1A1AA]">
            Upload a blog post (.md file) to add it to the RAG vector store. This makes the content
            available to the AI chatbot.
          </p>
          <p className="text-xs text-[#A1A1AA]">
            Note: This only uploads to the vector store. To publish on the website, manually add the
            file to <code className="bg-[#0D0D0F] px-1 py-0.5 rounded">src/content/blog/</code>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="blog-file-input" className="block text-sm text-[#A1A1AA] mb-2">
              Select markdown file (.md)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="blog-file-input"
                type="file"
                accept=".md"
                onChange={handleFileChange}
                className="text-sm text-[#A1A1AA] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#7C3AED] file:text-white file:cursor-pointer hover:file:bg-[#6D28D9]"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-[#A78BFA] bg-[#0D0D0F] p-3 rounded">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-[#A1A1AA]">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading to Vector Store...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Vector Store
              </>
            )}
          </Button>

          {message && (
            <div
              className={`flex items-start gap-2 p-4 rounded text-sm ${
                status === 'success'
                  ? 'bg-green-900/20 text-green-300 border border-green-800'
                  : 'bg-red-900/20 text-red-300 border border-red-800'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p>{message}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#2A2A35] space-y-2">
          <h3 className="font-semibold text-white">Quick Instructions:</h3>
          <ol className="text-sm text-[#A1A1AA] space-y-1 list-decimal list-inside">
            <li>
              Manually add your .md file to{' '}
              <code className="bg-[#0D0D0F] px-1 py-0.5 rounded">client/src/content/blog/</code>
            </li>
            <li>Use this form to upload the same file to the vector store</li>
            <li>The chatbot will now have access to the blog content for Q&A</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
