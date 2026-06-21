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

Expected: PASS — 5 tests passing (plus 32 from previous tasks = 37 total)

- [ ] **Step 5: Commit**

```bash
git add src/components/GrammarPanel.jsx src/components/GrammarPanel.test.jsx
git commit -m "feat: add GrammarPanel component with orange highlight and auto-scroll"
```
