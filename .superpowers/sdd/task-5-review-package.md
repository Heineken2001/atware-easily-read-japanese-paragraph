# Task 5 Review Package

## Commits
fc672c2 feat: add FuriganaText component with ruby tags, word clicks, grammar underlines

## Stat
2 files changed, 92 insertions(+)

## Diff

```diff
diff --git a/src/components/FuriganaText.jsx b/src/components/FuriganaText.jsx
new file mode 100644
+++ b/src/components/FuriganaText.jsx
@@ -0,0 +1,40 @@
+export default function FuriganaText({ tokens, vocabulary, grammar, onWordClick, onGrammarClick }) {
+  const vocabMap = Object.fromEntries(vocabulary.map(v => [v.id, v]))
+
+  function handleClick(e, token) {
+    e.stopPropagation()
+    if (token.wordId) {
+      const rect = e.currentTarget.getBoundingClientRect()
+      onWordClick(vocabMap[token.wordId], { x: rect.left, y: rect.bottom })
+    } else if (token.grammarId) {
+      onGrammarClick(token.grammarId)
+    }
+  }
+
+  return (
+    <p className="text-2xl leading-loose">
+      {tokens.map((token, i) => {
+        const isClickable = !!(token.wordId || token.grammarId)
+        const classes = [
+          isClickable ? 'cursor-pointer' : '',
+          token.wordId ? 'text-blue-700' : '',
+          token.grammarId ? 'underline decoration-orange-500' : '',
+        ].filter(Boolean).join(' ')
+
+        if (token.reading) {
+          return (
+            <ruby key={i} className={classes} onClick={isClickable ? e => handleClick(e, token) : undefined}>
+              {token.text}
+              <rt className="text-xs text-gray-500">{token.reading}</rt>
+            </ruby>
+          )
+        }
+        return (
+          <span key={i} className={classes} onClick={isClickable ? e => handleClick(e, token) : undefined}>
+            {token.text}
+          </span>
+        )
+      })}
+    </p>
+  )
+}

diff --git a/src/components/FuriganaText.test.jsx b/src/components/FuriganaText.test.jsx
new file mode 100644
+++ b/src/components/FuriganaText.test.jsx
@@ -0,0 +1,52 @@
+import { describe, it, expect, vi } from 'vitest'
+import { render, screen, fireEvent } from '@testing-library/react'
+import FuriganaText from './FuriganaText'
+
+const tokens = [
+  { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
+  { text: 'を', reading: null, wordId: null, grammarId: null },
+  { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
+]
+const vocabulary = [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: [] }]
+const grammar = [{ id: 'g1', pattern: '〜しています', explanation: 'đang làm', example: '' }]
+
+describe('FuriganaText', () => {
+  it('renders all token texts', () => {
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
+    expect(screen.getByText('日本語')).toBeInTheDocument()
+    expect(screen.getByText('を')).toBeInTheDocument()
+    expect(screen.getByText('しています')).toBeInTheDocument()
+  })
+
+  it('renders furigana reading in rt tag above kanji token', () => {
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
+    expect(screen.getByText('にほんご')).toBeInTheDocument()
+    expect(document.querySelector('rt').textContent).toBe('にほんご')
+  })
+
+  it('only renders rt tags for tokens with reading', () => {
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={() => {}} />)
+    expect(document.querySelectorAll('rt')).toHaveLength(1)
+  })
+
+  it('calls onWordClick with vocab entry and position when word token clicked', () => {
+    const onWordClick = vi.fn()
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={onWordClick} onGrammarClick={() => {}} />)
+    fireEvent.click(screen.getByText('日本語'))
+    expect(onWordClick).toHaveBeenCalledWith(vocabulary[0], expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }))
+  })
+
+  it('calls onGrammarClick with grammarId when grammar token clicked', () => {
+    const onGrammarClick = vi.fn()
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={onGrammarClick} />)
+    fireEvent.click(screen.getByText('しています'))
+    expect(onGrammarClick).toHaveBeenCalledWith('g1')
+  })
+
+  it('does not call onGrammarClick when clicking a plain token', () => {
+    const onGrammarClick = vi.fn()
+    render(<FuriganaText tokens={tokens} vocabulary={vocabulary} grammar={grammar} onWordClick={() => {}} onGrammarClick={onGrammarClick} />)
+    fireEvent.click(screen.getByText('を'))
+    expect(onGrammarClick).not.toHaveBeenCalled()
+  })
+})
```
