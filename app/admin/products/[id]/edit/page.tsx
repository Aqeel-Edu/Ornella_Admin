"use client"

import { useState, useEffect } from "react"
import { ProductForm } from "@/components/admin/ProductForm"
import { getProduct, updateProduct, getCategories } from "@/lib/firebase-utils"
import { useParams } from "next/navigation"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([getProduct(productId), getCategories()])
        setProduct(productData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  const handleSubmit = async (data: any) => {
    await updateProduct(productId, data)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>
  }

  return (
    <div className="max-w-4xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <ProductForm initialData={product} categories={categories} onSubmit={handleSubmit} isLoading={loading} />
    </div>
  )
}
