# Task 4 Review Package

## Commits
1bf3b80 feat: add useAnalyze hook with loading/error state

## Stat
2 files changed, 92 insertions(+)

## Diff

```diff
diff --git a/src/hooks/useAnalyze.js b/src/hooks/useAnalyze.js
new file mode 100644
--- /dev/null
+++ b/src/hooks/useAnalyze.js
@@ -0,0 +1,33 @@
+import { useState } from 'react'
+import { parseResponse } from '../utils/parseResponse'
+
+export function useAnalyze() {
+  const [result, setResult] = useState(null)
+  const [loading, setLoading] = useState(false)
+  const [error, setError] = useState(null)
+
+  async function analyze(text) {
+    setLoading(true)
+    setError(null)
+    try {
+      const res = await fetch('/api/chat', {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ text }),
+      })
+      if (!res.ok) {
+        if (res.status === 413) throw new Error('TEXT_TOO_LONG')
+        throw new Error(`HTTP ${res.status}`)
+      }
+      const data = await res.json()
+      setResult(parseResponse(data))
+    } catch (e) {
+      setError(e.message)
+      setResult(null)
+    } finally {
+      setLoading(false)
+    }
+  }
+
+  return { result, loading, error, analyze }
+}

diff --git a/src/hooks/useAnalyze.test.js b/src/hooks/useAnalyze.test.js
new file mode 100644
--- /dev/null
+++ b/src/hooks/useAnalyze.test.js
@@ -0,0 +1,59 @@
+import { describe, it, expect, vi, beforeEach } from 'vitest'
+import { renderHook, act } from '@testing-library/react'
+import { useAnalyze } from './useAnalyze'
+
+const mockResult = {
+  tokens: [{ text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null }],
+  vocabulary: [{ id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] }],
+  grammar: [],
+}
+
+beforeEach(() => {
+  global.fetch = vi.fn()
+})
+
+describe('useAnalyze', () => {
+  it('starts with null result, not loading, no error', () => {
+    const { result } = renderHook(() => useAnalyze())
+    expect(result.current.result).toBeNull()
+    expect(result.current.loading).toBe(false)
+    expect(result.current.error).toBeNull()
+  })
+
+  it('sets result on success', async () => {
+    global.fetch = vi.fn().mockResolvedValue({
+      ok: true,
+      json: () => Promise.resolve(mockResult),
+    })
+    const { result } = renderHook(() => useAnalyze())
+    await act(() => result.current.analyze('日本語'))
+    expect(result.current.result).toEqual(mockResult)
+    expect(result.current.loading).toBe(false)
+    expect(result.current.error).toBeNull()
+  })
+
+  it('sets error TEXT_TOO_LONG on 413', async () => {
+    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 413 })
+    const { result } = renderHook(() => useAnalyze())
+    await act(() => result.current.analyze('very long text'))
+    expect(result.current.error).toBe('TEXT_TOO_LONG')
+    expect(result.current.result).toBeNull()
+  })
+
+  it('sets generic error on other failures', async () => {
+    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
+    const { result } = renderHook(() => useAnalyze())
+    await act(() => result.current.analyze('日本語'))
+    expect(result.current.error).toBeTruthy()
+    expect(result.current.error).not.toBe('TEXT_TOO_LONG')
+  })
+
+  it('sets loading true while fetching', async () => {
+    let resolveReq
+    global.fetch = vi.fn(() => new Promise(r => { resolveReq = r }))
+    const { result } = renderHook(() => useAnalyze())
+    act(() => { result.current.analyze('日本語') })
+    expect(result.current.loading).toBe(true)
+    resolveReq({ ok: true, json: () => Promise.resolve(mockResult) })
+  })
+})
```

## Implementer Report
See: .superpowers/sdd/task-4-report.md
