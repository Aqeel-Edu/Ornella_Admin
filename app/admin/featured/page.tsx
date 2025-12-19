"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProducts, updateProduct } from "@/lib/firebase-utils"

export default function FeaturedPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const featuredProducts = products.filter((p) => p.featured)

  const handleToggleFeatured = async (product: any) => {
    try {
      await updateProduct(product.id, { featured: !product.featured })
      setProducts(products.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p)))
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error updating product")
    }
  }

  const handleQuickEdit = async (productId: string) => {
    try {
      await updateProduct(productId, editData)
      setProducts(products.map((p) => (p.id === productId ? { ...p, ...editData } : p)))
      setEditingId(null)
      setEditData({})
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error updating product")
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto ml-8 mt-8">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Featured Products</h1>
          <p className="text-amber-100">Showcase your best products ({featuredProducts.length} featured)</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-amber-50 to-white">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-amber-800 mb-2">No Featured Products</h3>
              <p className="text-amber-600 mb-6">Highlight your best products by marking them as featured</p>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg transition-all duration-300">
                Add Featured Products
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-none hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex gap-8">
                    {product.imageUrl && (
                      <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      {editingId === product.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-amber-700">Product Title</Label>
                            <Input
                              value={editData.title || product.title}
                              onChange={(e) =>
                                setEditData((prev: any) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              className="border-amber-200 focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <Label className="text-amber-700">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.price || product.price}
                              onChange={(e) =>
                                setEditData((prev: any) => ({
                                  ...prev,
                                  price: Number.parseFloat(e.target.value),
                                }))
                              }
                              className="border-amber-200 focus:border-amber-500"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => handleQuickEdit(product.id)}
                              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingId(null)
                                setEditData({})
                              }}
                              className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {product.title}
                              </h3>
                              <p className="text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-700 inline-block mb-3">
                                {product.category}
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingId(product.id)
                                setEditData({
                                  title: product.title,
                                  price: product.price,
                                })
                              }}
                              className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              Quick Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleToggleFeatured(product)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Remove from Featured
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-none p-6">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          All Products
        </h3>
        <p className="text-amber-600 mb-6">Click to toggle featured status for your products</p>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r hover:from-amber-50 hover:to-white border border-amber-100 transition-all duration-300"
            >
              <span className="font-medium text-amber-900">{product.title}</span>
              <Button
                className={product.featured ? 
                  "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg" :
                  "bg-white border-amber-200 text-amber-700 hover:bg-amber-50"}
                onClick={() => handleToggleFeatured(product)}
              >
                {product.featured ? "★ Featured" : "Add to Featured"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
