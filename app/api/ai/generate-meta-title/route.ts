import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Create an SEO-optimized meta title for this home decor product in Pakistan:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Requirements:
- Maximum 60 characters
- Include "Pakistan" or "Ornella" brand name
- Include primary keywords
- Compelling and clickable
- Format: "Product Name | Ornella Pakistan" or similar

Only respond with the meta title, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const metaTitle = response.text.trim()

    return NextResponse.json({ metaTitle })
  } catch (error) {
    console.error("Error generating meta title:", error)
    return NextResponse.json({ error: "Failed to generate meta title" }, { status: 500 })
  }
}
