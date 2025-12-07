import { describe, it, expect, beforeEach, vi } from 'vitest'

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
import { POST as createSession } from '@/app/api/ai-chat/session/route'
import { POST as takeoverSession } from '@/app/api/ai-chat/takeover/route'
import { chatStore } from '@/lib/chat-store'

// Helper to create mock Request objects
function createMockRequest(method: string, body?: object, url?: string): Request {
  const reqUrl = url || 'http://localhost:3000/api/ai-chat/session'
  return new Request(reqUrl, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('AI Chat Session API Smoke Tests', () => {
  beforeEach(() => {
    // Clear mocks between tests
    mockKvStore.clear()
    mockKvSets.clear()
  })

  describe('POST /api/ai-chat/session', () => {
    it('should create a new AI session', async () => {
      const request = createMockRequest('POST', { userId: 'test-user-123' })

      const response = await createSession(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBeDefined()
      expect(data.userId).toBe('test-user-123')
      expect(data.chatMode).toBe('ai')
      expect(data.status).toBe('active')
    })

    it('should create session with optional userName', async () => {
      const request = createMockRequest('POST', {
        userId: 'test-user',
        userName: 'John Doe'
      })

      const response = await createSession(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.userName).toBe('John Doe')
    })

    it('should return 400 for missing userId', async () => {
      const request = createMockRequest('POST', {})

      const response = await createSession(request)

      expect(response.status).toBe(400)
    })

    it('should include CORS headers', async () => {
      const request = createMockRequest('POST', { userId: 'test' })

      const response = await createSession(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  // Note: GET endpoint tests are skipped because Next.js NextRequest.nextUrl
  // requires the full Next.js runtime. These are better tested with integration tests.
  describe('GET /api/ai-chat/session (via chatStore)', () => {
    it('should retrieve session by ID using chatStore directly', async () => {
      const session = await chatStore.createAISession('user-123', 'Test User')

      const retrieved = await chatStore.getSession(session.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(session.id)
      expect(retrieved?.userName).toBe('Test User')
    })

    it('should list all AI sessions using chatStore directly', async () => {
      await chatStore.createAISession('user-1')
      await chatStore.createAISession('user-2')

      const sessions = await chatStore.getAllAISessions()

      expect(Array.isArray(sessions)).toBe(true)
      expect(sessions.length).toBeGreaterThanOrEqual(2)
    })

    it('should return null for non-existent session', async () => {
      const session = await chatStore.getSession('fake-id')

      expect(session).toBeNull()
    })
  })
})

describe('AI Chat Takeover API Smoke Tests', () => {
  beforeEach(() => {
    // Clear mocks between tests
    mockKvStore.clear()
    mockKvSets.clear()
  })

  it('should convert AI session to live mode', async () => {
    const session = await chatStore.createAISession('user-123')

    const request = createMockRequest('POST', {
      chatId: session.id,
      employeeId: 'emp-1',
      employeeName: 'Jane Employee',
    })

    const response = await takeoverSession(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.chatMode).toBe('live')
    expect(data.employeeName).toBe('Jane Employee')
    expect(data.status).toBe('active')
  })

  it('should return 400 for missing parameters', async () => {
    const request = createMockRequest('POST', { chatId: 'some-id' })

    const response = await takeoverSession(request)

    expect(response.status).toBe(400)
  })

  it('should return 400 for non-existent or already-live session', async () => {
    // The API returns 400 when convertAIToLive fails (session not found or not AI mode)
    const request = createMockRequest('POST', {
      chatId: 'fake-session',
      employeeId: 'emp-1',
      employeeName: 'Employee',
    })

    const response = await takeoverSession(request)

    expect(response.status).toBe(400)
  })
})

