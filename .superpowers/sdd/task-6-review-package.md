# Task 6 Review Package

## Commits
4d93e07 feat: add WordPopup component with fixed positioning, meaning and examples

## Stat
2 files changed, 71 insertions(+)

## Diff

```diff
diff --git a/src/components/WordPopup.jsx b/src/components/WordPopup.jsx
new file mode 100644
+++ b/src/components/WordPopup.jsx
@@ -0,0 +1,29 @@
+export default function WordPopup({ word, position, onClose }) {
+  return (
+    <div
+      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
+      style={{ left: position.x, top: position.y }}
+      onClick={e => e.stopPropagation()}
+    >
+      <div className="flex justify-between items-start mb-2">
+        <div>
+          <span className="text-xl font-bold">{word.word}</span>
+          <span className="text-sm text-gray-500 ml-2">{word.reading}</span>
+        </div>
+        <button
+          aria-label="Đóng"
+          className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2"
+          onClick={onClose}
+        >
+          ×
+        </button>
+      </div>
+      <p className="text-blue-700 font-medium mb-3">{word.meaning}</p>
+      <div className="space-y-2">
+        {word.examples.map((ex, i) => (
+          <p key={i} className="text-sm text-gray-600">{ex}</p>
+        ))}
+      </div>
+    </div>
+  )
+}

diff --git a/src/components/WordPopup.test.jsx b/src/components/WordPopup.test.jsx
new file mode 100644
+++ b/src/components/WordPopup.test.jsx
@@ -0,0 +1,42 @@
+import { describe, it, expect, vi } from 'vitest'
+import { render, screen, fireEvent } from '@testing-library/react'
+import WordPopup from './WordPopup'
+
+const word = {
+  word: '日本語',
+  reading: 'にほんご',
+  meaning: 'tiếng Nhật',
+  examples: [
+    '日本語を毎日練習しています。→ Tôi luyện tập tiếng Nhật mỗi ngày.',
+    '日本語は難しいけど面白い。→ Tiếng Nhật khó nhưng thú vị.',
+  ],
+}
+
+describe('WordPopup', () => {
+  it('renders the word, reading, and Vietnamese meaning', () => {
+    render(<WordPopup word={word} position={{ x: 100, y: 200 }} onClose={() => {}} />)
+    expect(screen.getByText('日本語')).toBeInTheDocument()
+    expect(screen.getByText('にほんご')).toBeInTheDocument()
+    expect(screen.getByText('tiếng Nhật')).toBeInTheDocument()
+  })
+
+  it('renders both example sentences', () => {
+    render(<WordPopup word={word} position={{ x: 0, y: 0 }} onClose={() => {}} />)
+    expect(screen.getByText(word.examples[0])).toBeInTheDocument()
+    expect(screen.getByText(word.examples[1])).toBeInTheDocument()
+  })
+
+  it('calls onClose when the close button is clicked', () => {
+    const onClose = vi.fn()
+    render(<WordPopup word={word} position={{ x: 0, y: 0 }} onClose={onClose} />)
+    fireEvent.click(screen.getByRole('button', { name: /đóng/i }))
+    expect(onClose).toHaveBeenCalled()
+  })
+
+  it('positions the popup using fixed coordinates from position prop', () => {
+    const { container } = render(<WordPopup word={word} position={{ x: 150, y: 300 }} onClose={() => {}} />)
+    const popup = container.firstChild
+    expect(popup.style.left).toBe('150px')
+    expect(popup.style.top).toBe('300px')
+  })
+})
```
