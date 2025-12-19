"use client"

import { useState, useEffect } from "react"
import { BlogForm } from "@/components/admin/BlogForm"
import { getBlog, updateBlog } from "@/lib/firebase-utils"
import { useParams } from "next/navigation"

export default function EditBlogPage() {
  const params = useParams()
  const blogId = params.id as string
  const [blog, setBlog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlog(blogId)
        setBlog(data)
      } catch (error) {
        console.error("Error fetching blog:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [blogId])

  const handleSubmit = async (data: any) => {
    await updateBlog(blogId, data)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!blog) {
    return <div className="text-center py-8">Blog not found</div>
  }

  return (
    <div className="max-w-4xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
        <p className="text-muted-foreground">Update your blog post content and settings</p>
      </div>

      <BlogForm initialData={blog} onSubmit={handleSubmit} />
    </div>
  )
}
