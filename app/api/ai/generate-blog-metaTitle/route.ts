import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category } = await request.json()

    const prompt = `Generate an SEO-optimized meta title for this blog post:

Title: ${title}
Category: ${category || "Home Decor"}

Requirements:
- Maximum 60 characters
- Include main keyword
- Add brand name "Ornella Blog" at the end if space allows
- Compelling and click-worthy
- No quotes or special characters

Return ONLY the meta title, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const metaTitle = response.text.trim().substring(0, 60)

    return NextResponse.json({ metaTitle })
  } catch (error) {
    console.error("Error generating blog meta title:", error)
    return NextResponse.json({ error: "Failed to generate meta title" }, { status: 500 })
  }
}
