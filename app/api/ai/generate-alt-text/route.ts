import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Create an accessible and SEO-friendly alt text for the product image:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Requirements:
- Descriptive and concise (8-12 words)
- Include product type, style, and color if implied
- Accessible for screen readers
- Include SEO keywords naturally
- Start with what the image shows

Only respond with the alt text, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const altText = response.text.trim()

    return NextResponse.json({ altText })
  } catch (error) {
    console.error("Error generating alt text:", error)
    return NextResponse.json({ error: "Failed to generate alt text" }, { status: 500 })
  }
}
