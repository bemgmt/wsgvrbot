// Persistent chat store using Vercel KV
import { kv } from "@vercel/kv"

export interface ChatMessage {
  id: string
  chatId: string
  role: "user" | "employee" | "assistant"
  content: string
  timestamp: string // ISO string for JSON serialization
  employeeId?: string
  employeeName?: string
}

export interface ChatSession {
  id: string
  userId: string
  userName?: string
  employeeId?: string
  employeeName?: string
  chatMode: "ai" | "live"
  status: "pending" | "active" | "closed"
  createdAt: string // ISO string for JSON serialization
  updatedAt: string // ISO string for JSON serialization
  messages: ChatMessage[]
  takeoverMetadata?: {
    takenOverAt: string // ISO string for JSON serialization
    takenOverBy: string // employeeId
    takenOverByName: string // employeeName
    aiSessionDuration: number // milliseconds
    messageCountAtTakeover: number
    lastAIMessage?: string // Last AI assistant message before takeover
  }
}

// KV key prefixes
const SESSION_PREFIX = "chat:session:"
const PENDING_SET = "chat:pending"
const AI_SET = "chat:ai"
const ACTIVE_SET = "chat:active"
const EMPLOYEE_PREFIX = "chat:employee:"

// TTL for sessions (24 hours)
const SESSION_TTL = 60 * 60 * 24

export class ChatStore {
  async createSession(userId: string, userName?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      userName,
      chatMode: "live",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    }

    await kv.set(`${SESSION_PREFIX}${session.id}`, session, { ex: SESSION_TTL })
    await kv.sadd(PENDING_SET, session.id)

