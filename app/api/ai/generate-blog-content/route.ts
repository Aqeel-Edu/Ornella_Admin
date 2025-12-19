import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, category, excerpt } = await request.json()

    const prompt = `Write a detailed, well-researched blog article specifically about: "${title}"

Context:
- Category: ${category || "Home Decor"}
${excerpt ? `- Overview: ${excerpt}` : ""}
- Target Audience: Pakistani homeowners and interior design enthusiasts
- Tone: Professional yet conversational, engaging and informative

Content Structure (MUST follow this format):
1. Introduction (2-3 paragraphs)
   - Hook the reader with a compelling opening
   - Explain the topic's relevance
   - Preview what they'll learn

2. Main Body (4-6 sections with specific subtopics related to "${title}")
   - Each section should have an <h2> heading
   - Include practical examples and tips
   - Use bullet points (<ul>, <li>) for lists
   - Add subheadings (<h3>) where appropriate
   - Incorporate real-world scenarios for Pakistani homes

3. Conclusion (2 paragraphs)
   - Summarize key takeaways
   - Encourage action or further exploration

Formatting Requirements:
- Use proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Each paragraph should be 3-5 sentences
- Include 8-12 paragraphs total (medium length, approximately 1000-1500 words)
- Use descriptive headings that relate directly to "${title}"
- Add spacing between sections for readability

Quality Standards:
- Stay focused on the specific topic: "${title}"
- Provide actionable, specific advice
- Include cultural context for Pakistani homes when relevant
- Avoid generic content - be specific and detailed
- No fluff or filler content

Return ONLY the HTML content with proper formatting. NO markdown, NO extra explanations.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const content = response.text.trim()

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating blog content:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
