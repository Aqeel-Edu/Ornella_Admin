"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCategories, deleteCategory, getProducts } from "@/lib/firebase-utils"
import { Edit2, Trash2, Plus } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([getCategories(), getProducts()])
        setCategories(categoriesData)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id)
        setCategories(categories.filter((c) => c.id !== id))
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("Error deleting category")
      }
    }
  }

  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto ml-8 mt-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-purple-100">Organize your products into categories</p>
          </div>
          <Link href="/admin/categories/new">
            <Button className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 hover:border-purple-300 font-medium shadow-sm hover:shadow-md transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-purple-50 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">No Categories Yet</h3>
              <p className="text-purple-600 mb-4">Start by creating your first category</p>
              <Link href="/admin/categories/new">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-none hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {category.name}
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                    {getProductCount(category.name)} products
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                  {category.description || "No description provided"}
                </p>

                <div className="flex gap-3">
                  <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Category
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
                    className="bg-white/50 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
