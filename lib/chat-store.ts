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

  async convertAIToLive(chatId: string, empId: string, empName: string): Promise<boolean> {
    const session = await this.getSession(chatId)
    if (!session || session.chatMode !== "ai" || session.status !== "active") {
      return false
    }

    session.chatMode = "live"
    session.status = "active"
    session.employeeId = empId
    session.employeeName = empName
    session.updatedAt = new Date().toISOString()

    await kv.set(`${SESSION_PREFIX}${chatId}`, session, { ex: SESSION_TTL })
    await kv.srem(AI_SET, chatId)
    await kv.sadd(ACTIVE_SET, chatId)
    await kv.sadd(`${EMPLOYEE_PREFIX}${empId}`, chatId)

    return true
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

