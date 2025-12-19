import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category, content } = await request.json()

    const prompt = `Generate SEO keywords for this blog post:

Title: ${title}
Category: ${category || "Home Decor"}
${content ? `Content Preview: ${content.substring(0, 200)}...` : ""}

Requirements:
- 6-10 relevant keywords
- Mix of broad and specific terms
- Include location "Pakistan" if relevant
- Comma-separated format
- No hashtags or special characters
- Focus on search intent

Return ONLY the comma-separated keywords, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const keywords = response.text.trim()

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("Error generating blog keywords:", error)
    return NextResponse.json({ error: "Failed to generate keywords" }, { status: 500 })
  }
}
