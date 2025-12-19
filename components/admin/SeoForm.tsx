"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface SeoFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function SeoForm({ initialData, onSubmit, isLoading = false }: SeoFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    page: initialData?.page || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords?.join(", ") || "",
    slug: initialData?.slug || "",
    h2: initialData?.h2 || "",
    h3: initialData?.h3 || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter((k: string) => k),
      }
      await onSubmit(submitData)
      router.push("/admin/seo")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error saving SEO data. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Page Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="page">Page Name</Label>
            <Input
              id="page"
              value={formData.page}
              onChange={(e) => setFormData((prev) => ({ ...prev, page: e.target.value }))}
              placeholder="e.g., home, shop, about"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Page Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g., /"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">SEO Metadata</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="Page title for search engines"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.metaTitle.length}/60 characters</p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
              placeholder="Page description for search engines"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.metaDescription.length}/160 characters</p>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="e.g., home decor, wall art, ornella"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Page Headings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="h2">H2 Heading</Label>
            <Input
              id="h2"
              value={formData.h2}
              onChange={(e) => setFormData((prev) => ({ ...prev, h2: e.target.value }))}
              placeholder="Main page heading"
            />
          </div>

          <div>
            <Label htmlFor="h3">H3 Heading</Label>
            <Input
              id="h3"
              value={formData.h3}
              onChange={(e) => setFormData((prev) => ({ ...prev, h3: e.target.value }))}
              placeholder="Secondary page heading"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h4 className="font-semibold mb-2">SERP Preview</h4>
        <div className="space-y-1 text-sm">
          <p className="text-primary font-medium">{formData.metaTitle || "Your page title"}</p>
          <p className="text-muted-foreground text-xs">{formData.slug || "/page"} • Ornella</p>
          <p className="text-muted-foreground text-xs line-clamp-2">
            {formData.metaDescription || "Your page description will appear here"}
          </p>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : "Save SEO Data"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
