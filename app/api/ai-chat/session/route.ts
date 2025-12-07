import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Create a new AI chat session
export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = chatStore.createAISession(userId, userName)

    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[AI Chat] Create session error:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Get an AI chat session or list all active AI sessions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chatId")
    const listAll = searchParams.get("listAll")

    // List all active AI sessions (for employee monitoring)
    if (listAll === "true") {
      const sessions = chatStore.getAllAISessions()
      return NextResponse.json(sessions, { headers: corsHeaders })
    }

    // Get a specific session
    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = chatStore.getSession(chatId)

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[AI Chat] Get session error:", error)
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500, headers: corsHeaders }
    )
  }
}

