"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Editor } from "@tinymce/tinymce-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { generateSlug, uploadImage } from "@/lib/firebase-utils"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"

interface ProductFormProps {
  initialData?: any
  categories: any[]
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  productId?: string
}

export function ProductForm({ initialData, categories, onSubmit, isLoading = false }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    price: initialData?.price || "",
    stock: initialData?.stock || "",
    featured: initialData?.featured || false,
  imageUrl: initialData?.imageUrl || "",
  externalImageUrl: initialData?.imageUrl || "",
    imagePath: initialData?.imagePath || "",
    sku: initialData?.sku || "",
    weight: initialData?.weight || "",
    dimensions: initialData?.dimensions || "",
    material: initialData?.material || "",
    color: initialData?.color || "",
    careInstructions: initialData?.careInstructions || "",
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
    if (!formData.title) {
      alert("Please enter a product title first")
      return
    }

    // Prevent duplicate/rapid requests
    if (generatingField) {
      console.warn("Already generating, please wait...")
      return
    }

    setGeneratingField(field)
    try {
      const response = await fetch(`/api/ai/generate-${field}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: formData.title,
          category: formData.category 
        }),
      })

      if (!response.ok) throw new Error("Failed to generate")

      const data = await response.json()
      setFormData((prev) => ({ ...prev, [field]: data[field] }))
    } catch (error) {
      console.error(`Error generating ${field}:`, error)
      // Graceful fallback generation when AI quota or model issues occur
      const title = formData.title
      const category = formData.category || "Home Decor"

      const slugify = (str: string) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")

      const abbrev = (str: string) => slugify(str).replace(/-/g, "").slice(0, 3).toUpperCase() || "GEN"
      const rand4 = () => Math.floor(1000 + Math.random() * 9000).toString()

      let fallback: string = ""
      switch (field) {
        case "slug":
          fallback = slugify(title)
          break
        case "description":
          fallback = `<p><strong>${title}</strong> by Ornella brings premium ${category.toLowerCase()} style to your home in Pakistan.</p>` +
            `<p>Crafted for elegance and everyday living, this piece is designed to elevate your space with quality materials and timeless design.</p>`
          break
        case "sku":
          fallback = `ORN-${abbrev(category || title)}-${rand4()}`
          break
        case "metaTitle": {
          const mt = `${title} | Ornella Pakistan`
          fallback = mt.length > 60 ? mt.slice(0, 57) + "..." : mt
          break
        }
        case "metaDescription": {
          const md = `Discover ${title} by Ornella in Pakistan — premium ${category.toLowerCase()} crafted for style and comfort. Shop now.`
          fallback = md.length > 160 ? md.slice(0, 157) + "..." : md
          break
        }
        case "keywords": {
          const base = [
            ...title.toLowerCase().split(/\s+/).filter(Boolean),
            category.toLowerCase(),
            "home decor",
            "ornella",
            "pakistan",
          ]
          // unique and join
          const uniq = Array.from(new Set(base)).slice(0, 10)
          fallback = uniq.join(", ")
          break
        }
        case "altText": {
          const at = `${title} premium ${category.toLowerCase()} by Ornella Pakistan`
          fallback = at
          break
        }
      }

      if (fallback) {
        setFormData((prev) => ({ ...prev, [field]: fallback }))
      } else {
        alert(`Failed to generate ${field}`)
      }
    } finally {
      setGeneratingField(null)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      
      // Create a new image for compression
      const img = document.createElement('img')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Create a temporary URL for the uploaded image
      const url = URL.createObjectURL(file)
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = () => {
          // Max dimensions
          const maxWidth = 1200
          const maxHeight = 1200
          
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions while maintaining aspect ratio
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
          
          // Set canvas dimensions
          canvas.width = width
          canvas.height = height
          
          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              setImageFile(compressedFile)
            }
          }, 'image/jpeg', 0.8) // 80% quality
          
          resolve(null)
        }
      })
      
      img.src = url
      // Clean up
      URL.revokeObjectURL(url)
      // clear external image url when a file is selected
      setFormData((prev) => ({ ...prev, externalImageUrl: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.imageUrl
      let imagePath = formData.imagePath || ""

      // If an external URL is provided, prefer it and skip upload
      if (formData.externalImageUrl && formData.externalImageUrl.trim() !== "") {
        imageUrl = formData.externalImageUrl.trim()
        imagePath = ""
      } else if (imageFile) {
        const timestamp = Date.now()
        const path = `products/${timestamp}-${imageFile.name}`
        const res = await uploadImage(imageFile, path)
        imageUrl = res.url
        imagePath = res.path
      }

      const submitData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        keywords: formData.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k),
        imageUrl,
        imagePath,
      }

      await onSubmit(submitData)
      router.push("/admin/products")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error saving product. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-12">
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Basic Information</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g., Ceramic Vase"
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
                disabled={!formData.title || generatingField === "slug"}
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
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("description")}
                disabled={!formData.title || generatingField === "description"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "description" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <div className="mt-2">
              <Editor
                id="description"
                apiKey="fsah9u2b1w2ksadcfnzrjl1kpwlwi0rrioo3596z4qp88b6z"
                value={formData.description}
                onEditorChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
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
              <Label htmlFor="category" className="text-gray-700">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-md bg-slate-50 focus:border-sky-200 focus:ring-sky-200 text-gray-800"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-700">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
                className="bg-slate-50 border-slate-200 focus:border-sky-200 focus:ring-sky-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-gray-700">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                required
                className="bg-slate-50 border-slate-200 focus:border-sky-200 focus:ring-sky-200"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
                />
                <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">
                  Featured Product
                </span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Product Details</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sku">SKU</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateWithAI("sku")}
                  disabled={!formData.title || generatingField === "sku"}
                  className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                >
                  <Sparkles className="h-3 w-3" />
                  {generatingField === "sku" ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="e.g., SKU-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder="e.g., 0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 10x20x15 cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                placeholder="e.g., Ceramic"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., Neutral"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careInstructions">Care Instructions</Label>
              <Textarea
                id="careInstructions"
                value={formData.careInstructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, careInstructions: e.target.value }))}
                placeholder="e.g., Hand wash only"
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Product Image</h3>
        <div className="space-y-6">
          {/* don't render Next/Image preview for external URLs (avoids Next.js unconfigured-host error)
              If a file was uploaded and imagePath is present we can show a preview; external URLs are accepted
              but not previewed here as requested. */}
          {formData.imageUrl && formData.imagePath && (
            <div className="relative w-full h-64 bg-slate-50 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={formData.imageUrl}
                alt={formData.altText || "Product preview"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
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
          <div className="space-y-2">
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

      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">SEO Settings</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle" className="text-gray-700">Meta Title</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("metaTitle")}
                disabled={!formData.title || generatingField === "metaTitle"}
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
              placeholder="e.g., Buy Ceramic Vase Online – Ornella"
              maxLength={60}
              className="bg-slate-50 border-slate-200 focus:border-sky-200 focus:ring-sky-200"
            />
            <p className="text-xs text-slate-500 mt-1.5">{formData.metaTitle.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription" className="text-gray-700">Meta Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("metaDescription")}
                disabled={!formData.title || generatingField === "metaDescription"}
                className="h-7 text-xs gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
              >
                <Sparkles className="h-3 w-3" />
                {generatingField === "metaDescription" ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <div className="mt-2">
              <Editor
                id="metaDescription"
                apiKey="fsah9u2b1w2ksadcfnzrjl1kpwlwi0rrioo3596z4qp88b6z"
                value={formData.metaDescription}
                onEditorChange={(content) => 
                  setFormData((prev) => ({
                    ...prev,
                    metaDescription: content,
                  }))
                }
                init={{
                  height: 150,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'charmap',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic | bullist numlist | ' +
                    'removeformat',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formData.metaDescription.length}/160 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateWithAI("keywords")}
                disabled={!formData.title || generatingField === "keywords"}
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
              placeholder="e.g., vase, ceramic, home decor, ornella"
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
                disabled={!formData.title || generatingField === "altText"}
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
              placeholder="e.g., Minimalist ceramic vase in neutral tones"
            />
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={uploading || isLoading} 
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-6 text-lg"
          >
            {uploading || isLoading ? "Saving..." : "Save Product"}
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
      </Card>
    </form>
  )
}
