import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Generate SEO keywords for this home decor product sold in Pakistan:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Requirements:
- 8-12 relevant keywords
- Include "Pakistan", "home decor", product type
- Mix of broad and specific terms
- Comma-separated list
- Lowercase
- Focus on Pakistani market search terms

Only respond with the comma-separated keywords, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const keywords = response.text.trim()

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("Error generating keywords:", error)
    return NextResponse.json({ error: "Failed to generate keywords" }, { status: 500 })
  }
}
