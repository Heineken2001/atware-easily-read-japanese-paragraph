# Japanese Easy Read Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React web app that analyzes pasted Japanese text and displays furigana, Vietnamese vocabulary meanings, and grammar explanations, powered by a Vercel serverless function that securely retrieves the API key from AWS Secrets Manager.

**Architecture:** The React frontend posts Japanese text to `/api/chat` (a Vercel serverless function). The function fetches the OpenAI API key from AWS Secrets Manager, calls the OpenAI-compatible proxy at `https://proxy.heyalice.net/v1`, and returns structured JSON. The frontend renders this as interactive furigana text with a vocabulary/grammar side panel.

**Tech Stack:** Vite 5, React 18, Vitest, @testing-library/react, Tailwind CSS v3, openai SDK, @aws-sdk/client-secrets-manager, Vercel CLI

## Global Constraints

- Node.js 20+
- React 18
- All UI copy and error messages in Vietnamese
- Model: `chatgpt-5.4` via proxy `https://proxy.heyalice.net/v1`
- AWS Secrets Manager secret value is a plain string (the API key itself, not JSON)
- AWS region in env var `AWS_REGION`; secret name in env var `SECRET_NAME`
- Never commit `.env.local` or any file containing secrets
- `response_format: { type: 'json_object' }` on every OpenAI call to guarantee valid JSON

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/index.css`
- Create: `src/App.jsx` (placeholder)
- Create: `src/test-setup.js`
- Create: `vercel.json`
- Create: `.gitignore`
- Create: `.env.local.example`

**Interfaces:**
- Produces: `npm run dev` starts Vite at `http://localhost:5173`; `npm test` runs Vitest; `vercel dev` serves frontend + `/api/` functions

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/trannhathuy/Documents/japanese-easy-read
git init
```

Expected: `Initialized empty Git repository in .../japanese-easy-read/.git/`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "japanese-easy-read",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom tailwindcss postcss autoprefixer
npm install openai @aws-sdk/client-secrets-manager
npm install -D vercel
```

- [ ] **Step 4: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
```

- [ ] **Step 5: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 7: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [x] **Step 8: Create index.html**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Japanese Easy Read</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [x] **Step 9: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 10: Create src/App.jsx (placeholder)**

```jsx
export default function App() {
  return <div className="p-4">Japanese Easy Read</div>
}
```

- [ ] **Step 11: Create vercel.json**

```json
{
  "framework": "vite"
}
```

- [ ] **Step 12: Create .gitignore**

```
node_modules/
dist/
.env.local
.env*.local
.vercel/
```

- [ ] **Step 13: Create .env.local.example**

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-southeast-1
SECRET_NAME=your-secret-name-in-aws-secrets-manager
```

- [ ] **Step 14: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at `http://localhost:5173`

- [ ] **Step 15: Commit**

```bash
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html src/ vercel.json .gitignore .env.local.example
git commit -m "feat: project scaffold — Vite + React + Tailwind + Vitest"
```

---

### Task 2: API Response Parser

**Files:**
- Create: `src/utils/parseResponse.js`
- Create: `src/utils/parseResponse.test.js`

**Interfaces:**
- Produces: `parseResponse(data)` — validates shape and returns `{ tokens, vocabulary, grammar }`, throws `new Error('Invalid response format')` if shape is wrong
- Consumes: raw object from GPT API response

- [ ] **Step 1: Write failing tests**