    return session
  }

  async createAISession(userId: string, userName?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      userName,
      chatMode: "ai",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    }

    await kv.set(`${SESSION_PREFIX}${session.id}`, session, { ex: SESSION_TTL })
    await kv.sadd(AI_SET, session.id)

    return session
  }

  async getSession(chatId: string): Promise<ChatSession | null> {
    return await kv.get<ChatSession>(`${SESSION_PREFIX}${chatId}`)
  }

  async getAllPendingSessions(): Promise<ChatSession[]> {
    const ids = await kv.smembers(PENDING_SET)
    if (!ids || ids.length === 0) return []

    const sessions = await Promise.all(
      ids.map((id) => kv.get<ChatSession>(`${SESSION_PREFIX}${id}`))
    )

    // Filter out null sessions and clean up stale references
    const validSessions: ChatSession[] = []
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i]
      if (session && session.status === "pending" && session.chatMode === "live") {
        validSessions.push(session)
      } else if (!session) {
        // Clean up stale reference
        await kv.srem(PENDING_SET, ids[i])
      }
    }

    return validSessions
  }

  async getAllAISessions(): Promise<ChatSession[]> {
    const ids = await kv.smembers(AI_SET)
    if (!ids || ids.length === 0) return []

    const sessions = await Promise.all(
      ids.map((id) => kv.get<ChatSession>(`${SESSION_PREFIX}${id}`))
    )

    const validSessions: ChatSession[] = []
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i]
      if (session && session.chatMode === "ai" && session.status === "active") {
        validSessions.push(session)
      } else if (!session) {
        await kv.srem(AI_SET, ids[i])
      }
    }

    return validSessions
  }

  async convertAIToLive(chatId: string, empId: string, empName: string): Promise<{
    success: boolean
    error?: string
    session?: ChatSession
    metadata?: {
      aiSessionDuration: number
      messageCount: number
      userMessageCount: number
      aiMessageCount: number
      sessionAge: string
    }
  }> {
    const startTime = Date.now()
    
    try {
      // Get the session with detailed validation
      const session = await this.getSession(chatId)
      
      if (!session) {
        console.error(`[ChatStore] convertAIToLive: Session not found for chatId: ${chatId}`)
        return {
          success: false,
          error: `Session not found: ${chatId}`,
        }
      }

      if (session.chatMode !== "ai") {
        console.warn(
          `[ChatStore] convertAIToLive: Session ${chatId} is not in AI mode. Current mode: ${session.chatMode}`
        )
        return {
          success: false,
          error: `Session is not in AI mode. Current mode: ${session.chatMode}`,
          session,
        }
      }

      if (session.status !== "active") {
        console.warn(
          `[ChatStore] convertAIToLive: Session ${chatId} is not active. Current status: ${session.status}`
        )
        return {
          success: false,
          error: `Session is not active. Current status: ${session.status}`,
          session,
        }
      }

      // Calculate session statistics before conversion
      const createdAt = new Date(session.createdAt)
      const now = new Date()
      const aiSessionDuration = now.getTime() - createdAt.getTime()
      const messageCount = session.messages.length
      const userMessageCount = session.messages.filter((m) => m.role === "user").length
      const aiMessageCount = session.messages.filter((m) => m.role === "assistant").length
      
      // Get the last AI message for context
      const lastAIMessage = session.messages
        .slice()
        .reverse()
        .find((m) => m.role === "assistant")?.content

      // Format session age for readability
      const hours = Math.floor(aiSessionDuration / (1000 * 60 * 60))
      const minutes = Math.floor((aiSessionDuration % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((aiSessionDuration % (1000 * 60)) / 1000)
      const sessionAge = hours > 0 
        ? `${hours}h ${minutes}m ${seconds}s`
        : minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`

      // Create takeover metadata
      const takeoverMetadata = {
        takenOverAt: now.toISOString(),
        takenOverBy: empId,
        takenOverByName: empName,
        aiSessionDuration,
        messageCountAtTakeover: messageCount,
        lastAIMessage,
      }

      // Perform the conversion
      session.chatMode = "live"
      session.status = "active"
      session.employeeId = empId
      session.employeeName = empName
      session.updatedAt = now.toISOString()
      session.takeoverMetadata = takeoverMetadata

      // Update KV store atomically
      await kv.set(`${SESSION_PREFIX}${chatId}`, session, { ex: SESSION_TTL })
      await kv.srem(AI_SET, chatId)
      await kv.sadd(ACTIVE_SET, chatId)
      await kv.sadd(`${EMPLOYEE_PREFIX}${empId}`, chatId)

      const processingTime = Date.now() - startTime
      console.log(
        `[ChatStore] convertAIToLive: Successfully converted session ${chatId} from AI to live mode. ` +
        `Employee: ${empName} (${empId}), ` +
        `Duration: ${sessionAge}, ` +
        `Messages: ${messageCount} (${userMessageCount} user, ${aiMessageCount} AI), ` +
        `Processing time: ${processingTime}ms`
      )

      return {
        success: true,
        session,
        metadata: {
          aiSessionDuration,
          messageCount,
          userMessageCount,
          aiMessageCount,
          sessionAge,
        },
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(
        `[ChatStore] convertAIToLive: Error converting session ${chatId} after ${processingTime}ms:`,
        error
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during conversion",
      }
    }
  }

  async getEmployeeActiveSessions(employeeId: string): Promise<ChatSession[]> {
    const ids = await kv.smembers(`${EMPLOYEE_PREFIX}${employeeId}`)
    if (!ids || ids.length === 0) return []

    const sessions = await Promise.all(
      ids.map((id) => kv.get<ChatSession>(`${SESSION_PREFIX}${id}`))
    )

    return sessions.filter(
      (s): s is ChatSession => s !== null && s.status === "active"
    )
  }

  async assignEmployee(chatId: string, empId: string, empName: string): Promise<boolean> {
    const session = await this.getSession(chatId)
    if (!session || session.status !== "pending") {
      return false
    }

    session.employeeId = empId
    session.employeeName = empName
    session.status = "active"
    session.updatedAt = new Date().toISOString()

    await kv.set(`${SESSION_PREFIX}${chatId}`, session, { ex: SESSION_TTL })
    await kv.srem(PENDING_SET, chatId)
    await kv.sadd(ACTIVE_SET, chatId)
    await kv.sadd(`${EMPLOYEE_PREFIX}${empId}`, chatId)

    return true
  }

  async addMessage(
    chatId: string,
    message: Omit<ChatMessage, "id" | "timestamp">
  ): Promise<ChatMessage | null> {
    const session = await this.getSession(chatId)
    if (!session) {
      return null
    }

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
    }

    session.messages.push(newMessage)
    session.updatedAt = new Date().toISOString()

    await kv.set(`${SESSION_PREFIX}${chatId}`, session, { ex: SESSION_TTL })

    return newMessage
  }

  async closeSession(chatId: string): Promise<boolean> {
    const session = await this.getSession(chatId)
    if (!session) {
      return false
    }

    session.status = "closed"
    session.updatedAt = new Date().toISOString()

    await kv.set(`${SESSION_PREFIX}${chatId}`, session, { ex: SESSION_TTL })
    await kv.srem(PENDING_SET, chatId)
    await kv.srem(AI_SET, chatId)
    await kv.srem(ACTIVE_SET, chatId)

    if (session.employeeId) {
      await kv.srem(`${EMPLOYEE_PREFIX}${session.employeeId}`, chatId)
    }

    return true
  }

  async getAllActiveSessions(): Promise<ChatSession[]> {
    const ids = await kv.smembers(ACTIVE_SET)
    if (!ids || ids.length === 0) return []

    const sessions = await Promise.all(
      ids.map((id) => kv.get<ChatSession>(`${SESSION_PREFIX}${id}`))
    )

    return sessions.filter((s): s is ChatSession => s !== null && s.status === "active")
  }
}

// Singleton instance
export const chatStore = new ChatStore()

