# Japanese Easy Read — Design Spec
Date: 2026-06-21

## Overview

A web app for Japanese learners that takes a pasted Japanese paragraph and renders:
1. Furigana (hiragana) above kanji using HTML ruby tags
2. Clickable words with Vietnamese meanings and real-life usage examples
3. Grammar patterns highlighted inline, with a full grammar breakdown panel

Target user: Vietnamese-speaking Japanese learner.
Deployment: Vercel (public, accessible to anyone).

---

## Architecture

```
[Browser — Vite + React SPA]
  └── POST /api/chat
        │
  [Vercel Serverless Function — api/chat.js]
        ├── AWS SDK → fetch API key from AWS Secrets Manager
        └── OpenAI SDK (baseURL: https://proxy.heyalice.net/v1, model: chatgpt-5.4)
              └── returns structured JSON
```

- The OpenAI API key is fetched server-side from AWS Secrets Manager on first request, then cached in the function instance's memory for subsequent warm requests.
- The frontend never receives or handles the API key.
- One GPT call per analysis returns all three features (furigana, vocabulary, grammar) as structured JSON.

---

## Project Structure

```
japanese-easy-read/
├── api/
│   └── chat.js                  ← Vercel serverless function
├── src/
│   ├── App.jsx                  ← main layout, state management
│   ├── components/
│   │   ├── FuriganaText.jsx     ← renders ruby tags, clickable word spans, grammar underlines
│   │   ├── WordPopup.jsx        ← popup with Vietnamese meaning + examples
│   │   ├── VocabPanel.jsx       ← side panel vocabulary list
│   │   └── GrammarPanel.jsx     ← side panel grammar breakdown
│   └── main.jsx
├── .env.local                   ← AWS credentials (never committed)
├── vercel.json
└── package.json
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🇯🇵 Japanese Easy Read                                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐            │
│  │  Paste Japanese text here...                │            │
│  └─────────────────────────────────────────────┘            │
│                                    [ Analyze ]              │
├───────────────────────────┬─────────────────────────────────┤
│  READING                  │  [ Vocabulary ] [ Grammar ]     │
│                           │  ─────────────────────────────  │
│   にほんご      べんきょう  │  日本語 (にほんご)               │
│  [日本語]を[勉強]して      │  tiếng Nhật                    │
│        います。            │  • Tôi học tiếng Nhật mỗi ngày │
│                           │  ─────────────────────────────  │
│  [〜しています] ←underline │  (switch to Grammar tab)        │
│                           │  〜しています                   │
│                           │  Diễn tả hành động đang xảy ra  │
└───────────────────────────┴─────────────────────────────────┘
```

**Interactions:**
- Clicking a word in the reading area opens a popup (WordPopup) showing Vietnamese meaning + 2 real-life example sentences.
- Grammar patterns are underlined in the reading area. Clicking one switches the side panel to the Grammar tab and highlights the relevant entry.
- The side panel has two tabs: Vocabulary and Grammar.

---

## Data Model

GPT returns a single structured JSON object:

```json
{
  "tokens": [
    { "text": "日本語", "reading": "にほんご", "wordId": "w1", "grammarId": null },
    { "text": "を", "reading": null, "wordId": null, "grammarId": null },
    { "text": "勉強", "reading": "べんきょう", "wordId": "w2", "grammarId": null },
    { "text": "しています", "reading": null, "wordId": null, "grammarId": "g1" },
    { "text": "。", "reading": null, "wordId": null, "grammarId": null }
  ],
  "vocabulary": [
    {
      "id": "w1",
      "word": "日本語",
      "reading": "にほんご",
      "meaning": "tiếng Nhật",
      "examples": [
        "日本語を毎日練習しています。→ Tôi luyện tập tiếng Nhật mỗi ngày.",
        "日本語は難しいけど面白い。→ Tiếng Nhật khó nhưng thú vị."
      ]
    }
  ],
  "grammar": [
    {
      "id": "g1",
      "pattern": "〜しています",
      "explanation": "Diễn tả hành động đang diễn ra ở hiện tại.",
      "example": "勉強しています。→ Tôi đang học bài."
    }
  ]
}
```

**Token linking:** Each token carries a `wordId` and `grammarId` that reference entries in the `vocabulary` and `grammar` arrays. This allows the reading area to know exactly which panel entry to activate on click — no fuzzy matching.

Tokens with `reading: null` render as plain text (no ruby tag). Tokens with `wordId: null` are not clickable for vocabulary. A token may have both `wordId` and `grammarId` (e.g. a verb that is part of a grammar pattern) — in that case clicking it opens the vocabulary popup, and the grammar underline is also visible; the user can switch to the Grammar tab manually to see the grammar entry.

---

## Vercel Serverless Function (`api/chat.js`)

Responsibilities:
1. Receive `{ text: string }` from the frontend via POST.
2. Fetch the OpenAI API key from AWS Secrets Manager (cached after first fetch).
3. Build a GPT prompt that instructs the model to return the structured JSON above.
4. Call the OpenAI-compatible proxy at `https://proxy.heyalice.net/v1` using model `chatgpt-5.4`.
5. Return the parsed JSON to the frontend.

AWS credentials for Secrets Manager are provided via Vercel environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SECRET_NAME`).

---

## Error Handling

| Scenario | Behavior |
|---|---|
| API call fails (network, proxy down) | Show Vietnamese error message + retry button |
| GPT returns malformed JSON | Re-prompt once; if still malformed, show error |
| Text too long for GPT context window | Show warning: "Đoạn văn quá dài, vui lòng thử đoạn ngắn hơn." |
| AWS Secrets Manager fetch fails | Return 500 with generic error; log server-side |

**Loading state:** Spinner overlaid on the reading area; side panel shows "Đang phân tích..." while waiting.

---

## Out of Scope

- User accounts or saved history
- Audio/pronunciation playback
- Support for languages other than Vietnamese
- Mobile-specific native app (responsive web only)
