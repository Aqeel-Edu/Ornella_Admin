"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSeoPages } from "@/lib/firebase-utils"
import { Edit2 } from "lucide-react"

export default function SeoPage() {
  const [seoPages, setSeoPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeoPages = async () => {
      try {
        const data = await getSeoPages()
        setSeoPages(data)
      } catch (error) {
        console.error("Error fetching SEO pages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeoPages()
  }, [])

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto ml-8 mt-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">SEO Manager</h1>
          <p className="text-emerald-100">Optimize your pages for search engines</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : seoPages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-emerald-50 rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">No SEO Pages Found</h3>
              <p className="text-emerald-600 mb-4">Start optimizing your pages for better visibility</p>
            </div>
          </div>
        ) : (
          seoPages.map((page) => (
            <Card key={page.id} className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-none hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-2 inline-block">
                      /{page.slug}
                    </span>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent capitalize">
                      {page.page}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-white">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Meta Title</p>
                    <p className="text-sm text-emerald-900 line-clamp-2">{page.metaTitle}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-white">
                    <p className="text-xs font-semibold text-teal-700 mb-1">Meta Description</p>
                    <p className="text-sm text-teal-900 line-clamp-2">{page.metaDescription}</p>
                  </div>
                </div>

                <Link href={`/admin/seo/${page.id}/edit`}>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg transition-all duration-300">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit SEO Settings
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
