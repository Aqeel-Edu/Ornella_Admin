import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, excerpt, category } = await request.json()

    const prompt = `Generate an SEO-optimized meta description for this blog post:

Title: ${title}
Category: ${category || "Home Decor"}
${excerpt ? `Excerpt: ${excerpt}` : ""}

Requirements:
- 150-160 characters
- Include primary keywords naturally
- Compelling call-to-action or value proposition
- Relevant to Pakistani home decor audience
- No quotes

Return ONLY the meta description, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const metaDescription = response.text.trim().substring(0, 160)

    return NextResponse.json({ metaDescription })
  } catch (error) {
    console.error("Error generating blog meta description:", error)
    return NextResponse.json({ error: "Failed to generate meta description" }, { status: 500 })
  }
}
