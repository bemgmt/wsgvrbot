"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, Users, MessageCircle, X, Bot } from "lucide-react"

interface ChatMessage {
  id: string
  chatId: string
  role: "user" | "employee" | "assistant"
  content: string
  timestamp: Date
  employeeId?: string
  employeeName?: string
}

interface ChatSession {
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

type ViewTab = "live" | "ai"

export default function EmployeeChatPage() {
  const [employeeId] = useState(() => {
    // In production, this should come from authentication
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("employeeId")
      if (stored) return stored
      const newId = `emp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      localStorage.setItem("employeeId", newId)
      return newId
    }
    return `emp_${Date.now()}`
  })
  const [employeeName, setEmployeeName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("employeeName") || ""
    }
    return ""
  })
  const [activeTab, setActiveTab] = useState<ViewTab>("live")
  const [pendingChats, setPendingChats] = useState<ChatSession[]>([])
  const [activeChats, setActiveChats] = useState<ChatSession[]>([])
  const [aiChats, setAIChats] = useState<ChatSession[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize employee name if not set
  useEffect(() => {
    if (!employeeName && typeof window !== "undefined") {
      const name = prompt("Please enter your name:")
      if (name) {
        setEmployeeName(name)
        localStorage.setItem("employeeName", name)
      }
    }
  }, [employeeName])

  // Fetch pending, active, and AI chats
  const fetchChats = async () => {
    try {
      const [pendingRes, activeRes, aiRes] = await Promise.all([
        fetch(`/api/live-chat/employee?type=pending`),
        fetch(`/api/live-chat/employee?type=active&employeeId=${employeeId}`),
        fetch(`/api/ai-chat/session?listAll=true`),
      ])

      if (pendingRes.ok) {
        const pending = await pendingRes.json()
        setPendingChats(pending.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })))
      }

      if (activeRes.ok) {
        const active = await activeRes.json()
        setActiveChats(active.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })))
      }

      if (aiRes.ok) {
        const ai = await aiRes.json()
        setAIChats(ai.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })))
      }
    } catch (error) {
      console.error("[Employee Chat] Fetch error:", error)
    }
  }

  // Poll for new messages in selected chat
  useEffect(() => {
    if (!selectedChatId) return

    const pollMessages = async () => {
      try {
        const response = await fetch(`/api/live-chat/session?chatId=${selectedChatId}`)
        if (response.ok) {
          const session: ChatSession = await response.json()
          setSelectedChat({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          })
        }
      } catch (error) {
        console.error("[Employee Chat] Poll error:", error)
      }
    }

    const interval = setInterval(pollMessages, 2000)
    return () => clearInterval(interval)
  }, [selectedChatId])

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 3000) // Refresh chat list every 3 seconds
    return () => clearInterval(interval)
  }, [employeeId])

  const handleAcceptChat = async (chatId: string) => {
    if (!employeeName) {
      alert("Please set your name first")
      return
    }

    try {
      const response = await fetch("/api/live-chat/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          employeeId,
          employeeName,
        }),
      })

      if (response.ok) {
        await fetchChats()
        setSelectedChatId(chatId)
      }
    } catch (error) {
      console.error("[Employee Chat] Accept error:", error)
    }
  }

  const handleTakeoverAIChat = async (chatId: string) => {
    if (!employeeName) {
      alert("Please set your name first")
      return
    }

    try {
      const response = await fetch("/api/ai-chat/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          employeeId,
          employeeName,
        }),
      })

      if (response.ok) {
        await fetchChats()
        setSelectedChatId(chatId)
        setActiveTab("live") // Switch to live tab after takeover
      }
    } catch (error) {
      console.error("[Employee Chat] Takeover error:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedChatId || isLoading) return

    const content = messageInput
    setMessageInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/live-chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChatId,
          role: "employee",
          content,
          employeeId,
          employeeName,
        }),
      })

      if (response.ok) {
        // Message will be updated via polling
        const sessionResponse = await fetch(`/api/live-chat/session?chatId=${selectedChatId}`)
        if (sessionResponse.ok) {
          const session: ChatSession = await sessionResponse.json()
          setSelectedChat({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          })
        }
      }
    } catch (error) {
      console.error("[Employee Chat] Send error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseChat = async () => {
    if (!selectedChatId) return

    try {
      const response = await fetch("/api/live-chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: selectedChatId }),
      })

      if (response.ok) {
        await fetchChats()
        setSelectedChatId(null)
        setSelectedChat(null)
      }
    } catch (error) {
      console.error("[Employee Chat] Close error:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat?.messages])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Employee Chat Dashboard</h1>
          <p className="text-muted-foreground">
            Logged in as: <span className="font-semibold">{employeeName || "Unknown"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className="lg:col-span-1 border border-border rounded-lg bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg mb-4">Chat Sessions</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveTab("live")}
                  variant={activeTab === "live" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  <Users size={14} className="mr-1" />
                  Live Chats
                </Button>
                <Button
                  onClick={() => setActiveTab("ai")}
                  variant={activeTab === "ai" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  <Bot size={14} className="mr-1" />
                  AI Chats {aiChats.length > 0 && `(${aiChats.length})`}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Live Chats Tab */}
              {activeTab === "live" && (
                <>
                  {/* Pending Chats */}
                  {pendingChats.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        Pending ({pendingChats.length})
                      </h3>
                      {pendingChats.map((chat) => (
                        <div
                          key={chat.id}
                          className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleAcceptChat(chat.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Chat #{chat.id.slice(-8)}</span>
                            <span className="text-xs text-muted-foreground bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded">
                              New
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {chat.messages.length > 0
                              ? chat.messages[0].content.substring(0, 50) + "..."
                              : "No messages yet"}
                          </p>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAcceptChat(chat.id)
                            }}
                          >
                            Accept Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Active Chats */}
                  {activeChats.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        Active ({activeChats.length})
                      </h3>
                      {activeChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedChatId === chat.id ? "bg-primary/10 border-primary" : ""
                          }`}
                          onClick={() => {
                            setSelectedChatId(chat.id)
                            setSelectedChat(chat)
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Chat #{chat.id.slice(-8)}</span>
                            <span className="text-xs text-muted-foreground bg-green-500/20 text-green-600 px-2 py-0.5 rounded">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {chat.messages.length > 0
                              ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + "..."
                              : "No messages yet"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(chat.updatedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingChats.length === 0 && activeChats.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No live chats</p>
                    </div>
                  )}
                </>
              )}

              {/* AI Chats Tab */}
              {activeTab === "ai" && (
                <>
                  {aiChats.length > 0 ? (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        AI Conversations ({aiChats.length})
                      </h3>
                      {aiChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors mb-2 ${
                            selectedChatId === chat.id ? "bg-primary/10 border-primary" : ""
                          }`}
                          onClick={() => {
                            setSelectedChatId(chat.id)
                            setSelectedChat(chat)
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Bot size={14} className="text-purple-500" />
                              Chat #{chat.id.slice(-8)}
                            </span>
                            <span className="text-xs text-muted-foreground bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded">
                              AI
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {chat.messages.length > 0
                              ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + "..."
                              : "No messages yet"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {chat.messages.length} messages • {new Date(chat.updatedAt).toLocaleTimeString()}
                          </p>
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTakeoverAIChat(chat.id)
                            }}
                          >
                            Take Over
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No active AI chats</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 border border-border rounded-lg bg-card flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-border bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        Chat #{selectedChat.id.slice(-8)}
                        {selectedChat.chatMode === "ai" && (
                          <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded flex items-center gap-1">
                            <Bot size={12} /> AI
                          </span>
                        )}
                        {selectedChat.chatMode === "live" && (
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={12} /> Live
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="font-medium">{selectedChat.status}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedChat.status === "active" && (
                        <Button variant="outline" size="sm" onClick={handleCloseChat}>
                          Close Chat
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedChatId(null)
                          setSelectedChat(null)
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : message.role === "assistant"
                              ? "bg-purple-500 text-white rounded-bl-none"
                              : "bg-blue-500 text-white rounded-bl-none"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <p className="text-xs font-semibold mb-1 opacity-90 flex items-center gap-1">
                            <Bot size={12} /> AI Assistant
                          </p>
                        )}
                        {message.role === "employee" && message.employeeName && (
                          <p className="text-xs font-semibold mb-1 opacity-90">{message.employeeName}</p>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || selectedChat.status !== "active"}
                    className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !messageInput.trim() || selectedChat.status !== "active"}
                  >
                    <Send size={20} />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <Users size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No chat selected</p>
                  <p className="text-sm">Select a chat from the list to start responding</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

