import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useAdminAuth } from './AdminAuth.jsx'
import { PenLine, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AdminBlogCreate({ apiBaseUrl }) {
  const { authFetch } = useAdminAuth()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [content, setContent] = useState('')
  const [uploadToVectorStore, setUploadToVectorStore] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!slugEdited) {
      setSlug(slugify(newTitle))
    }
  }

  const handleSlugChange = (e) => {
    setSlug(e.target.value)
    setSlugEdited(true)
  }

  const buildFrontmatter = () => {
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    let fm = '---\n'
    fm += `title: "${title.replace(/"/g, '\\"')}"\n`
    fm += `date: ${date}\n`
    fm += `summary: "${summary.replace(/"/g, '\\"')}"\n`
    if (tagList.length > 0) {
      fm += `tags: [${tagList.map((t) => `"${t}"`).join(', ')}]\n`
    }
    fm += `draft: false\n`
    if (linkedinUrl) {
      fm += `linkedinUrl: "${linkedinUrl}"\n`
    }
    fm += '---\n'
    return fm
  }

  const handlePublish = async () => {
    if (!title || !summary || !content) {
      setMessage('Title, summary, and content are required.')
      setStatus('error')
      return
    }
    if (!slug) {
      setMessage('Slug is required.')
      setStatus('error')
      return
    }

    setStatus('publishing')
    setMessage('')

    const filename = `${slug}.md`
    const fileContent = buildFrontmatter() + '\n' + content

    try {
      // 1. Publish to GitHub via server proxy
      const publishRes = await authFetch(`${apiBaseUrl}/api/admin/publish-blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: fileContent,
          commitMessage: `Add blog post: ${title}`,
        }),
      })

      if (!publishRes.ok) {
        const err = await publishRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to publish to GitHub')
      }

      // 2. Optionally upload to vector store
      if (uploadToVectorStore && apiBaseUrl) {
        setMessage('Committed to GitHub. Uploading to vector store...')
        const vectorRes = await authFetch(`${apiBaseUrl}/api/admin/upload-to-vectorstore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: fileContent, fileName: filename }),
        })
        if (!vectorRes.ok) {
          throw new Error('GitHub commit succeeded but vector store upload failed')
        }
      }

      setStatus('success')
      setMessage(
        `Published "${title}" to GitHub. The site will rebuild automatically. ` +
          `Blog URL: /blog/${slug}` +
          (uploadToVectorStore ? ' | Also uploaded to vector store.' : '')
      )
      setTitle('')
      setSlug('')
      setSlugEdited(false)
      setSummary('')
      setTags('')
      setLinkedinUrl('')
      setContent('')
      setUploadToVectorStore(false)
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error.message}`)
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-[#0D0D0F] border border-[#2A2A35] rounded text-white placeholder-[#52525B] focus:border-[#7C3AED] focus:outline-none'

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-[#16161A] border-[#2A2A35]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PenLine className="h-5 w-5" />
          Create Blog Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm text-[#A1A1AA] mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={inputClass}
            placeholder="My New Blog Post"
          />
        </div>

        <div>
          <label className="block text-sm text-[#A1A1AA] mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            className={inputClass}
            placeholder="my-new-blog-post"
          />
          <p className="text-xs text-[#52525B] mt-1">Auto-generated from title. Edit to customize.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputClass}
              placeholder="ai, agile, leadership"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#A1A1AA] mb-1">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="A brief 1-2 sentence summary of the post..."
          />
        </div>

        <div>
          <label className="block text-sm text-[#A1A1AA] mb-1">LinkedIn URL (optional)</label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className={inputClass}
            placeholder="https://www.linkedin.com/pulse/..."
          />
        </div>

        <div>
          <label className="block text-sm text-[#A1A1AA] mb-1">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className={inputClass + ' font-mono text-sm'}
            placeholder="Write your blog post in Markdown..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vector-store-checkbox"
            checked={uploadToVectorStore}
            onChange={(e) => setUploadToVectorStore(e.target.checked)}
            className="accent-[#7C3AED]"
          />
          <label htmlFor="vector-store-checkbox" className="text-sm text-[#A1A1AA]">
            Also upload to vector store (for AI chatbot)
          </label>
        </div>

        <Button
          onClick={handlePublish}
          disabled={status === 'publishing'}
          className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50"
        >
          {status === 'publishing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <PenLine className="h-4 w-4 mr-2" />
              Publish to GitHub
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
      </CardContent>
    </Card>
  )
}
