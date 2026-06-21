# Task 3 Review Package

## Commits
bef9d55 feat: add Vercel serverless function with AWS Secrets Manager and OpenAI proxy

## Stat
2 files changed, 136 insertions(+)

## Implementation Note
The plan's test code used arrow functions for constructor mocks (`vi.fn(() => ({...}))`).
Vitest 4.1.9 requires regular functions for constructor mocks (used with `new`).
The implementer changed these to `vi.fn(function() { return {...} })` — semantically identical.

## Diff

```diff
diff --git a/api/chat.js b/api/chat.js
new file mode 100644
+++ b/api/chat.js
@@ -0,0 +1,64 @@
+import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
+import OpenAI from 'openai'
+
+let cachedApiKey = null
+
+async function getApiKey() {
+  if (cachedApiKey) return cachedApiKey
+  const client = new SecretsManagerClient({ region: process.env.AWS_REGION })
+  const cmd = new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
+  const resp = await client.send(cmd)
+  cachedApiKey = resp.SecretString
+  return cachedApiKey
+}
+
+const SYSTEM_PROMPT = `You are a Japanese language teacher. Given a Japanese paragraph, analyze it and return ONLY a JSON object with this exact structure:
+
+{
+  "tokens": [{ "text": "string", "reading": "hiragana or null", "wordId": "wN or null", "grammarId": "gN or null" }],
+  "vocabulary": [{ "id": "wN", "word": "string", "reading": "hiragana", "meaning": "Vietnamese meaning", "examples": ["Japanese → Vietnamese", "Japanese → Vietnamese"] }],
+  "grammar": [{ "id": "gN", "pattern": "〜pattern", "explanation": "Vietnamese explanation", "example": "Japanese → Vietnamese" }]
+}
+
+Rules:
+- "reading": provide hiragana only for tokens containing kanji; null for pure hiragana/katakana/punctuation
+- "wordId": assign to meaningful vocabulary (nouns, verbs, adjectives, adverbs); null for particles/punctuation
+- "grammarId": assign to tokens forming a grammar pattern (〜ています, 〜ので, 〜たい, etc.); null otherwise
+- A token may have both wordId and grammarId
+- All meanings and explanations must be in Vietnamese
+- Exactly 2 example sentences per vocabulary entry
+- Return ONLY the JSON object, no markdown, no extra text`
+
+export default async function handler(req, res) {
+  if (req.method !== 'POST') {
+    return res.status(405).json({ error: 'Method not allowed' })
+  }
+
+  const { text } = req.body || {}
+  if (!text) {
+    return res.status(400).json({ error: 'Missing text' })
+  }
+
+  try {
+    const apiKey = await getApiKey()
+    const openai = new OpenAI({ apiKey, baseURL: 'https://proxy.heyalice.net/v1' })
+
+    const completion = await openai.chat.completions.create({
+      model: 'chatgpt-5.4',
+      messages: [
+        { role: 'system', content: SYSTEM_PROMPT },
+        { role: 'user', content: text },
+      ],
+      response_format: { type: 'json_object' },
+    })
+
+    const parsed = JSON.parse(completion.choices[0].message.content)
+    return res.status(200).json(parsed)
+  } catch (e) {
+    if (e.code === 'context_length_exceeded') {
+      return res.status(413).json({ error: 'TEXT_TOO_LONG' })
+    }
+    console.error('api/chat error:', e)
+    return res.status(500).json({ error: 'Internal server error' })
+  }
+}

diff --git a/api/chat.test.js b/api/chat.test.js
new file mode 100644
+++ b/api/chat.test.js
@@ -0,0 +1,72 @@
+// @vitest-environment node
+import { describe, it, expect, vi, beforeEach } from 'vitest'
+
+vi.mock('@aws-sdk/client-secrets-manager', () => ({
+  SecretsManagerClient: vi.fn(function() {
+    return { send: vi.fn().mockResolvedValue({ SecretString: 'test-api-key' }) }
+  }),
+  GetSecretValueCommand: vi.fn(),
+}))
+
+const mockCreate = vi.fn().mockResolvedValue({
+  choices: [{
+    message: {
+      content: JSON.stringify({
+        tokens: [{ text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null }],
+        vocabulary: [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] }],
+        grammar: [],
+      }),
+    },
+  }],
+})
+
+vi.mock('openai', () => ({
+  default: vi.fn(function() {
+    return { chat: { completions: { create: mockCreate } } }
+  }),
+}))
+
+const { default: handler } = await import('./chat.js')
+
+describe('POST /api/chat', () => {
+  let res
+
+  beforeEach(() => {
+    res = {
+      status: vi.fn().mockReturnThis(),
+      json: vi.fn(),
+    }
+    mockCreate.mockClear()
+  })
+
+  it('returns 200 with structured JSON for valid text', async () => {
+    await handler({ method: 'POST', body: { text: '日本語を勉強しています。' } }, res)
+    expect(res.status).toHaveBeenCalledWith(200)
+    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ tokens: expect.any(Array) }))
+  })
+
+  it('returns 405 for non-POST requests', async () => {
+    await handler({ method: 'GET', body: {} }, res)
+    expect(res.status).toHaveBeenCalledWith(405)
+  })
+
+  it('returns 400 when text is missing', async () => {
+    await handler({ method: 'POST', body: {} }, res)
+    expect(res.status).toHaveBeenCalledWith(400)
+  })
+
+  it('returns 413 when OpenAI reports context_length_exceeded', async () => {
+    const err = new Error('context_length_exceeded')
+    err.code = 'context_length_exceeded'
+    mockCreate.mockRejectedValueOnce(err)
+    await handler({ method: 'POST', body: { text: 'long text' } }, res)
+    expect(res.status).toHaveBeenCalledWith(413)
+    expect(res.json).toHaveBeenCalledWith({ error: 'TEXT_TOO_LONG' })
+  })
+
+  it('returns 500 for unexpected errors', async () => {
+    mockCreate.mockRejectedValueOnce(new Error('network failure'))
+    await handler({ method: 'POST', body: { text: '日本語' } }, res)
+    expect(res.status).toHaveBeenCalledWith(500)
+  })
+})
```

## Implementer Report
See: .superpowers/sdd/task-3-report.md
