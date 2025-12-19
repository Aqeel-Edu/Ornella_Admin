"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBlogs, deleteBlog } from "@/lib/firebase-utils"
import { Blog } from "@/types/schema"
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const data = await getBlogs()
      setBlogs(data as Blog[])
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      await deleteBlog(id)
      setBlogs((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.error("Error deleting blog:", error)
      alert("Failed to delete blog")
    }
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 p-10 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">📝 Blog Management</h1>
            <p className="text-purple-100 text-sm">Create, edit, and manage your blog posts</p>
          </div>
          <Link href="/admin/blogs/new">
            <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Blog Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : blogs.length === 0 ? (
        <Card className="p-16 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Blogs Yet</h2>
          <p className="text-gray-500 mb-6">Start creating blog posts to engage your audience</p>
          <Link href="/admin/blogs/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Blog
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="overflow-hidden hover:shadow-lg transition-all border border-gray-200 bg-white rounded-xl"
            >
              {blog.imageUrl && (
                <div className="w-full h-48 bg-gray-100">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    blog.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {blog.status}
                  </span>
                  <span className="text-xs text-gray-500">{blog.readTime} min read</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {blog.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags?.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    {blog.publishedDate?.toDate?.()?.toLocaleDateString?.() ?? ""}
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/admin/blogs/${blog.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(blog.id)}
                      className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
