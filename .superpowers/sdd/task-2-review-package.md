# Task 2 Review Package

## Commits
957bb62 feat: add parseResponse utility with shape validation

## Stat
2 files changed, 63 insertions(+)

## Diff

```diff
diff --git a/src/utils/parseResponse.js b/src/utils/parseResponse.js
new file mode 100644
--- /dev/null
+++ b/src/utils/parseResponse.js
@@ -0,0 +1,14 @@
+export function parseResponse(data) {
+  if (
+    !data ||
+    !Array.isArray(data.tokens) ||
+    !Array.isArray(data.vocabulary) ||
+    !Array.isArray(data.grammar)
+  ) {
+    throw new Error('Invalid response format')
+  }
+  for (const token of data.tokens) {
+    if (typeof token.text !== 'string') throw new Error('Invalid response format')
+  }
+  return { tokens: data.tokens, vocabulary: data.vocabulary, grammar: data.grammar }
+}

diff --git a/src/utils/parseResponse.test.js b/src/utils/parseResponse.test.js
new file mode 100644
--- /dev/null
+++ b/src/utils/parseResponse.test.js
@@ -0,0 +1,49 @@
+import { describe, it, expect } from 'vitest'
+import { parseResponse } from './parseResponse'
+
+const valid = {
+  tokens: [
+    { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
+    { text: 'を', reading: null, wordId: null, grammarId: null },
+    { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
+  ],
+  vocabulary: [
+    { id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] },
+  ],
+  grammar: [
+    { id: 'g1', pattern: '〜しています', explanation: 'đang làm gì đó', example: '勉強しています。→ Tôi đang học.' },
+  ],
+}
+
+describe('parseResponse', () => {
+  it('returns data unchanged when valid', () => {
+    const result = parseResponse(valid)
+    expect(result.tokens).toHaveLength(3)
+    expect(result.vocabulary).toHaveLength(1)
+    expect(result.grammar).toHaveLength(1)
+  })
+
+  it('throws when tokens is missing', () => {
+    expect(() => parseResponse({ ...valid, tokens: undefined })).toThrow('Invalid response format')
+  })
+
+  it('throws when vocabulary is missing', () => {
+    expect(() => parseResponse({ ...valid, vocabulary: undefined })).toThrow('Invalid response format')
+  })
+
+  it('throws when grammar is missing', () => {
+    expect(() => parseResponse({ ...valid, grammar: undefined })).toThrow('Invalid response format')
+  })
+
+  it('throws when tokens is not an array', () => {
+    expect(() => parseResponse({ ...valid, tokens: 'bad' })).toThrow('Invalid response format')
+  })
+
+  it('throws when a token is missing text', () => {
+    expect(() => parseResponse({ ...valid, tokens: [{ reading: null, wordId: null, grammarId: null }] })).toThrow('Invalid response format')
+  })
+
+  it('throws when called with null', () => {
+    expect(() => parseResponse(null)).toThrow('Invalid response format')
+  })
+})
```

## Implementer Report
See: .superpowers/sdd/task-2-report.md
