import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category, content } = await request.json()

    const prompt = `Generate relevant blog tags for this article:

Title: ${title}
Category: ${category || "Home Decor"}
${content ? `Content Preview: ${content.substring(0, 200)}...` : ""}

Requirements:
- 5-8 relevant tags
- Mix of broad and specific terms
- Include category-related tags
- Comma-separated format
- No hashtags or special characters
- Relevant to Pakistani home decor market

Return ONLY the comma-separated tags, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const tags = response.text.trim()

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error generating blog tags:", error)
    return NextResponse.json({ error: "Failed to generate tags" }, { status: 500 })
  }
}
