import { NextRequest, NextResponse } from "next/server"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// Client-specific configurations
const clientConfigs: Record<string, {
  greeting: string
  title: string
  subtitle: string
  primaryColor?: string
  knowledgeBaseId?: string
}> = {
  wsgvr: {
    greeting: "Hello! I'm the West San Gabriel Valley REALTORS® Association assistant. How can I help you today?",
    title: "REALTORS® Assistant",
    subtitle: "West San Gabriel Valley",
    primaryColor: "#0b1220",
  },
  default: {
    greeting: "Hello! How can I help you today?",
    title: "Support",
    subtitle: "Chat Assistant",
    primaryColor: "#0b1220",
  },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const client = searchParams.get("client") || "default"

    // Get client-specific config or use default
    const config = clientConfigs[client] || clientConfigs.default

    return NextResponse.json(
      {
        client,
        ...config,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error("[Widget Config] Error:", error)
    return NextResponse.json(
      { error: "Failed to get widget config" },
      { status: 500, headers: corsHeaders }
    )
  }
}

