import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const airesponse = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ FIXED MODEL
      messages: [
        {
          role: "system",
          content: `
You are a healthcare assistant.
DO NOT diagnose diseases.
Provide general health tips, precautions, and lifestyle advice.
Clearly say when the user should consult a doctor.
Always add a medical disclaimer at the end. Within 2 or 3 lines.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    res.json({
      response: airesponse.choices[0].message.content,
    });
  } catch (err) {
    console.error("Groq Error:", err);
    res.status(500).json({ error: "AI service failed" });
  }
};