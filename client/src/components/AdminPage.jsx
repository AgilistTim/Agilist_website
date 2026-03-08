import { AdminAuth, useAdminAuth } from './AdminAuth.jsx'
import { AdminBlogCreate } from './AdminBlogCreate.jsx'
import { AdminBlogUpload } from './AdminBlogUpload.jsx'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

function AdminContent({ apiBaseUrl }) {
  const { logout } = useAdminAuth()

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F4F4F5] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-[#A1A1AA]">Manage blog posts and RAG vector store content</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-[#2A2A35] text-[#A1A1AA] hover:text-white hover:bg-[#16161A]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <AdminBlogCreate apiBaseUrl={apiBaseUrl} />

        <AdminBlogUpload apiBaseUrl={apiBaseUrl} />

        <div className="mt-8 p-4 bg-[#16161A] border border-[#2A2A35] rounded-lg">
          <h2 className="font-semibold text-white mb-2">Batch Upload Existing Posts</h2>
          <p className="text-sm text-[#A1A1AA] mb-3">
            To upload all existing blog posts to the vector store, run this command in the server directory:
          </p>
          <code className="block bg-[#0D0D0F] p-3 rounded text-sm text-[#A78BFA] font-mono">
            node scripts/upload-blogs-to-vectorstore.js
          </code>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage({ apiBaseUrl }) {
  return (
    <AdminAuth apiBaseUrl={apiBaseUrl}>
      <AdminContent apiBaseUrl={apiBaseUrl} />
    </AdminAuth>
  )
}
