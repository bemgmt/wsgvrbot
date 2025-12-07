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

// Create a new chat session
export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = await chatStore.createSession(userId, userName)

    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Create session error:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Get a chat session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chatId")

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = await chatStore.getSession(chatId)

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Get session error:", error)
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500, headers: corsHeaders }
    )
  }
}

