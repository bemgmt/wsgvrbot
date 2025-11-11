import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const VICON_SYSTEM_PROMPT = `You are VICON's intelligent fire protection assistant. You help homeowners learn about VICON's AI-powered fire detection and suppression systems.

Key Information about VICON:
- VK-240-25-3000 Intelligent Fire Sprinkler System with AI detection
- 24/7 AI monitoring with precise fire localization
- Automatic high-pressure spray suppression
- Remote app control with live video feed
- Solar-powered and water-efficient
- $200/month financing available
- Locations: Serving Southern California and surrounding areas
- Contact: (904) 945-3280 or vicontech.group

When answering:
1. Be friendly, professional, and reassuring
2. Emphasize safety and quick response times
3. Mention financing options when appropriate
4. Suggest scheduling a consultation for specific needs
5. Answer general fire safety questions
6. Keep responses concise and natural (2-3 sentences max)

If asked about pricing or a demo, encourage them to provide contact info or schedule a consultation.`

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 })
    }

    const conversationContext = conversationHistory
      .map((msg: { sender: string; text: string }) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n")

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: VICON_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${conversationContext}\n\nUser: ${message}`,
        },
      ],
    })

    return Response.json({ reply: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