Create `src/utils/parseResponse.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { parseResponse } from './parseResponse'

const valid = {
  tokens: [
    { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
    { text: 'を', reading: null, wordId: null, grammarId: null },
    { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
  ],
  vocabulary: [
    { id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] },
  ],
  grammar: [
    { id: 'g1', pattern: '〜しています', explanation: 'đang làm gì đó', example: '勉強しています。→ Tôi đang học.' },
  ],
}

describe('parseResponse', () => {
  it('returns data unchanged when valid', () => {
    const result = parseResponse(valid)
    expect(result.tokens).toHaveLength(3)
    expect(result.vocabulary).toHaveLength(1)
    expect(result.grammar).toHaveLength(1)
  })

  it('throws when tokens is missing', () => {
    expect(() => parseResponse({ ...valid, tokens: undefined })).toThrow('Invalid response format')
  })

  it('throws when vocabulary is missing', () => {
    expect(() => parseResponse({ ...valid, vocabulary: undefined })).toThrow('Invalid response format')
  })

  it('throws when grammar is missing', () => {
    expect(() => parseResponse({ ...valid, grammar: undefined })).toThrow('Invalid response format')
  })

  it('throws when tokens is not an array', () => {
    expect(() => parseResponse({ ...valid, tokens: 'bad' })).toThrow('Invalid response format')
  })

  it('throws when a token is missing text', () => {
    expect(() => parseResponse({ ...valid, tokens: [{ reading: null, wordId: null, grammarId: null }] })).toThrow('Invalid response format')
  })

  it('throws when called with null', () => {
    expect(() => parseResponse(null)).toThrow('Invalid response format')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './parseResponse'`

- [ ] **Step 3: Implement parseResponse**

Create `src/utils/parseResponse.js`:

```js
export function parseResponse(data) {
  if (
    !data ||
    !Array.isArray(data.tokens) ||
    !Array.isArray(data.vocabulary) ||
    !Array.isArray(data.grammar)
  ) {
    throw new Error('Invalid response format')
  }
  for (const token of data.tokens) {
    if (typeof token.text !== 'string') throw new Error('Invalid response format')
  }
  return { tokens: data.tokens, vocabulary: data.vocabulary, grammar: data.grammar }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 7 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseResponse.js src/utils/parseResponse.test.js
git commit -m "feat: add parseResponse utility with shape validation"
```

---

### Task 3: Vercel Serverless Function

**Files:**
- Create: `api/chat.js`
- Create: `api/chat.test.js`

**Interfaces:**
- Consumes: `POST /api/chat` with JSON body `{ text: string }`
- Produces:
  - `200` + `{ tokens, vocabulary, grammar }` on success
  - `400` + `{ error: 'Missing text' }` when text is absent
  - `405` + `{ error: 'Method not allowed' }` for non-POST
  - `413` + `{ error: 'TEXT_TOO_LONG' }` when GPT context is exceeded
  - `500` + `{ error: 'Internal server error' }` for all other failures

- [ ] **Step 1: Write failing tests**

Create `api/chat.test.js`:

```js
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ SecretString: 'test-api-key' }),
  })),
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
  default: vi.fn(() => ({
    chat: { completions: { create: mockCreate } },
  })),
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './chat.js'`

- [ ] **Step 3: Implement api/chat.js**

```js
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import OpenAI from 'openai'

let cachedApiKey = null

async function getApiKey() {
  if (cachedApiKey) return cachedApiKey
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION })
  const cmd = new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
  const resp = await client.send(cmd)
  cachedApiKey = resp.SecretString
  return cachedApiKey
}

const SYSTEM_PROMPT = `You are a Japanese language teacher. Given a Japanese paragraph, analyze it and return ONLY a JSON object with this exact structure:

{
  "tokens": [{ "text": "string", "reading": "hiragana or null", "wordId": "wN or null", "grammarId": "gN or null" }],
  "vocabulary": [{ "id": "wN", "word": "string", "reading": "hiragana", "meaning": "Vietnamese meaning", "examples": ["Japanese → Vietnamese", "Japanese → Vietnamese"] }],
  "grammar": [{ "id": "gN", "pattern": "〜pattern", "explanation": "Vietnamese explanation", "example": "Japanese → Vietnamese" }]
}

