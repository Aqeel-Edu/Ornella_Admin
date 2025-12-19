import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const prompt = `Generate a unique SKU code for this product:
Product: "${title}"
Category: "${category || 'Home Decor'}"

Rules:
- Use format: ORN-XXX-NNNN (ORN = Ornella brand)
- XXX = 3-letter category abbreviation (e.g., VAS for vase, CUS for cushion, DEC for decor)
- NNNN = 4-digit number (use product name hash or random)
- Uppercase only
- Example: ORN-VAS-2847

Only respond with the SKU code, nothing else.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    
    const sku = response.text.trim()

    return NextResponse.json({ sku })
  } catch (error) {
    console.error("Error generating SKU:", error)
    return NextResponse.json({ error: "Failed to generate SKU" }, { status: 500 })
  }
}
