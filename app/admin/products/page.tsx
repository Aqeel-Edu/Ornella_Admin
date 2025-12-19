"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getProducts, deleteProduct, getCategories } from "@/lib/firebase-utils"
import { Edit2, Trash2, Plus } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterFeatured, setFilterFeatured] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()])
        setProducts(productsData)
        setFilteredProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory)
    }

    if (filterFeatured === "true") {
      filtered = filtered.filter((p) => p.featured)
    } else if (filterFeatured === "false") {
      filtered = filtered.filter((p) => !p.featured)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, filterCategory, filterFeatured, products])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
        setProducts(products.filter((p) => p.id !== id))
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Error deleting product")
      }
    }
  }

  return (
    <div className="space-y-8 px-6 pt-8 pb-12 max-w-7xl mx-auto ml-8 mt-8">
      {/* Top Header Section */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 p-10 text-white shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">🛍️ Product Management</h1>
        <p className="text-emerald-100 text-sm">
          Add, edit, or remove products — manage your entire store inventory easily.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Product Catalog</h2>
          <p className="text-muted-foreground">Search, filter, and manage your products</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <Card className="p-6 shadow-sm border border-gray-200">
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Filter by Featured</label>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
              >
                <option value="">All Products</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilterCategory("")
                  setFilterFeatured("")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="overflow-hidden shadow-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium">{product.title}</td>
                    <td className="px-6 py-4 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-sm">Rs. {product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock > 10 
                            ? "bg-emerald-100 text-emerald-800" 
                            : product.stock > 0 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
