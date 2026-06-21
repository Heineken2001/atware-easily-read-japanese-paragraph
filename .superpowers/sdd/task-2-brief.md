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
