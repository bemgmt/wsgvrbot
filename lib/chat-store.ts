// In-memory store for live chat sessions
// In production, this should be replaced with a database (Redis, PostgreSQL, etc.)

export interface ChatMessage {
  id: string
  chatId: string
  role: "user" | "employee" | "assistant"
  content: string
  timestamp: Date
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
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

export class ChatStore {
  sessions: Map<string, ChatSession> = new Map()
  private employeeSessions: Map<string, Set<string>> = new Map() // employeeId -> Set of chatIds

  createSession(userId: string, userName?: string): ChatSession {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      userName,
      chatMode: "live",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    }
    this.sessions.set(session.id, session)
    return session
  }

  createAISession(userId: string, userName?: string): ChatSession {
    const session: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      userName,
      chatMode: "ai",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    }
    this.sessions.set(session.id, session)
    return session
  }

  getSession(chatId: string): ChatSession | undefined {
    return this.sessions.get(chatId)
  }

  getAllPendingSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === "pending" && s.chatMode === "live"
    )
  }

  getAllAISessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.chatMode === "ai" && s.status === "active"
    )
  }

  convertAIToLive(chatId: string, employeeId: string, employeeName: string): boolean {
    const session = this.sessions.get(chatId)
    if (!session || session.chatMode !== "ai" || session.status !== "active") {
      return false
    }

    session.chatMode = "live"
    session.status = "active"
    session.employeeId = employeeId
    session.employeeName = employeeName
    session.updatedAt = new Date()

    if (!this.employeeSessions.has(employeeId)) {
      this.employeeSessions.set(employeeId, new Set())
    }
    this.employeeSessions.get(employeeId)!.add(chatId)

    return true
  }

  getEmployeeActiveSessions(employeeId: string): ChatSession[] {
    const chatIds = this.employeeSessions.get(employeeId) || new Set()
    return Array.from(chatIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is ChatSession => s !== undefined && s.status === "active")
  }

  assignEmployee(chatId: string, employeeId: string, employeeName: string): boolean {
    const session = this.sessions.get(chatId)
    if (!session || session.status !== "pending") {
      return false
    }

    session.employeeId = employeeId
    session.employeeName = employeeName
    session.status = "active"
    session.updatedAt = new Date()

    if (!this.employeeSessions.has(employeeId)) {
      this.employeeSessions.set(employeeId, new Set())
    }
    this.employeeSessions.get(employeeId)!.add(chatId)

    return true
  }

  addMessage(chatId: string, message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage | null {
    const session = this.sessions.get(chatId)
    if (!session) {
      return null
    }

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(),
    }

    session.messages.push(newMessage)
    session.updatedAt = new Date()
    return newMessage
  }

  closeSession(chatId: string): boolean {
    const session = this.sessions.get(chatId)
    if (!session) {
      return false
    }

    session.status = "closed"
    session.updatedAt = new Date()

    if (session.employeeId) {
      const employeeChats = this.employeeSessions.get(session.employeeId)
      if (employeeChats) {
        employeeChats.delete(chatId)
      }
    }

    return true
  }

  // Get all active sessions (for admin view)
  getAllActiveSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === "active")
  }
}

// Singleton instance
export const chatStore = new ChatStore()

