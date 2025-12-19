import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    const prompt = `Generate a URL-friendly slug for this blog post title: "${title}"

Requirements:
- All lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep it concise (max 60 characters)
- SEO-friendly

Return ONLY the slug, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const slug = response.text.trim()

    return NextResponse.json({ slug })
  } catch (error) {
    console.error("Error generating blog slug:", error)
    return NextResponse.json({ error: "Failed to generate slug" }, { status: 500 })
  }
}
