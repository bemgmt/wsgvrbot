import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import knowledgeBase from "@/wsgvr_chatbot_knowledge.json"
import personnelData from "@/wsgvr_personnel_2015_2024.json"

// CORS headers for iframe embeds
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

const buildSystemPrompt = () => {
  return `You are a helpful assistant for the West San Gabriel Valley REALTORS® Association.
You provide information about:
- Membership benefits and how to join
- Real estate education and professional development courses
- Events and networking opportunities
- Local real estate market information
- Resources and tools for REALTORS®
- Compliance and industry standards
- Ethics and professional conduct guidelines
- Past presidents, officers, and award recipients

Be professional, friendly, and informative. If asked about something outside your knowledge base,
suggest contacting the association directly at the main office or visiting the website.

Always encourage members to take advantage of association resources and events.

## Knowledge Base

### Organization Information
${JSON.stringify(knowledgeBase, null, 2)}

### Past Personnel and Leadership (2015-2024)
${JSON.stringify(personnelData, null, 2)}

When asked about past presidents, officers, or award recipients, use the personnel data above to provide accurate information.
Include relevant details such as their years of service, awards received, and biographical information when available.`
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const response = await generateText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(),
      messages,
    })

    return Response.json(
      { content: response.text },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500, headers: corsHeaders }
    )
  }
}
