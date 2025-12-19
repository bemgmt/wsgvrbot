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
  const requestStartTime = Date.now()
  let chatId: string | undefined
  let employeeId: string | undefined
  let employeeName: string | undefined

  try {
    // Parse and validate request body
    const body = await request.json()
    chatId = body.chatId
    employeeId = body.employeeId
    employeeName = body.employeeName

    // Detailed validation with specific error messages
    if (!chatId) {
      console.warn("[AI Chat Takeover] Missing chatId in request")
      return NextResponse.json(
        {
          error: "chatId is required",
          details: "The chat session ID must be provided to take over the conversation",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!employeeId) {
      console.warn(`[AI Chat Takeover] Missing employeeId for chatId: ${chatId}`)
      return NextResponse.json(
        {
          error: "employeeId is required",
          details: "The employee ID must be provided to identify who is taking over the chat",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!employeeName) {
      console.warn(
        `[AI Chat Takeover] Missing employeeName for chatId: ${chatId}, employeeId: ${employeeId}`
      )
      return NextResponse.json(
        {
          error: "employeeName is required",
          details: "The employee name must be provided for display to the user",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate data types and formats
    if (typeof chatId !== "string" || chatId.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid chatId format",
          details: "chatId must be a non-empty string",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    if (typeof employeeId !== "string" || employeeId.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid employeeId format",
          details: "employeeId must be a non-empty string",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    if (typeof employeeName !== "string" || employeeName.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid employeeName format",
          details: "employeeName must be a non-empty string",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log(
      `[AI Chat Takeover] Attempting takeover: chatId=${chatId}, employee=${employeeName} (${employeeId})`
    )

    // Attempt the conversion with detailed result
    const result = await chatStore.convertAIToLive(chatId.trim(), employeeId.trim(), employeeName.trim())

    if (!result.success) {
      const requestTime = Date.now() - requestStartTime
      console.warn(
        `[AI Chat Takeover] Failed takeover for chatId: ${chatId} after ${requestTime}ms. Error: ${result.error}`
      )
      
      return NextResponse.json(
        {
          error: result.error || "Failed to take over chat",
          details: result.error === "Session not found"
            ? "The specified chat session does not exist or has expired"
            : result.error?.includes("not in AI mode")
            ? "This chat session is not currently in AI mode and cannot be taken over"
            : result.error?.includes("not active")
            ? "This chat session is not active and cannot be taken over"
            : "The session may not be an active AI session, or it may have already been taken over",
          session: result.session || null,
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Success - return detailed response
    const requestTime = Date.now() - requestStartTime
    console.log(
      `[AI Chat Takeover] Successfully took over chatId: ${chatId} ` +
      `(Duration: ${result.metadata?.sessionAge}, Messages: ${result.metadata?.messageCount}, ` +
      `Processing: ${requestTime}ms)`
    )

    return NextResponse.json(
      {
        success: true,
        session: result.session,
        metadata: {
          takeover: {
            takenOverAt: result.session?.takeoverMetadata?.takenOverAt,
            takenOverBy: result.session?.takeoverMetadata?.takenOverByName,
            employeeId: result.session?.employeeId,
          },
          sessionStats: result.metadata,
          processingTime: requestTime,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    const requestTime = Date.now() - requestStartTime
    console.error(
      `[AI Chat Takeover] Unexpected error for chatId: ${chatId || "unknown"} after ${requestTime}ms:`,
      error
    )

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: "The request body must be valid JSON",
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to take over chat",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
        chatId: chatId || null,
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