Rules:
- "reading": provide hiragana only for tokens containing kanji; null for pure hiragana/katakana/punctuation
- "wordId": assign to meaningful vocabulary (nouns, verbs, adjectives, adverbs); null for particles/punctuation
- "grammarId": assign to tokens forming a grammar pattern (〜ています, 〜ので, 〜たい, etc.); null otherwise
- A token may have both wordId and grammarId
- All meanings and explanations must be in Vietnamese
- Exactly 2 example sentences per vocabulary entry
- Return ONLY the JSON object, no markdown, no extra text`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body || {}
  if (!text) {
    return res.status(400).json({ error: 'Missing text' })
  }

  try {
    const apiKey = await getApiKey()
    const openai = new OpenAI({ apiKey, baseURL: 'https://proxy.heyalice.net/v1' })

    const completion = await openai.chat.completions.create({
      model: 'chatgpt-5.4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(completion.choices[0].message.content)
    return res.status(200).json(parsed)
  } catch (e) {
    if (e.code === 'context_length_exceeded') {
      return res.status(413).json({ error: 'TEXT_TOO_LONG' })
    }
    console.error('api/chat error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add api/chat.js api/chat.test.js
git commit -m "feat: add Vercel serverless function with AWS Secrets Manager and OpenAI proxy"
```

---

### Task 4: useAnalyze Hook

**Files:**
- Create: `src/hooks/useAnalyze.js`
- Create: `src/hooks/useAnalyze.test.js`

**Interfaces:**
- Produces: `useAnalyze()` → `{ result, loading, error, analyze }`
  - `result`: `{ tokens, vocabulary, grammar }` | `null`
  - `loading`: `boolean`
  - `error`: `string` | `null` — `'TEXT_TOO_LONG'` for 413, otherwise HTTP error message
  - `analyze(text: string)`: `Promise<void>`
- Consumes: `parseResponse` from `../utils/parseResponse`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useAnalyze.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalyze } from './useAnalyze'

