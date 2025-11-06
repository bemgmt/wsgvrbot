import { generateText } from "ai"

const systemPrompt = `You are a helpful assistant for the West San Gabriel Valley REALTORS® Association. 
You provide information about:
- Membership benefits and how to join
- Real estate education and professional development courses
- Events and networking opportunities
- Local real estate market information
- Resources and tools for REALTORS®
- Compliance and industry standards
- Ethics and professional conduct guidelines

Be professional, friendly, and informative. If asked about something outside your knowledge base, 
suggest contacting the association directly at the main office or visiting the website.

Always encourage members to take advantage of association resources and events.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const response = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages,
    })

    return Response.json({
      content: response.text,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
