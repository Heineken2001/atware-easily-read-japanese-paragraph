import { useState } from "react";
import OpenAI from "openai";
import { parseResponse } from "../utils/parseResponse";

const SYSTEM_PROMPT = `You are a Japanese language teacher. Given a Japanese paragraph, analyze it and return ONLY a JSON object with this exact structure:

{
  "translation": "Vietnamese translation of the full paragraph",
  "tokens": [{ "text": "string", "reading": "hiragana or null", "wordId": "wN or null", "grammarId": "gN or null" }],
  "vocabulary": [{ "id": "wN", "word": "string", "reading": "hiragana", "meaning": "Vietnamese meaning", "examples": ["Japanese → Vietnamese", "Japanese → Vietnamese"] }],
  "grammar": [{ "id": "gN", "pattern": "〜pattern", "explanation": "Vietnamese explanation", "example": "Japanese → Vietnamese" }]
}

Rules:
- "translation": write one natural Vietnamese translation for the entire paragraph
- "reading": provide hiragana only for tokens containing kanji; null for pure hiragana/katakana/punctuation
- "wordId": assign to meaningful vocabulary (nouns, verbs, adjectives, adverbs); null for particles/punctuation
- "grammarId": assign to tokens forming a grammar pattern (〜ています, 〜ので, 〜たい, etc.); null otherwise
- A token may have both wordId and grammarId
- All meanings and explanations must be in Vietnamese
- Exactly 2 example sentences per vocabulary entry
- Return ONLY the JSON object, no markdown, no extra text`;

function createClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("MISSING_API_KEY");

  return new OpenAI({
    apiKey,
    baseURL: "https://proxy.heyalice.net/v1",
    dangerouslyAllowBrowser: true,
  });
}

const STORAGE_KEY = "jer-result";

export function useAnalyze() {
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze(text) {
    setLoading(true);
    setError(null);
    try {
      const openai = createClient();
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-5.4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Invalid response format");
      }

      const data = JSON.parse(content);
      const parsed = parseResponse(data);
      setResult(parsed);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    } catch (e) {
      const isTooLong =
        e?.code === "context_length_exceeded" ||
        e?.message === "context_length_exceeded";
      setError(isTooLong ? "TEXT_TOO_LONG" : e.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, analyze };
}
