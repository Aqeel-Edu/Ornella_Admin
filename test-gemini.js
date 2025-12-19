const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testGeneration() {
  try {
    console.log("Testing Gemini API...\n");
    
    // Correct syntax from documentation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello in one word",
    });
    
    console.log("✓ SUCCESS! Response:", response.text);
  } catch (error) {
    console.error("Error with gemini-2.5-flash:", error.message);
    
    // Try the experimental model
    try {
      console.log("\nTrying gemini-2.0-flash-exp...");
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: "Say hello in one word",
      });
      console.log("✓ SUCCESS with gemini-2.0-flash-exp! Response:", response.text);
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

testGeneration();
