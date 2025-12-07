import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Poll for new messages (for real-time updates)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chatId = searchParams.get("chatId")
    const lastMessageId = searchParams.get("lastMessageId")

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

    // If lastMessageId is provided, return only new messages
    if (lastMessageId) {
      const lastMessageIndex = session.messages.findIndex((m) => m.id === lastMessageId)
      const newMessages = session.messages.slice(lastMessageIndex + 1)
      return NextResponse.json(
        {
          messages: newMessages,
          sessionStatus: session.status,
          hasNewMessages: newMessages.length > 0,
        },
        { headers: corsHeaders }
      )
    }

    // Return all messages if no lastMessageId
    return NextResponse.json(
      {
        messages: session.messages,
        sessionStatus: session.status,
        hasNewMessages: false,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[Live Chat] Poll error:", error)
    return NextResponse.json(
      { error: "Failed to poll messages" },
      { status: 500, headers: corsHeaders }
    )
  }
}

