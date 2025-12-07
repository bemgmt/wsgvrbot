"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send, Users, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "employee"
  content: string
  timestamp: Date
  employeeName?: string
}

type ChatMode = "ai" | "live"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>("ai")
  const [aiSessionId, setAISessionId] = useState<string | null>(null)
  const [liveChatId, setLiveChatId] = useState<string | null>(null)
  const [liveChatStatus, setLiveChatStatus] = useState<"pending" | "active" | null>(null)
  const [employeeName, setEmployeeName] = useState<string | null>(null)
  const [takenOver, setTakenOver] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm the West San Gabriel Valley REALTORS® Association assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const aiPollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const userIdRef = useRef<string>(`user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Create AI session when chat opens (if not already created)
  useEffect(() => {
    if (isOpen && chatMode === "ai" && !aiSessionId && !takenOver) {
      const createAISession = async () => {
        try {
          const response = await fetch("/api/ai-chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userIdRef.current }),
          })

          if (response.ok) {
            const session = await response.json()
            setAISessionId(session.id)
          }
        } catch (error) {
          console.error("[AI Chat] Create session error:", error)
        }
      }
      createAISession()
    }
  }, [isOpen, chatMode, aiSessionId, takenOver])

  // Poll to detect takeover (when AI session is converted to live by an employee)
  useEffect(() => {
    if (chatMode === "ai" && aiSessionId && !takenOver) {
      const pollForTakeover = async () => {
        try {
          const response = await fetch(`/api/ai-chat/session?chatId=${aiSessionId}`)
          if (response.ok) {
            const session = await response.json()
            // Check if session has been converted to live mode
            if (session.chatMode === "live" && session.employeeName) {
              // Takeover detected!
              setTakenOver(true)
              setChatMode("live")
              setLiveChatId(aiSessionId)
              setLiveChatStatus("active")
              setEmployeeName(session.employeeName)

              // Add notification message
              const takeoverMessage: Message = {
                id: `takeover_${Date.now()}`,
                role: "assistant",
                content: `🎉 ${session.employeeName} has joined the chat! You're now chatting with a human agent.`,
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, takeoverMessage])

              // Clear AI polling interval
              if (aiPollIntervalRef.current) {
                clearInterval(aiPollIntervalRef.current)
                aiPollIntervalRef.current = null
              }
            }
          }
        } catch (error) {
          console.error("[AI Chat] Poll for takeover error:", error)
        }
      }

      aiPollIntervalRef.current = setInterval(pollForTakeover, 3000) // Check every 3 seconds
      return () => {
        if (aiPollIntervalRef.current) {
          clearInterval(aiPollIntervalRef.current)
        }
      }
    }
  }, [chatMode, aiSessionId, takenOver])

  // Poll for new messages in live chat mode
  useEffect(() => {
    if (chatMode === "live" && liveChatId && liveChatStatus === "active") {
      const pollMessages = async () => {
        try {
          const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null
          const url = `/api/live-chat/poll?chatId=${liveChatId}${lastMessageId ? `&lastMessageId=${lastMessageId}` : ""}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            if (data.hasNewMessages && data.messages.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id))
                const newMessages = data.messages
                  .filter((m: Message) => !existingIds.has(m.id))
                  .map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                  }))
                return [...prev, ...newMessages]
              })
            }
            if (data.sessionStatus !== liveChatStatus) {
              setLiveChatStatus(data.sessionStatus)
            }
          }
        } catch (error) {
          console.error("[Live Chat] Poll error:", error)
        }
      }

      pollIntervalRef.current = setInterval(pollMessages, 2000) // Poll every 2 seconds
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [chatMode, liveChatId, liveChatStatus, messages.length])

  const handleRequestLiveChat = async () => {
    setIsLoading(true)
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      const response = await fetch("/api/live-chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error("Failed to create chat session")

      const session = await response.json()
      setLiveChatId(session.id)
      setLiveChatStatus(session.status)
      setChatMode("live")

      const welcomeMessage: Message = {
        id: "live_welcome",
        role: "assistant",
        content: "I've connected you with our office. An employee will be with you shortly. Please wait...",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("[Live Chat] Request error:", error)
      const errorMessage: Message = {
        id: "live_error",
        role: "assistant",
        content: "Sorry, I couldn't connect you to an employee. Please try again or contact the association directly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = input
    setInput("")
    setIsLoading(true)

    try {
      if (chatMode === "live" && liveChatId) {
        // Send message to live chat
        const response = await fetch("/api/live-chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: liveChatId,
            role: "user",
            content: messageContent,
          }),
        })

        if (!response.ok) throw new Error("Failed to send message")

        // Message is already in state, just update status if needed
        const sessionResponse = await fetch(`/api/live-chat/session?chatId=${liveChatId}`)
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          setLiveChatStatus(session.status)
          if (session.employeeName && !employeeName) {
            setEmployeeName(session.employeeName)
            const employeeJoinedMessage: Message = {
              id: "employee_joined",
              role: "assistant",
              content: `${session.employeeName} has joined the chat. You can now chat directly!`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, employeeJoinedMessage])
          }
        }
      } else {
        // Send message to AI chat
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role === "employee" ? "assistant" : m.role,
              content: m.content,
            })),
            sessionId: aiSessionId, // Include session ID for message persistence
            userMessage: messageContent, // Include the user message for saving
          }),
        })

        if (!response.ok) throw new Error("Failed to get response")

        const data = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("[Chat] Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again or contact the association directly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChat = () => {
    setChatMode("ai")
    setAISessionId(null)
    setLiveChatId(null)
    setLiveChatStatus(null)
    setEmployeeName(null)
    setTakenOver(false)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hello! I'm the West San Gabriel Valley REALTORS® Association assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
    if (aiPollIntervalRef.current) {
      clearInterval(aiPollIntervalRef.current)
    }
    // Generate new user ID for the new session
    userIdRef.current = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  return (
    <>
      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen ? (
          <div className="w-96 h-[600px] bg-background border border-border rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {chatMode === "live" ? "Live Chat" : "REALTORS® Assistant"}
                </h3>
                <p className="text-sm opacity-90">
                  {chatMode === "live" && employeeName
                    ? `Chatting with ${employeeName}`
                    : chatMode === "live" && liveChatStatus === "pending"
                      ? "Waiting for employee..."
                      : "West San Gabriel Valley"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher */}
            {messages.length === 1 && chatMode === "ai" && (
              <div className="border-b border-border p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Choose how you'd like to chat:</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setChatMode("ai")}
                    variant={chatMode === "ai" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Bot size={14} className="mr-1" />
                    AI Assistant
                  </Button>
                  <Button
                    onClick={handleRequestLiveChat}
                    variant={chatMode === "live" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={isLoading}
                  >
                    <Users size={14} className="mr-1" />
                    Live Chat
                  </Button>
                </div>
              </div>
            )}

            {chatMode === "live" && (
              <div className="border-b border-border p-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {liveChatStatus === "pending" ? "⏳ Waiting for employee..." : "✅ Connected"}
                  </span>
                  <Button onClick={resetChat} variant="ghost" size="sm" className="text-xs h-6">
                    Switch to AI
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : message.role === "employee"
                          ? "bg-blue-500 text-white rounded-bl-none"
                          : "bg-muted text-muted-foreground rounded-bl-none"
                    }`}
                  >
                    {message.role === "employee" && message.employeeName && (
                      <p className="text-xs font-semibold mb-1 opacity-90">{message.employeeName}</p>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  chatMode === "live" && liveChatStatus === "pending"
                    ? "Waiting for employee to join..."
                    : chatMode === "live"
                      ? "Type your message..."
                      : "Ask me anything..."
                }
                disabled={isLoading || (chatMode === "live" && liveChatStatus === "pending")}
                className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle size={24} />
          </Button>
        )}
      </div>
    </>
  )
}
