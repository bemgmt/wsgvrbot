import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Take over an AI chat session (convert to live chat)
export async function POST(request: NextRequest) {
  try {
    const { chatId, employeeId, employeeName } = await request.json()

    if (!chatId || !employeeId || !employeeName) {
      return NextResponse.json(
        { error: "chatId, employeeId, and employeeName are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const success = await chatStore.convertAIToLive(chatId, employeeId, employeeName)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to take over chat. Session may not be an active AI session." },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = await chatStore.getSession(chatId)
    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[AI Chat] Takeover error:", error)
    return NextResponse.json(
      { error: "Failed to take over chat" },
      { status: 500, headers: corsHeaders }
    )
  }
}