const mockResult = {
  tokens: [{ text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null }],
  vocabulary: [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] }],
  grammar: [],
}

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('useAnalyze', () => {
  it('starts with null result, not loading, no error', () => {
    const { result } = renderHook(() => useAnalyze())
    expect(result.current.result).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets result on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    })
    const { result } = renderHook(() => useAnalyze())
    await act(() => result.current.analyze('日本語'))
    expect(result.current.result).toEqual(mockResult)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error TEXT_TOO_LONG on 413', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 413 })
    const { result } = renderHook(() => useAnalyze())
    await act(() => result.current.analyze('very long text'))
    expect(result.current.error).toBe('TEXT_TOO_LONG')
    expect(result.current.result).toBeNull()
  })

  it('sets generic error on other failures', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const { result } = renderHook(() => useAnalyze())
    await act(() => result.current.analyze('日本語'))
    expect(result.current.error).toBeTruthy()
    expect(result.current.error).not.toBe('TEXT_TOO_LONG')
  })

  it('sets loading true while fetching', async () => {
    let resolveReq
    global.fetch = vi.fn(() => new Promise(r => { resolveReq = r }))
    const { result } = renderHook(() => useAnalyze())
    act(() => { result.current.analyze('日本語') })
    expect(result.current.loading).toBe(true)
    resolveReq({ ok: true, json: () => Promise.resolve(mockResult) })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './useAnalyze'`

- [ ] **Step 3: Implement useAnalyze**

Create `src/hooks/useAnalyze.js`:

```js
import { useState } from 'react'
import { parseResponse } from '../utils/parseResponse'

export function useAnalyze() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(text) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        if (res.status === 413) throw new Error('TEXT_TOO_LONG')
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(parseResponse(data))
    } catch (e) {
      setError(e.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, analyze }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAnalyze.js src/hooks/useAnalyze.test.js
git commit -m "feat: add useAnalyze hook with loading/error state"
```

---

### Task 5: FuriganaText Component

**Files:**
- Create: `src/components/FuriganaText.jsx`
- Create: `src/components/FuriganaText.test.jsx`

**Interfaces:**
- Consumes: `{ tokens, vocabulary, grammar, onWordClick, onGrammarClick }`
  - `tokens`: `Array<{ text: string, reading: string|null, wordId: string|null, grammarId: string|null }>`
  - `vocabulary`: `Array<{ id, word, reading, meaning, examples }>`
  - `grammar`: `Array<{ id, pattern, explanation, example }>`
  - `onWordClick(vocabEntry: object, position: { x: number, y: number })`: called on word click; position is viewport-relative (for `position: fixed` popup)
  - `onGrammarClick(grammarId: string)`: called on grammar token click
- Produces: `<p>` with `<ruby>` for kanji tokens, underlined grammar tokens, clickable word tokens

- [ ] **Step 1: Write failing tests**

Create `src/components/FuriganaText.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FuriganaText from './FuriganaText'

const tokens = [
  { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
  { text: 'を', reading: null, wordId: null, grammarId: null },
  { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
]
const vocabulary = [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: [] }]
const grammar = [{ id: 'g1', pattern: '〜しています', explanation: 'đang làm', example: '' }]

describe('FuriganaText', () => {
  it('renders all token texts', () => {
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('を')).toBeInTheDocument()
    expect(screen.getByText('しています')).toBeInTheDocument()
  })

  it('renders furigana reading in rt tag above kanji token', () => {
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
    expect(screen.getByText('にほんご')).toBeInTheDocument()
    expect(document.querySelector('rt').textContent).toBe('にほんご')
  })

  it('only renders rt tags for tokens with reading', () => {
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
    expect(document.querySelectorAll('rt')).toHaveLength(1)
  })

  it('calls onWordClick with vocab entry and position when word token clicked', () => {
    const onWordClick = vi.fn()
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={onWordClick} onGrammarClick={() => {}} />)
    fireEvent.click(screen.getByText('日本語'))
    expect(onWordClick).toHaveBeenCalledWith(vocabulary[0], expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
  })

  it('calls onGrammarClick with grammarId when grammar token clicked', () => {
    const onGrammarClick = vi.fn()
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={onGrammarClick} />)
    fireEvent.click(screen.getByText('しています'))
    expect(onGrammarClick).toHaveBeenCalledWith('g1')
  })

  it('does not call onGrammarClick when clicking a plain token', () => {
    const onGrammarClick = vi.fn()
    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={onGrammarClick} />)
    fireEvent.click(screen.getByText('を'))
    expect(onGrammarClick).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './FuriganaText'`

- [ ] **Step 3: Implement FuriganaText**

Create `src/components/FuriganaText.jsx`:

```jsx
export default function FuriganaText({ tokens, vocabulary, grammar, onWordClick, onGrammarClick }) {
  const vocabMap = Object.fromEntries(vocabulary.map(v => [v.id, v]))

  function handleClick(e, token) {
    e.stopPropagation()
    if (token.wordId) {
      const rect = e.currentTarget.getBoundingClientRect()
      onWordClick(vocabMap[token.wordId], { x: rect.left, y: rect.bottom })
    } else if (token.grammarId) {
      onGrammarClick(token.grammarId)
    }
  }

  return (
    <p className="text-2xl leading-loose">
      {tokens.map((token, i) => {
        const isClickable = !!(token.wordId || token.grammarId)
        const classes = [
          isClickable ? 'cursor-pointer' : '',
          token.wordId ? 'text-blue-700' : '',
          token.grammarId ? 'underline decoration-orange-500' : '',
        ].filter(Boolean).join(' ')

        if (token.reading) {
          return (
            <ruby key={i} className={classes} onClick={isClickable ? e => handleClick(e, token) : undefined}>
              {token.text}
              <rt className="text-xs text-gray-500">{token.reading}</rt>
            </ruby>
          )
        }
        return (
          <span key={i} className={classes} onClick={isClickable ? e => handleClick(e, token) : undefined}>
            {token.text}
          </span>
        )
      })}
    </p>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/FuriganaText.jsx src/components/FuriganaText.test.jsx
git commit -m "feat: add FuriganaText component with ruby tags, word clicks, grammar underlines"
```

---

### Task 6: WordPopup Component

**Files:**
- Create: `src/components/WordPopup.jsx`
- Create: `src/components/WordPopup.test.jsx`

**Interfaces:**
- Consumes: `{ word, position: { x: number, y: number }, onClose }`
  - `word`: `{ word: string, reading: string, meaning: string, examples: string[] }`
  - `position`: viewport-relative coordinates; popup uses `position: fixed`
  - `onClose()`: called when the close button is clicked
- Produces: fixed-position card showing Vietnamese meaning + example sentences

- [ ] **Step 1: Write failing tests**

Create `src/components/WordPopup.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WordPopup from './WordPopup'

const word = {
  word: '日本語',
  reading: 'にほんご',
  meaning: 'tiếng Nhật',
  examples: [
    '日本語を毎日練習しています。→ Tôi luyện tập tiếng Nhật mỗi ngày.',
    '日本語は難しいけど面白い。→ Tiếng Nhật khó nhưng thú vị.',
  ],
}

describe('WordPopup', () => {
  it('renders the word, reading, and Vietnamese meaning', () => {
    render(<WordPopup word={word} position={{ x: 100, y: 200 }} onClose={() => {}} />)
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('にほんご')).toBeInTheDocument()
    expect(screen.getByText('tiếng Nhật')).toBeInTheDocument()
  })

  it('renders both example sentences', () => {
    render(<WordPopup word={word} position={{ x: 0, y: 0 }} onClose={() => {}} />)
    expect(screen.getByText(word.examples[0])).toBeInTheDocument()
    expect(screen.getByText(word.examples[1])).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<WordPopup word={word} position={{ x: 0, y: 0 }} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /đóng/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('positions the popup using fixed coordinates from position prop', () => {
    const { container } = render(<WordPopup word={word} position={{ x: 150, y: 300 }} onClose={() => {}} />)
    const popup = container.firstChild
    expect(popup.style.left).toBe('150px')
    expect(popup.style.top).toBe('300px')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './WordPopup'`

- [ ] **Step 3: Implement WordPopup**

Create `src/components/WordPopup.jsx`:

```jsx
export default function WordPopup({ word, position, onClose }) {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xl font-bold">{word.word}</span>
          <span className="text-sm text-gray-500 ml-2">{word.reading}</span>
        </div>
        <button
          aria-label="Đóng"
          className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="text-blue-700 font-medium mb-3">{word.meaning}</p>
      <div className="space-y-2">
        {word.examples.map((ex, i) => (
          <p key={i} className="text-sm text-gray-600">{ex}</p>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/WordPopup.jsx src/components/WordPopup.test.jsx
git commit -m "feat: add WordPopup component with fixed positioning, meaning and examples"
```

---

### Task 7: VocabPanel Component

**Files:**
- Create: `src/components/VocabPanel.jsx`
- Create: `src/components/VocabPanel.test.jsx`

**Interfaces:**
- Consumes: `{ vocabulary, activeWordId }`
  - `vocabulary`: `Array<{ id, word, reading, meaning, examples }>`
  - `activeWordId`: `string | null` — entry with this id gets a blue highlight
- Produces: scrollable list of vocabulary entries with reading, meaning, and examples

- [ ] **Step 1: Write failing tests**

Create `src/components/VocabPanel.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VocabPanel from './VocabPanel'

const vocabulary = [
  { id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex1 → VN1'] },
  { id: 'w2', word: '勉強', reading: 'べんきょう', meaning: 'học tập', examples: ['Ex2 → VN2'] },
]

describe('VocabPanel', () => {
  it('renders all vocabulary entries', () => {
    render(<VocabPanel vocabulary={vocabulary} activeWordId={null} />)
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('勉強')).toBeInTheDocument()
  })

  it('renders meanings for all entries', () => {
    render(<VocabPanel vocabulary={vocabulary} activeWordId={null} />)
    expect(screen.getByText('tiếng Nhật')).toBeInTheDocument()
    expect(screen.getByText('học tập')).toBeInTheDocument()
  })

  it('applies bg-blue-50 class to the active entry', () => {
    const { container } = render(<VocabPanel vocabulary={vocabulary} activeWordId="w1" />)
    const entries = container.querySelectorAll('[data-word-id]')
    const active = [...entries].find(el => el.dataset.wordId === 'w1')
    expect(active.className).toMatch(/bg-blue-50/)
  })

  it('does not apply bg-blue-50 to inactive entries', () => {
    const { container } = render(<VocabPanel vocabulary={vocabulary} activeWordId="w1" />)
    const entries = container.querySelectorAll('[data-word-id]')
    const inactive = [...entries].find(el => el.dataset.wordId === 'w2')
    expect(inactive.className).not.toMatch(/bg-blue-50/)
  })

  it('shows empty state when vocabulary is empty', () => {
    render(<VocabPanel vocabulary={[]} activeWordId={null} />)
    expect(screen.getByText('Chưa có từ vựng.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './VocabPanel'`

- [ ] **Step 3: Implement VocabPanel**

Create `src/components/VocabPanel.jsx`:

```jsx
export default function VocabPanel({ vocabulary, activeWordId }) {
  if (vocabulary.length === 0) {
    return <p className="text-gray-400 text-sm p-4">Chưa có từ vựng.</p>
  }
  return (
    <div className="divide-y divide-gray-100">
      {vocabulary.map(entry => (
        <div
          key={entry.id}
          data-word-id={entry.id}
          className={`p-3 ${activeWordId === entry.id ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-bold">{entry.word}</span>
            <span className="text-sm text-gray-500">{entry.reading}</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">{entry.meaning}</p>
          <div className="mt-2 space-y-1">
            {entry.examples.map((ex, i) => (
              <p key={i} className="text-xs text-gray-500">{ex}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/VocabPanel.jsx src/components/VocabPanel.test.jsx
git commit -m "feat: add VocabPanel component with active highlight"
```

---

### Task 8: GrammarPanel Component

**Files:**
- Create: `src/components/GrammarPanel.jsx`
- Create: `src/components/GrammarPanel.test.jsx`

**Interfaces:**
- Consumes: `{ grammar, activeGrammarId }`
  - `grammar`: `Array<{ id, pattern, explanation, example }>`
  - `activeGrammarId`: `string | null` — entry with this id gets orange highlight and scrolls into view
- Produces: list of grammar entries; active entry highlighted in orange and auto-scrolled to

- [ ] **Step 1: Write failing tests**

Create `src/components/GrammarPanel.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GrammarPanel from './GrammarPanel'

const grammar = [
  { id: 'g1', pattern: '〜しています', explanation: 'Diễn tả hành động đang xảy ra.', example: '勉強しています。→ Tôi đang học.' },
  { id: 'g2', pattern: '〜ので', explanation: 'Diễn tả nguyên nhân.', example: '雨なので → vì trời mưa' },
]

describe('GrammarPanel', () => {
  it('renders all grammar patterns', () => {
    render(<GrammarPanel grammar={grammar} activeGrammarId={null} />)
    expect(screen.getByText('〜しています')).toBeInTheDocument()
    expect(screen.getByText('〜ので')).toBeInTheDocument()
  })

  it('renders explanations and examples', () => {
    render(<GrammarPanel grammar={grammar} activeGrammarId={null} />)
    expect(screen.getByText('Diễn tả hành động đang xảy ra.')).toBeInTheDocument()
    expect(screen.getByText('勉強しています。→ Tôi đang học.')).toBeInTheDocument()
  })

  it('applies bg-orange-50 class to the active entry', () => {
    const { container } = render(<GrammarPanel grammar={grammar} activeGrammarId="g1" />)
    const entries = container.querySelectorAll('[data-grammar-id]')
    const active = [...entries].find(el => el.dataset.grammarId === 'g1')
    expect(active.className).toMatch(/bg-orange-50/)
  })

  it('does not apply bg-orange-50 to inactive entries', () => {
    const { container } = render(<GrammarPanel grammar={grammar} activeGrammarId="g1" />)
    const entries = container.querySelectorAll('[data-grammar-id]')
    const inactive = [...entries].find(el => el.dataset.grammarId === 'g2')
    expect(inactive.className).not.toMatch(/bg-orange-50/)
  })

  it('shows empty state when grammar is empty', () => {
    render(<GrammarPanel grammar={[]} activeGrammarId={null} />)
    expect(screen.getByText('Chưa có ngữ pháp.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './GrammarPanel'`

- [ ] **Step 3: Implement GrammarPanel**

Create `src/components/GrammarPanel.jsx`:

```jsx
import { useEffect, useRef } from 'react'

export default function GrammarPanel({ grammar, activeGrammarId }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeGrammarId])

  if (grammar.length === 0) {
    return <p className="text-gray-400 text-sm p-4">Chưa có ngữ pháp.</p>
  }
  return (
    <div className="divide-y divide-gray-100">
      {grammar.map(entry => (
        <div
          key={entry.id}
          data-grammar-id={entry.id}
          ref={activeGrammarId === entry.id ? activeRef : null}
          className={`p-3 ${activeGrammarId === entry.id ? 'bg-orange-50' : ''}`}
        >
          <p className="font-bold text-orange-700">{entry.pattern}</p>
          <p className="text-sm text-gray-700 mt-1">{entry.explanation}</p>
          <p className="text-xs text-gray-500 mt-1">{entry.example}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/GrammarPanel.jsx src/components/GrammarPanel.test.jsx
git commit -m "feat: add GrammarPanel component with orange highlight and auto-scroll"
```

---

### Task 9: App.jsx — Wire Everything Together

**Files:**
- Modify: `src/App.jsx`
- Create: `src/App.test.jsx`

**Interfaces:**
- Consumes: `useAnalyze`, `FuriganaText`, `WordPopup`, `VocabPanel`, `GrammarPanel`
- Produces: complete working app — textarea input, Phân tích button, reading area with popup, side panel with Từ vựng/Ngữ pháp tabs

- [ ] **Step 1: Write failing integration tests**

Create `src/App.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

const mockResult = {
  tokens: [
    { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
    { text: 'を', reading: null, wordId: null, grammarId: null },
    { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
  ],
  vocabulary: [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] }],
  grammar: [{ id: 'g1', pattern: '〜しています', explanation: 'đang làm', example: 'Ex → VN' }],
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResult),
  })
})

describe('App', () => {
  it('renders the textarea and Phân tích button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/nhập đoạn văn/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /phân tích/i })).toBeInTheDocument()
  })

  it('shows Đang phân tích... while loading', async () => {
    let resolveReq
    global.fetch = vi.fn(() => new Promise(r => { resolveReq = () => r({ ok: true, json: () => Promise.resolve(mockResult) }) }))
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    expect(screen.getByText('Đang phân tích...')).toBeInTheDocument()
    resolveReq()
  })

  it('renders furigana text after successful analysis', async () => {
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    await waitFor(() => expect(screen.getByText('にほんご')).toBeInTheDocument())
  })

  it('shows Có lỗi xảy ra on generic failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    await waitFor(() => expect(screen.getByText(/có lỗi xảy ra/i)).toBeInTheDocument())
  })

  it('shows text too long message on 413', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 413 })
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    await waitFor(() => expect(screen.getByText(/quá dài/i)).toBeInTheDocument())
  })

  it('displays vocabulary in Từ vựng tab by default after analysis', async () => {
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    await waitFor(() => screen.getByText('tiếng Nhật'))
    expect(screen.getByText('tiếng Nhật')).toBeInTheDocument()
  })

  it('switches to Ngữ pháp tab when grammar token is clicked', async () => {
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), { target: { value: '日本語' } })
    fireEvent.click(screen.getByRole('button', { name: /phân tích/i }))
    await waitFor(() => screen.getByText('しています'))
    fireEvent.click(screen.getByText('しています'))
    expect(screen.getByText('〜しています')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — tests fail against placeholder App

- [ ] **Step 3: Implement App.jsx**

Replace `src/App.jsx`:

```jsx
import { useState } from 'react'
import { useAnalyze } from './hooks/useAnalyze'
import FuriganaText from './components/FuriganaText'
import WordPopup from './components/WordPopup'
import VocabPanel from './components/VocabPanel'
import GrammarPanel from './components/GrammarPanel'

function errorMessage(error) {
  if (error === 'TEXT_TOO_LONG') return 'Đoạn văn quá dài, vui lòng thử đoạn ngắn hơn.'
  return `Có lỗi xảy ra: ${error}. Vui lòng thử lại.`
}

export default function App() {
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState('vocab')
  const [activeWordId, setActiveWordId] = useState(null)
  const [activeGrammarId, setActiveGrammarId] = useState(null)
  const [popup, setPopup] = useState(null)
  const { result, loading, error, analyze } = useAnalyze()

  function handleAnalyze() {
    if (!text.trim()) return
    setPopup(null)
    setActiveWordId(null)
    setActiveGrammarId(null)
    analyze(text)
  }

  function handleWordClick(vocabEntry, position) {
    setActiveWordId(vocabEntry.id)
    setActiveTab('vocab')
    setPopup({ word: vocabEntry, position })
  }

  function handleGrammarClick(grammarId) {
    setActiveGrammarId(grammarId)
    setActiveTab('grammar')
    setPopup(null)
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setPopup(null)}>
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold">🇯🇵 Japanese Easy Read</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <textarea
            className="w-full border rounded p-3 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={4}
            placeholder="Nhập đoạn văn tiếng Nhật..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? 'Đang phân tích...' : 'Phân tích'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {errorMessage(error)}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border p-6 relative" onClick={e => e.stopPropagation()}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Đọc</h2>
              <FuriganaText
                tokens={result.tokens}
                vocabulary={result.vocabulary}
                grammar={result.grammar}
                onWordClick={handleWordClick}
                onGrammarClick={handleGrammarClick}
              />
              {popup && (
                <WordPopup
                  word={popup.word}
                  position={popup.position}
                  onClose={() => setPopup(null)}
                />
              )}
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === 'vocab' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('vocab')}
                >
                  Từ vựng
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === 'grammar' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('grammar')}
                >
                  Ngữ pháp
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
                {activeTab === 'vocab' ? (
                  <VocabPanel vocabulary={result.vocabulary} activeWordId={activeWordId} />
                ) : (
                  <GrammarPanel grammar={result.grammar} activeGrammarId={activeGrammarId} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to verify they pass**

```bash
npm test
```

Expected: PASS — all tests across all files passing

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire up App with full layout, tabs, word popup, grammar highlight"
```

---

### Task 10: Deployment Setup

**Files:**
- No new code files — configuration only

**Interfaces:**
- Produces: working `vercel dev` for local testing; working `vercel deploy --prod` for production at Vercel URL

- [ ] **Step 1: Install Vercel CLI if not already installed**

```bash
npm list -g vercel || npm install -g vercel
```

- [ ] **Step 2: Log in to Vercel**

```bash
vercel login
```

Follow the prompts (browser opens for authentication).

- [ ] **Step 3: Create .env.local from the example**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your actual values:
```
AWS_ACCESS_KEY_ID=<your key>
AWS_SECRET_ACCESS_KEY=<your secret>
AWS_REGION=<e.g. ap-southeast-1>
SECRET_NAME=<name of the secret in AWS Secrets Manager>
```

The secret stored in AWS under `SECRET_NAME` must be the plain API key string for `https://proxy.heyalice.net/v1`.

- [ ] **Step 4: Test locally with vercel dev**

```bash
vercel dev
```

Expected: app available at `http://localhost:3000`, `/api/chat` handled by the serverless function.

Paste `日本語を毎日勉強しています。` and click Phân tích. Verify:
- Furigana appears above kanji
- Clicking `日本語` shows a popup with Vietnamese meaning and 2 examples
- `しています` is underlined; clicking it switches the side panel to Ngữ pháp tab

- [ ] **Step 5: Add environment variables in Vercel dashboard**

Go to your Vercel project → Settings → Environment Variables. Add:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `SECRET_NAME`

Set scope to **Production** (and Preview if you want preview deployments to work).

- [ ] **Step 6: Deploy to production**

```bash
vercel deploy --prod
```

Expected: production URL printed, e.g. `https://japanese-easy-read.vercel.app`

- [ ] **Step 7: Smoke test production**

Open the production URL. Paste `日本語を毎日勉強しています。`, click Phân tích, and verify all three features work: furigana, vocabulary popup, grammar panel.

- [ ] **Step 8: Commit final state**

```bash
git add .
git commit -m "chore: deployment setup complete — vercel + AWS Secrets Manager"
```
