"use client"

import type React from "react"
import { useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { generateSlug, uploadImage } from "@/lib/firebase-utils"
import { useRouter } from "next/navigation"
import { Timestamp } from "firebase/firestore"
import { Sparkles } from "lucide-react"

interface BlogFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function BlogForm({ initialData, onSubmit, isLoading = false }: BlogFormProps) {
  const router = useRouter()
  
  // Safe date conversion helper
  const getDateString = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split('T')[0]
    
    // If it's a Firestore Timestamp with toDate method
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toISOString().split('T')[0]
    }
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0]
    }
    
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toISOString().split('T')[0]
    }
    
    // Fallback
    return new Date().toISOString().split('T')[0]
  }
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    imageUrl: initialData?.imageUrl || "",
    imagePath: initialData?.imagePath || "",
    externalImageUrl: initialData?.imageUrl || "",
    category: initialData?.category || "",
    tags: initialData?.tags?.join(", ") || "",
    readTime: initialData?.readTime || "",
    publishedDate: getDateString(initialData?.publishedDate),
    status: initialData?.status || "draft",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords?.join(", ") || "",
    altText: initialData?.altText || "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [generatingField, setGeneratingField] = useState<string | null>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const generateWithAI = async (field: string) => {
    if (generatingField) {
      console.warn("Already generating, please wait...")
      return
    }

    if (!formData.title.trim()) {
      alert("Please enter a blog title first")
      return
    }

    setGeneratingField(field)

    try {
      const response = await fetch(`/api/ai/generate-blog-${field}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          excerpt: formData.excerpt,
          content: formData.content,
        }),
      })

      if (!response.ok) {
        throw new Error("AI generation failed")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, [field]: data[field] }))
    } catch (error) {
      console.error(`Error generating ${field}:`, error)
      
      // Fallback generation
      switch (field) {
        case "slug":
          setFormData((prev) => ({ ...prev, slug: generateSlug(formData.title) }))
          break
        case "excerpt":
          setFormData((prev) => ({
            ...prev,
            excerpt: `Discover ${formData.title.toLowerCase()} with expert tips and inspiration for your home in Pakistan.`,
          }))
          break
        case "content":
          const fallbackContent = `
            <h2>Introduction</h2>
            <p>${formData.title} - A comprehensive guide to transforming your space.</p>
            
            <h2>Key Points</h2>
            <ul>
              <li>Expert design tips for Pakistani homes</li>
              <li>Practical implementation strategies</li>
              <li>Budget-friendly solutions</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Transform your space with these insights on ${formData.title.toLowerCase()}.</p>
          `
          setFormData((prev) => ({ ...prev, content: fallbackContent }))
          break
        case "tags":
          const words = formData.title.toLowerCase().split(" ")
          const commonWords = ["a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "and", "or"]
          const uniqueTags = words
            .filter((w) => w.length > 3 && !commonWords.includes(w))
            .slice(0, 5)
          setFormData((prev) => ({
            ...prev,
            tags: uniqueTags.join(", ") + (formData.category ? `, ${formData.category.toLowerCase()}` : ""),
          }))
          break
        case "metaTitle":
          setFormData((prev) => ({
            ...prev,
            metaTitle: `${formData.title} - Ornella Blog`.substring(0, 60),
          }))
          break
        case "metaDescription":
          setFormData((prev) => ({
            ...prev,
            metaDescription: formData.excerpt || `Read ${formData.title} on Ornella's blog. Expert home décor tips and inspiration.`,
          }))
          break
        case "keywords":
          const titleWords = formData.title.toLowerCase().split(" ").filter((w) => w.length > 3)
          const categoryWords = formData.category ? [formData.category.toLowerCase()] : []
          setFormData((prev) => ({
            ...prev,
            keywords: [...new Set([...titleWords, ...categoryWords, "blog", "home decor"])].slice(0, 8).join(", "),
          }))
          break
        case "altText":
          setFormData((prev) => ({
            ...prev,
            altText: `${formData.title} - Ornella Blog Featured Image`,
          }))
          break
      }
    } finally {
      setGeneratingField(null)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      const img = document.createElement('img')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const url = URL.createObjectURL(file)
      
      await new Promise((resolve) => {
        img.onload = () => {
          const maxWidth = 1200
          const maxHeight = 1200
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              setImageFile(compressedFile)
            }
          }, 'image/jpeg', 0.8)
          
          resolve(null)
        }
      })
      
      img.src = url
      URL.revokeObjectURL(url)
      setFormData((prev) => ({ ...prev, externalImageUrl: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.imageUrl
      let imagePath = formData.imagePath || ""

      if (formData.externalImageUrl && formData.externalImageUrl.trim() !== "") {
        imageUrl = formData.externalImageUrl.trim()
        imagePath = ""
      } else if (imageFile) {
        const timestamp = Date.now()
        const path = `blogs/${timestamp}-${imageFile.name}`
        const res = await uploadImage(imageFile, path)
        imageUrl = res.url
        imagePath = res.path
      }

      const submitData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        imageUrl,
        imagePath,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t),
        readTime: Number.parseInt(formData.readTime) || 5,
        publishedDate: Timestamp.fromDate(new Date(formData.publishedDate)),
        status: formData.status,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k),
        altText: formData.altText,
      }

      await onSubmit(submitData)
      router.push("/admin/blogs")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error saving blog. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-8">
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Blog Information</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Blog Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g., 10 Minimalist Living Room Ideas"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("slug")}
                disabled={generatingField === "slug"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "slug" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="auto-generated"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("excerpt")}
                disabled={generatingField === "excerpt"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "excerpt" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="2-3 sentences for preview"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content (Full Article)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("content")}
                disabled={generatingField === "content"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "content" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <div className="mt-2">
              <Editor
                id="content"
                apiKey="fsah9u2b1w2ksadcfnzrjl1kpwlwi0rrioo3596z4qp88b6z"
                value={formData.content}
                onEditorChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  branding: false,
                  promotion: false
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md bg-slate-50 focus:border-sky-200 focus:ring-sky-200 text-gray-800"
                required
              >
                <option value="">Select a category</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Bedroom Design">Bedroom Design</option>
                <option value="Sustainability">Sustainability</option>
                <option value="Small Spaces">Small Spaces</option>
                <option value="Seasonal Decor">Seasonal Decor</option>
                <option value="Color Theory">Color Theory</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time (minutes)</Label>
              <Input
                id="readTime"
                type="number"
                value={formData.readTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, readTime: e.target.value }))}
                placeholder="5"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("tags")}
                disabled={generatingField === "tags"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "tags" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., minimalism, living room, design"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedDate">Published Date</Label>
            <Input
              id="publishedDate"
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, publishedDate: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-md bg-slate-50 focus:border-sky-200 focus:ring-sky-200 text-gray-800"
              required
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">SEO Settings</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("metaTitle")}
                disabled={generatingField === "metaTitle"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "metaTitle" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="e.g., 10 Living Room Ideas - Ornella Blog"
              maxLength={60}
            />
            <p className="text-xs text-slate-500">{formData.metaTitle.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("metaDescription")}
                disabled={generatingField === "metaDescription"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "metaDescription" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Brief summary for search engines (150-160 chars)"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-slate-500">{formData.metaDescription.length}/160 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("keywords")}
                disabled={generatingField === "keywords"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "keywords" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="e.g., home decor, interior design, blog"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="altText">Image Alt Text</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("altText")}
                disabled={generatingField === "altText"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "altText" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Input
              id="altText"
              value={formData.altText}
              onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
              placeholder="Descriptive text for the featured image"
            />
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Featured Image</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-700">Upload Image</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>
          <div>
            <Label htmlFor="externalImageUrl" className="text-gray-700">Or paste image URL</Label>
            <Input
              id="externalImageUrl"
              value={formData.externalImageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, externalImageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button 
          type="submit" 
          disabled={uploading || isLoading} 
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-6 text-lg"
        >
          {uploading || isLoading ? "Saving..." : "Save Blog"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()} 
          className="flex-1 border-slate-200 hover:bg-slate-50 hover:text-slate-900 py-6 text-lg"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
