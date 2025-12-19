"use client"

import { CategoryForm } from "@/components/admin/CategoryForm"
import { addCategory } from "@/lib/firebase-utils"

export default function NewCategoryPage() {
  const handleSubmit = async (data: any) => {
    console.log('NewCategoryPage.handleSubmit called with', data)
    const id = await addCategory(data)
    console.log('addCategory returned id', id)
  }

  return (
    <div className="max-w-2xl ml-8 mt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add New Category</h1>
        <p className="text-muted-foreground">Create a new product category</p>
      </div>

      <CategoryForm onSubmit={handleSubmit} />
    </div>
  )
}
