import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Send a message
export async function POST(request: NextRequest) {
  try {
    const { chatId, role, content, employeeId, employeeName } = await request.json()

    if (!chatId || !role || !content) {
      return NextResponse.json(
        { error: "chatId, role, and content are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const message = await chatStore.addMessage(chatId, {
      chatId,
      role,
      content,
      employeeId,
      employeeName,
    })

    if (!message) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(message, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Send message error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Get messages for a chat session
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

    return NextResponse.json(session.messages, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Get messages error:", error)
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500, headers: corsHeaders }
    )
  }
}

