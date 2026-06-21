import { useState } from 'react'
import { parseResponse } from '../utils/parseResponse'

export function useAnalyze() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(text) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        if (res.status === 413) throw new Error('TEXT_TOO_LONG')
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setResult(parseResponse(data))
    } catch (e) {
      setError(e.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, analyze }
}
