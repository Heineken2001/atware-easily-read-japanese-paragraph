// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn(function() {
    return { send: vi.fn().mockResolvedValue({ SecretString: 'test-api-key' }) }
  }),
  GetSecretValueCommand: vi.fn(),
}))

const mockCreate = vi.fn().mockResolvedValue({
  choices: [{
    message: {
      content: JSON.stringify({
        tokens: [{ text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null }],
        vocabulary: [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] }],
        grammar: [],
      }),
    },
  }],
})

vi.mock('openai', () => ({
  default: vi.fn(function() {
    return { chat: { completions: { create: mockCreate } } }
  }),
}))

const { default: handler } = await import('./chat.js')

describe('POST /api/chat', () => {
  let res

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    mockCreate.mockClear()
  })

  it('returns 200 with structured JSON for valid text', async () => {
    await handler({ method: 'POST', body: { text: '日本語を勉強しています。' } }, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ tokens: expect.any(Array) }))
  })

  it('returns 405 for non-POST requests', async () => {
    await handler({ method: 'GET', body: {} }, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 400 when text is missing', async () => {
    await handler({ method: 'POST', body: {} }, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 413 when OpenAI reports context_length_exceeded', async () => {
    const err = new Error('context_length_exceeded')
    err.code = 'context_length_exceeded'
    mockCreate.mockRejectedValueOnce(err)
    await handler({ method: 'POST', body: { text: 'long text' } }, res)
    expect(res.status).toHaveBeenCalledWith(413)
    expect(res.json).toHaveBeenCalledWith({ error: 'TEXT_TOO_LONG' })
  })

  it('returns 500 for unexpected errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('network failure'))
    await handler({ method: 'POST', body: { text: '日本語' } }, res)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
