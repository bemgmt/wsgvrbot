import { describe, it, expect, beforeEach } from 'vitest'
import { ChatStore } from '@/lib/chat-store'

describe('ChatStore Smoke Tests', () => {
  let store: ChatStore

  beforeEach(() => {
    store = new ChatStore()
  })

  describe('AI Session Creation', () => {
    it('should create an AI session with correct defaults', () => {
      const session = store.createAISession('user123', 'Test User')

      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.userId).toBe('user123')
      expect(session.userName).toBe('Test User')
      expect(session.chatMode).toBe('ai')
      expect(session.status).toBe('active')
      expect(session.messages).toEqual([])
      expect(session.employeeId).toBeUndefined()
      expect(session.employeeName).toBeUndefined()
    })

    it('should create AI session without userName', () => {
      const session = store.createAISession('user456')

      expect(session.userId).toBe('user456')
      expect(session.userName).toBeUndefined()
      expect(session.chatMode).toBe('ai')
    })

    it('should generate unique session IDs', () => {
      const session1 = store.createAISession('user1')
      const session2 = store.createAISession('user2')

      expect(session1.id).not.toBe(session2.id)
    })
  })

  describe('AI Session Retrieval', () => {
    it('should retrieve all AI sessions', () => {
      store.createAISession('user1')
      store.createAISession('user2')
      store.createSession('user3') // live session

      const aiSessions = store.getAllAISessions()

      expect(aiSessions).toHaveLength(2)
      expect(aiSessions.every(s => s.chatMode === 'ai')).toBe(true)
    })

    it('should return empty array when no AI sessions exist', () => {
      store.createSession('user1') // live session only

      const aiSessions = store.getAllAISessions()

      expect(aiSessions).toEqual([])
    })

    it('should retrieve specific AI session by ID', () => {
      const created = store.createAISession('user1', 'User One')
      
      const retrieved = store.getSession(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.userName).toBe('User One')
    })
  })

  describe('AI to Live Conversion', () => {
    it('should convert AI session to live mode', () => {
      const session = store.createAISession('user1')

      const result = store.convertAIToLive(session.id, 'emp1', 'John Employee')

      expect(result).toBe(true)
      
      const updated = store.getSession(session.id)
      expect(updated?.chatMode).toBe('live')
      expect(updated?.status).toBe('active')
      expect(updated?.employeeId).toBe('emp1')
      expect(updated?.employeeName).toBe('John Employee')
    })

    it('should fail to convert non-existent session', () => {
      const result = store.convertAIToLive('fake-id', 'emp1', 'Employee')

      expect(result).toBe(false)
    })

    it('should fail to convert already live session', () => {
      const session = store.createSession('user1')
      
      const result = store.convertAIToLive(session.id, 'emp1', 'Employee')

      expect(result).toBe(false)
    })

    it('should preserve messages after conversion', () => {
      const session = store.createAISession('user1')
      store.addMessage(session.id, {
        role: 'user',
        content: 'Hello AI',
      })
      store.addMessage(session.id, {
        role: 'assistant',
        content: 'Hello! How can I help?',
      })

      store.convertAIToLive(session.id, 'emp1', 'John')

      const updated = store.getSession(session.id)
      expect(updated?.messages).toHaveLength(2)
      expect(updated?.messages[0].content).toBe('Hello AI')
      expect(updated?.messages[1].content).toBe('Hello! How can I help?')
    })
  })

  describe('Message Persistence', () => {
    it('should add messages to AI session', () => {
      const session = store.createAISession('user1')

      const message = store.addMessage(session.id, {
        role: 'user',
        content: 'Test message',
      })

      expect(message).toBeDefined()
      expect(message?.content).toBe('Test message')
      expect(message?.role).toBe('user')

      const updated = store.getSession(session.id)
      expect(updated?.messages).toHaveLength(1)
    })

    it('should add assistant messages to AI session', () => {
      const session = store.createAISession('user1')

      store.addMessage(session.id, {
        role: 'assistant',
        content: 'AI response',
      })

      const updated = store.getSession(session.id)
      expect(updated?.messages[0].role).toBe('assistant')
    })
  })

  describe('Pending Sessions Filter', () => {
    it('should only return pending live sessions', () => {
      store.createAISession('user1') // AI session - should not appear
      store.createSession('user2')   // Live pending session

      const pending = store.getAllPendingSessions()

      expect(pending).toHaveLength(1)
      expect(pending[0].chatMode).toBe('live')
      expect(pending[0].status).toBe('pending')
    })
  })
})

