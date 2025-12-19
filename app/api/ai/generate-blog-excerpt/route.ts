import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category } = await request.json()

    const prompt = `Generate a compelling blog excerpt for this article:

Title: ${title}
Category: ${category || "Home Decor"}

Requirements:
- 2-3 engaging sentences
- 120-160 characters total
- Hook the reader
- Mention Pakistani home context if relevant
- No quotes or extra formatting

Return ONLY the excerpt text, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const excerpt = response.text.trim()

    return NextResponse.json({ excerpt })
  } catch (error) {
    console.error("Error generating blog excerpt:", error)
    return NextResponse.json({ error: "Failed to generate excerpt" }, { status: 500 })
  }
}
