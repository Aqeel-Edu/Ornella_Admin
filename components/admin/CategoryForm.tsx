"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { generateSlug, uploadImage } from "@/lib/firebase-utils"
import { useRouter } from "next/navigation"

interface CategoryFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function CategoryForm({ initialData, onSubmit, isLoading = false }: CategoryFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    imagePath: initialData?.imagePath || "",
    externalImageUrl: initialData?.externalImageUrl || "", // Added externalImageUrl
  })

  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('CategoryForm submit clicked', { formData })
      let imageUrl = formData.imageUrl
      let imagePath = formData.imagePath || ""

      // If external URL provided, prefer it and skip upload
      if (formData.externalImageUrl && formData.externalImageUrl.trim() !== "") {
        imageUrl = formData.externalImageUrl.trim()
        imagePath = ""
      } else if (imageFile) {
        console.log('Uploading category image...', imageFile)
        const timestamp = Date.now()
        const path = `categories/${timestamp}-${imageFile.name}`
        const res = await uploadImage(imageFile, path)
        console.log('Upload result', res)
        imageUrl = res.url
        imagePath = res.path
      }

      console.log('Calling onSubmit for category with', { ...formData, imageUrl, imagePath })
      await onSubmit({ ...formData, imageUrl, imagePath })
      console.log('Category saved, navigating...')
      router.push("/admin/categories")
    } catch (error: any) {
      console.error("Error submitting form:", error)
      alert("Error saving category. Please try again. " + (error?.message || ""))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]

      // Compress image client-side (resize to max 1200x1200, JPG 80%)
      const img = document.createElement('img')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
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

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                setImageFile(compressedFile)
                const previewUrl = URL.createObjectURL(compressedFile)
                setFormData((prev) => ({ ...prev, imageUrl: previewUrl }))
                // revoke original file url
                URL.revokeObjectURL(url)
              } else {
                // fallback to original file if compression fails
                setImageFile(file)
                setFormData((prev) => ({ ...prev, imageUrl: url }))
              }
            },
            'image/jpeg',
            0.8
          )
        } catch (err) {
          // on any error, fallback to original
          setImageFile(file)
          setFormData((prev) => ({ ...prev, imageUrl: url }))
        }
      }

        img.onerror = () => { // Updated to use img.onerror correctly
          // fallback
          setImageFile(file)
          setFormData((prev) => ({ ...prev, imageUrl: url }))
        }

        // clear external url when file selected
        setFormData((prev) => ({ ...prev, externalImageUrl: "" })) // Clear externalImageUrl
      img.src = url
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Category Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" value={formData.name} onChange={handleNameChange} placeholder="e.g., Wall Art" required />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="auto-generated"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Category description"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="image">Category Image</Label>
            {formData.imageUrl && (
              <div className="mt-2 w-full h-40 bg-slate-50 rounded overflow-hidden flex items-center justify-center">
                <img src={formData.imageUrl} alt={formData.name || 'category'} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="mt-2">
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="mt-2">
              <Label htmlFor="externalImageUrl">Or paste image URL</Label>
              <Input
                id="externalImageUrl"
                value={formData.externalImageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, externalImageUrl: e.target.value, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          onClick={() => console.log('Category Save button clicked')}
        >
          {isLoading ? "Saving..." : "Save Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
