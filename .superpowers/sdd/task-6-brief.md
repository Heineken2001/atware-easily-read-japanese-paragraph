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

Expected: PASS — 4 tests passing (plus 23 from previous tasks = 27 total)

- [ ] **Step 5: Commit**

```bash
git add src/components/WordPopup.jsx src/components/WordPopup.test.jsx
git commit -m "feat: add WordPopup component with fixed positioning, meaning and examples"
```
