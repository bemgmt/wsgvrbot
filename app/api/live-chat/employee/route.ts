import { NextRequest, NextResponse } from "next/server"
import { chatStore } from "@/lib/chat-store"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Get pending chat sessions (for employees to see)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get("employeeId")
    const type = searchParams.get("type") || "pending" // "pending" | "active"

    if (type === "pending") {
      const pendingSessions = await chatStore.getAllPendingSessions()
      return NextResponse.json(pendingSessions, { headers: corsHeaders })
    }

    if (type === "active" && employeeId) {
      const activeSessions = await chatStore.getEmployeeActiveSessions(employeeId)
      return NextResponse.json(activeSessions, { headers: corsHeaders })
    }

    return NextResponse.json(
      { error: "Invalid parameters" },
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error("[Live Chat] Get employee chats error:", error)
    return NextResponse.json(
      { error: "Failed to get chats" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Assign employee to a chat session
export async function POST(request: NextRequest) {
  try {
    const { chatId, employeeId, employeeName } = await request.json()

    if (!chatId || !employeeId || !employeeName) {
      return NextResponse.json(
        { error: "chatId, employeeId, and employeeName are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const success = await chatStore.assignEmployee(chatId, employeeId, employeeName)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to assign employee. Session may not be pending." },
        { status: 400, headers: corsHeaders }
      )
    }

    const session = await chatStore.getSession(chatId)
    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error("[Live Chat] Assign employee error:", error)
    return NextResponse.json(
      { error: "Failed to assign employee" },
      { status: 500, headers: corsHeaders }
    )
  }
}

