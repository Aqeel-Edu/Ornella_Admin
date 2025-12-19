"use client"

import { BlogForm } from "@/components/admin/BlogForm"
import { addBlog } from "@/lib/firebase-utils"

export default function NewBlogPage() {
  const handleSubmit = async (data: any) => {
    await addBlog(data)
  }

  return (
    <div className="max-w-4xl ml-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Create New Blog Post</h1>
        <p className="text-muted-foreground">Share your insights and ideas with your audience</p>
      </div>

      <BlogForm onSubmit={handleSubmit} />
    </div>
  )
}
