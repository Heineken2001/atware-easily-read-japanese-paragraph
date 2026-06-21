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

Expected: PASS — 5 tests passing (plus 27 from previous tasks = 32 total)

- [ ] **Step 5: Commit**

```bash
git add src/components/VocabPanel.jsx src/components/VocabPanel.test.jsx
git commit -m "feat: add VocabPanel component with active highlight"
```
