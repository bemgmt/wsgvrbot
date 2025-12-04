import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Close a chat session
export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const success = chatStore.closeSession(chatId)

    if (!success) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json({ success: true, chatId }, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Close session error:", error)
    return NextResponse.json(
      { error: "Failed to close session" },
      { status: 500, headers: corsHeaders }
    )
  }
}

