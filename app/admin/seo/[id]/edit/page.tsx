"use client"

import { useState, useEffect } from "react"
import { SeoForm } from "@/components/admin/SeoForm"
import { getSeoPages, updateSeoPage } from "@/lib/firebase-utils"
import { useParams } from "next/navigation"

export default function EditSeoPage() {
  const params = useParams()
  const seoId = params.id as string
  const [seoPage, setSeoPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeoPage = async () => {
      try {
        const pages = await getSeoPages()
        const found = pages.find((p) => p.id === seoId)
        setSeoPage(found)
      } catch (error) {
        console.error("Error fetching SEO page:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeoPage()
  }, [seoId])

  const handleSubmit = async (data: any) => {
    await updateSeoPage(seoId, data)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!seoPage) {
    return <div className="text-center py-8">SEO page not found</div>
  }

  return (
    <div className="max-w-2xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit SEO Settings</h1>
        <p className="text-muted-foreground capitalize">Page: {seoPage.page}</p>
      </div>

      <SeoForm initialData={seoPage} onSubmit={handleSubmit} />
    </div>
  )
}
