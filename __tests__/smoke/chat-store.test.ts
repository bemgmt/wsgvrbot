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

describe('ChatStore Smoke Tests', () => {
  let store: ChatStore

  beforeEach(() => {
    // Clear mocks between tests
    mockKvStore.clear()
    mockKvSets.clear()
    store = new ChatStore()
  })

  describe('AI Session Creation', () => {
    it('should create an AI session with correct defaults', async () => {
      const session = await store.createAISession('user123', 'Test User')

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

    it('should create AI session without userName', async () => {
      const session = await store.createAISession('user456')

      expect(session.userId).toBe('user456')
      expect(session.userName).toBeUndefined()
      expect(session.chatMode).toBe('ai')
    })

    it('should generate unique session IDs', async () => {
      const session1 = await store.createAISession('user1')
      const session2 = await store.createAISession('user2')

      expect(session1.id).not.toBe(session2.id)
    })
  })

  describe('AI Session Retrieval', () => {
    it('should retrieve all AI sessions', async () => {
      await store.createAISession('user1')
      await store.createAISession('user2')
      await store.createSession('user3') // live session

      const aiSessions = await store.getAllAISessions()

      expect(aiSessions).toHaveLength(2)
      expect(aiSessions.every(s => s.chatMode === 'ai')).toBe(true)
    })

    it('should return empty array when no AI sessions exist', async () => {
      await store.createSession('user1') // live session only

      const aiSessions = await store.getAllAISessions()

      expect(aiSessions).toEqual([])
    })

    it('should retrieve specific AI session by ID', async () => {
      const created = await store.createAISession('user1', 'User One')

      const retrieved = await store.getSession(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.userName).toBe('User One')
    })
  })

  describe('AI to Live Conversion', () => {
    it('should convert AI session to live mode', async () => {
      const session = await store.createAISession('user1')

      const result = await store.convertAIToLive(session.id, 'emp1', 'John Employee')

      expect(result).toBe(true)

      const updated = await store.getSession(session.id)
      expect(updated?.chatMode).toBe('live')
      expect(updated?.status).toBe('active')
      expect(updated?.employeeId).toBe('emp1')
      expect(updated?.employeeName).toBe('John Employee')
    })

    it('should fail to convert non-existent session', async () => {
      const result = await store.convertAIToLive('fake-id', 'emp1', 'Employee')

      expect(result).toBe(false)
    })

    it('should fail to convert already live session', async () => {
      const session = await store.createSession('user1')

      const result = await store.convertAIToLive(session.id, 'emp1', 'Employee')

      expect(result).toBe(false)
    })

    it('should preserve messages after conversion', async () => {
      const session = await store.createAISession('user1')
      await store.addMessage(session.id, {
        chatId: session.id,
        role: 'user',
        content: 'Hello AI',
      })
      await store.addMessage(session.id, {
        chatId: session.id,
        role: 'assistant',
        content: 'Hello! How can I help?',
      })

      await store.convertAIToLive(session.id, 'emp1', 'John')

      const updated = await store.getSession(session.id)
      expect(updated?.messages).toHaveLength(2)
      expect(updated?.messages[0].content).toBe('Hello AI')
      expect(updated?.messages[1].content).toBe('Hello! How can I help?')
    })
  })

  describe('Message Persistence', () => {
    it('should add messages to AI session', async () => {
      const session = await store.createAISession('user1')

      const message = await store.addMessage(session.id, {
        chatId: session.id,
        role: 'user',
        content: 'Test message',
      })

      expect(message).toBeDefined()
      expect(message?.content).toBe('Test message')
      expect(message?.role).toBe('user')

      const updated = await store.getSession(session.id)
      expect(updated?.messages).toHaveLength(1)
    })

    it('should add assistant messages to AI session', async () => {
      const session = await store.createAISession('user1')

      await store.addMessage(session.id, {
        chatId: session.id,
        role: 'assistant',
        content: 'AI response',
      })

      const updated = await store.getSession(session.id)
      expect(updated?.messages[0].role).toBe('assistant')
    })
  })

  describe('Pending Sessions Filter', () => {
    it('should only return pending live sessions', async () => {
      await store.createAISession('user1') // AI session - should not appear
      await store.createSession('user2')   // Live pending session

      const pending = await store.getAllPendingSessions()

      expect(pending).toHaveLength(1)
      expect(pending[0].chatMode).toBe('live')
      expect(pending[0].status).toBe('pending')
    })
  })
})

