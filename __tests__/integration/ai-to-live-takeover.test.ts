import { describe, it, expect, beforeEach } from 'vitest'
import { ChatStore, ChatSession, ChatMessage } from '@/lib/chat-store'

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
    store = new ChatStore()
  })

  describe('Complete Takeover Flow', () => {
    it('should handle full user journey from AI to live chat', () => {
      // STEP 1: User opens chatbot and creates AI session
      const userId = 'user_12345'
      const userName = 'Customer Jane'
      const aiSession = store.createAISession(userId, userName)

      expect(aiSession.chatMode).toBe('ai')
      expect(aiSession.status).toBe('active')

      // STEP 2: User sends messages and AI responds
      const userMessage1 = store.addMessage(aiSession.id, {
        role: 'user',
        content: 'Hi, I have a question about membership',
      })
      expect(userMessage1).toBeDefined()

      const aiResponse1 = store.addMessage(aiSession.id, {
        role: 'assistant',
        content: 'Hello! I\'d be happy to help with membership questions. What would you like to know?',
      })
      expect(aiResponse1).toBeDefined()

      const userMessage2 = store.addMessage(aiSession.id, {
        role: 'user',
        content: 'What are the annual dues?',
      })

      const aiResponse2 = store.addMessage(aiSession.id, {
        role: 'assistant',
        content: 'The annual membership dues vary by category. Let me connect you with an employee for specific pricing.',
      })

      // Verify conversation state
      let session = store.getSession(aiSession.id)
      expect(session?.messages).toHaveLength(4)

      // STEP 3: Employee views AI chats on dashboard
      const aiChats = store.getAllAISessions()
      expect(aiChats.length).toBeGreaterThan(0)
      
      const targetChat = aiChats.find(c => c.id === aiSession.id)
      expect(targetChat).toBeDefined()
      expect(targetChat?.messages).toHaveLength(4)
      expect(targetChat?.userName).toBe('Customer Jane')

      // STEP 4: Employee takes over the conversation
      const employeeId = 'emp_john_smith'
      const employeeName = 'John Smith'
      
      const takeoverResult = store.convertAIToLive(
        aiSession.id,
        employeeId,
        employeeName
      )
      expect(takeoverResult).toBe(true)

      // Verify session is now live
      session = store.getSession(aiSession.id)
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
      const employeeMessage = store.addMessage(aiSession.id, {
        role: 'employee',
        content: 'Hi Jane! I\'m John, and I\'ll be helping you today. The annual dues are $400 for REALTOR members.',
        employeeName: 'John Smith',
        employeeId: 'emp_john_smith',
      })
      expect(employeeMessage).toBeDefined()
      expect(employeeMessage?.role).toBe('employee')

      // STEP 7: User responds in live mode
      const userMessage3 = store.addMessage(aiSession.id, {
        role: 'user',
        content: 'Thank you John! That\'s exactly what I needed to know.',
      })
      expect(userMessage3).toBeDefined()

      // Final verification
      session = store.getSession(aiSession.id)
      expect(session?.messages).toHaveLength(6)
      expect(session?.chatMode).toBe('live')

      // Verify AI sessions list no longer includes this chat
      const remainingAIChats = store.getAllAISessions()
      const foundInAI = remainingAIChats.find(c => c.id === aiSession.id)
      expect(foundInAI).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should prevent double takeover attempts', () => {
      const session = store.createAISession('user1')
      
      // First takeover succeeds
      const result1 = store.convertAIToLive(session.id, 'emp1', 'Employee 1')
      expect(result1).toBe(true)

      // Second takeover fails (already live)
      const result2 = store.convertAIToLive(session.id, 'emp2', 'Employee 2')
      expect(result2).toBe(false)

      // Original employee still assigned
      const updated = store.getSession(session.id)
      expect(updated?.employeeName).toBe('Employee 1')
    })

    it('should handle session with no messages', () => {
      const session = store.createAISession('user1')
      
      const result = store.convertAIToLive(session.id, 'emp1', 'Employee')
      
      expect(result).toBe(true)
      const updated = store.getSession(session.id)
      expect(updated?.messages).toHaveLength(0)
      expect(updated?.chatMode).toBe('live')
    })

    it('should update employee assignment after takeover', () => {
      const session = store.createAISession('user1')
      store.convertAIToLive(session.id, 'emp1', 'Employee')

      const updated = store.getSession(session.id)

      expect(updated?.employeeId).toBe('emp1')
      expect(updated?.employeeName).toBe('Employee')
    })
  })
})

