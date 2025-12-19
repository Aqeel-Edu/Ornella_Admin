import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Write a compelling, SEO-optimized product description for this home decor item sold in Pakistan:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Context: Ornella is a premium home decor brand in Pakistan offering quality products.

Requirements:
- 150-200 words
- Highlight features, benefits, and style
- Include relevant SEO keywords naturally
- Professional yet warm tone
- Format in HTML with <p> tags and <strong> for emphasis

Only respond with the HTML description, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const description = response.text.trim()

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating description:", error)
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
  }
}
