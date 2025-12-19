import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Create an SEO-optimized meta description for this home decor product in Pakistan:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Requirements:
- Maximum 160 characters
- Include primary keywords and "Pakistan"
- Call-to-action oriented
- Describe key benefits
- Compelling for Google search results

Only respond with the meta description text, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const metaDescription = response.text.trim()

    return NextResponse.json({ metaDescription })
  } catch (error) {
    console.error("Error generating meta description:", error)
    return NextResponse.json({ error: "Failed to generate meta description" }, { status: 500 })
  }
}
