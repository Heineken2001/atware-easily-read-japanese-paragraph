import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import OpenAI from 'openai'

let cachedApiKey = null

async function getApiKey() {
  if (cachedApiKey) return cachedApiKey
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION })
  const cmd = new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
  const resp = await client.send(cmd)
  cachedApiKey = resp.SecretString
  return cachedApiKey
}

const SYSTEM_PROMPT = `You are a Japanese language teacher. Given a Japanese paragraph, analyze it and return ONLY a JSON object with this exact structure:

{
  "tokens": [{ "text": "string", "reading": "hiragana or null", "wordId": "wN or null", "grammarId": "gN or null" }],
  "vocabulary": [{ "id": "wN", "word": "string", "reading": "hiragana", "meaning": "Vietnamese meaning", "examples": ["Japanese → Vietnamese", "Japanese → Vietnamese"] }],
  "grammar": [{ "id": "gN", "pattern": "〜pattern", "explanation": "Vietnamese explanation", "example": "Japanese → Vietnamese" }]
}

Rules:
- "reading": provide hiragana only for tokens containing kanji; null for pure hiragana/katakana/punctuation
- "wordId": assign to meaningful vocabulary (nouns, verbs, adjectives, adverbs); null for particles/punctuation
- "grammarId": assign to tokens forming a grammar pattern (〜ています, 〜ので, 〜たい, etc.); null otherwise
- A token may have both wordId and grammarId
- All meanings and explanations must be in Vietnamese
- Exactly 2 example sentences per vocabulary entry
- Return ONLY the JSON object, no markdown, no extra text`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body || {}
  if (!text) {
    return res.status(400).json({ error: 'Missing text' })
  }

  try {
    const apiKey = await getApiKey()
    const openai = new OpenAI({ apiKey, baseURL: 'https://proxy.heyalice.net/v1' })

    const completion = await openai.chat.completions.create({
      model: 'chatgpt-5.4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(completion.choices[0].message.content)
    return res.status(200).json(parsed)
  } catch (e) {
    if (e.code === 'context_length_exceeded') {
      return res.status(413).json({ error: 'TEXT_TOO_LONG' })
    }
    console.error('api/chat error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
