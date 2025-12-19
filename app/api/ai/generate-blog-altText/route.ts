import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category } = await request.json()

    const prompt = `Generate descriptive alt text for the featured image of this blog post:

Title: ${title}
Category: ${category || "Home Decor"}

Requirements:
- Describe the image content clearly
- Include relevant keywords naturally
- 100-125 characters maximum
- Accessible for screen readers
- No quotes or special formatting

Return ONLY the alt text, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const altText = response.text.trim().substring(0, 125)

    return NextResponse.json({ altText })
  } catch (error) {
    console.error("Error generating blog alt text:", error)
    return NextResponse.json({ error: "Failed to generate alt text" }, { status: 500 })
  }
}
