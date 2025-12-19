import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Generate a clean, SEO-friendly URL slug for this home decor product sold in Pakistan: "${title}". 
Rules:
- Lowercase only
- Use hyphens to separate words
- Remove special characters
- Keep it short and descriptive
- Focus on SEO keywords

Only respond with the slug, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const slug = response.text.trim()

    return NextResponse.json({ slug })
  } catch (error) {
    console.error("Error generating slug:", error)
    return NextResponse.json({ error: "Failed to generate slug" }, { status: 500 })
  }
}
