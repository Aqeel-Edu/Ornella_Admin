"use client"

import { useState, useEffect } from "react"
import { CategoryForm } from "@/components/admin/CategoryForm"
import { getCategories, updateCategory } from "@/lib/firebase-utils"
import { useParams } from "next/navigation"

export default function EditCategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categories = await getCategories()
        const found = categories.find((c) => c.id === categoryId)
        setCategory(found)
      } catch (error) {
        console.error("Error fetching category:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId])

  const handleSubmit = async (data: any) => {
    await updateCategory(categoryId, data)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!category) {
    return <div className="text-center py-8">Category not found</div>
  }

  return (
    <div className="max-w-2xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
        <p className="text-muted-foreground">Update category information</p>
      </div>

      <CategoryForm initialData={category} onSubmit={handleSubmit} />
    </div>
  )
}
