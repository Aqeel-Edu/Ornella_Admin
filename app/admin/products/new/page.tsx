"use client"

import { useState, useEffect } from "react"
import { ProductForm } from "@/components/admin/ProductForm"
import { addProduct, getCategories } from "@/lib/firebase-utils"

export default function NewProductPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (data: any) => {
    await addProduct(data)
  }

  return (
    <div className="max-w-4xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product in your catalog</p>
      </div>

      {!loading && <ProductForm categories={categories} onSubmit={handleSubmit} isLoading={loading} />}
    </div>
  )
}
