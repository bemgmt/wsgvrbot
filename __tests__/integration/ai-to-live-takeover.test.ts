import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatSession, ChatMessage } from '@/lib/chat-store'

// Mock the @vercel/kv module
const mockKvStore = new Map<string, any>()
const mockKvSets = new Map<string, Set<string>>()

vi.mock('@vercel/kv', () => ({
  kv: {
    set: vi.fn(async (key: string, value: any) => {
      mockKvStore.set(key, value)
      return 'OK'
    }),
    get: vi.fn(async (key: string) => {
      return mockKvStore.get(key) || null
    }),
    sadd: vi.fn(async (key: string, value: string) => {
      if (!mockKvSets.has(key)) mockKvSets.set(key, new Set())
      mockKvSets.get(key)!.add(value)
      return 1
    }),
    srem: vi.fn(async (key: string, value: string) => {
      mockKvSets.get(key)?.delete(value)
      return 1
    }),
    smembers: vi.fn(async (key: string) => {
      return Array.from(mockKvSets.get(key) || [])
    }),
  }
}))

// Import after mocking
import { ChatStore } from '@/lib/chat-store'

/**
 * User Flow Test: AI to Live Chat Takeover
 *
 * This test simulates the complete user journey:
 * 1. User opens chatbot and starts AI conversation
 * 2. User exchanges multiple messages with AI
 * 3. Employee views AI chats on dashboard
 * 4. Employee takes over the conversation
 * 5. Conversation continues as live chat
 * 6. Message history is preserved throughout
 */
describe('AI to Live Chat Takeover - User Flow', () => {
  let store: ChatStore

  beforeEach(() => {
    // Clear mocks between tests
    mockKvStore.clear()
    mockKvSets.clear()
    store = new ChatStore()
  })

  describe('Complete Takeover Flow', () => {
    it('should handle full user journey from AI to live chat', async () => {
      // STEP 1: User opens chatbot and creates AI session
      const userId = 'user_12345'
      const userName = 'Customer Jane'
      const aiSession = await store.createAISession(userId, userName)

      expect(aiSession.chatMode).toBe('ai')
      expect(aiSession.status).toBe('active')

      // STEP 2: User sends messages and AI responds
      const userMessage1 = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'user',
        content: 'Hi, I have a question about membership',
      })
      expect(userMessage1).toBeDefined()

      const aiResponse1 = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'assistant',
        content: 'Hello! I\'d be happy to help with membership questions. What would you like to know?',
      })
      expect(aiResponse1).toBeDefined()

      const userMessage2 = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'user',
        content: 'What are the annual dues?',
      })

      const aiResponse2 = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'assistant',
        content: 'The annual membership dues vary by category. Let me connect you with an employee for specific pricing.',
      })

      // Verify conversation state
      let session = await store.getSession(aiSession.id)
      expect(session?.messages).toHaveLength(4)

      // STEP 3: Employee views AI chats on dashboard
      const aiChats = await store.getAllAISessions()
      expect(aiChats.length).toBeGreaterThan(0)

      const targetChat = aiChats.find(c => c.id === aiSession.id)
      expect(targetChat).toBeDefined()
      expect(targetChat?.messages).toHaveLength(4)
      expect(targetChat?.userName).toBe('Customer Jane')

      // STEP 4: Employee takes over the conversation
      const employeeId = 'emp_john_smith'
      const employeeName = 'John Smith'

      const takeoverResult = await store.convertAIToLive(
        aiSession.id,
        employeeId,
        employeeName
      )
      expect(takeoverResult).toBe(true)

      // Verify session is now live
      session = await store.getSession(aiSession.id)
      expect(session?.chatMode).toBe('live')
      expect(session?.status).toBe('active')
      expect(session?.employeeId).toBe(employeeId)
      expect(session?.employeeName).toBe(employeeName)

      // STEP 5: Verify message history is preserved
      expect(session?.messages).toHaveLength(4)
      expect(session?.messages[0].role).toBe('user')
      expect(session?.messages[1].role).toBe('assistant')
      expect(session?.messages[2].role).toBe('user')
      expect(session?.messages[3].role).toBe('assistant')

      // STEP 6: Employee sends message in live mode
      const employeeMessage = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'employee',
        content: 'Hi Jane! I\'m John, and I\'ll be helping you today. The annual dues are $400 for REALTOR members.',
        employeeName: 'John Smith',
        employeeId: 'emp_john_smith',
      })
      expect(employeeMessage).toBeDefined()
      expect(employeeMessage?.role).toBe('employee')

      // STEP 7: User responds in live mode
      const userMessage3 = await store.addMessage(aiSession.id, {
        chatId: aiSession.id,
        role: 'user',
        content: 'Thank you John! That\'s exactly what I needed to know.',
      })
      expect(userMessage3).toBeDefined()

      // Final verification
      session = await store.getSession(aiSession.id)
      expect(session?.messages).toHaveLength(6)
      expect(session?.chatMode).toBe('live')

      // Verify AI sessions list no longer includes this chat
      const remainingAIChats = await store.getAllAISessions()
      const foundInAI = remainingAIChats.find(c => c.id === aiSession.id)
      expect(foundInAI).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should prevent double takeover attempts', async () => {
      const session = await store.createAISession('user1')

      // First takeover succeeds
      const result1 = await store.convertAIToLive(session.id, 'emp1', 'Employee 1')
      expect(result1).toBe(true)

      // Second takeover fails (already live)
      const result2 = await store.convertAIToLive(session.id, 'emp2', 'Employee 2')
      expect(result2).toBe(false)

      // Original employee still assigned
      const updated = await store.getSession(session.id)
      expect(updated?.employeeName).toBe('Employee 1')
    })

    it('should handle session with no messages', async () => {
      const session = await store.createAISession('user1')

      const result = await store.convertAIToLive(session.id, 'emp1', 'Employee')

      expect(result).toBe(true)
      const updated = await store.getSession(session.id)
      expect(updated?.messages).toHaveLength(0)
      expect(updated?.chatMode).toBe('live')
    })

    it('should update employee assignment after takeover', async () => {
      const session = await store.createAISession('user1')
      await store.convertAIToLive(session.id, 'emp1', 'Employee')

      const updated = await store.getSession(session.id)

      expect(updated?.employeeId).toBe('emp1')
      expect(updated?.employeeName).toBe('Employee')
    })
  })
})

