import { describe, it, expect } from 'vitest'
import { parseResponse } from './parseResponse'

const valid = {
  translation: 'Tôi đang học tiếng Nhật.',
  tokens: [
    { text: '日本語', reading: 'にほんご', wordId: 'w1', grammarId: null },
    { text: 'を', reading: null, wordId: null, grammarId: null },
    { text: 'しています', reading: null, wordId: null, grammarId: 'g1' },
  ],
  vocabulary: [
    { id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex → VN'] },
  ],
  grammar: [
    { id: 'g1', pattern: '〜しています', explanation: 'đang làm gì đó', example: '勉強しています。→ Tôi đang học.' },
  ],
}

describe('parseResponse', () => {
  it('returns data unchanged when valid', () => {
    const result = parseResponse(valid)
    expect(result.translation).toBe('Tôi đang học tiếng Nhật.')
    expect(result.tokens).toHaveLength(3)
    expect(result.vocabulary).toHaveLength(1)
    expect(result.grammar).toHaveLength(1)
  })

  it('throws when translation is missing', () => {
    expect(() => parseResponse({ ...valid, translation: undefined })).toThrow('Invalid response format')
  })

  it('throws when tokens is missing', () => {
    expect(() => parseResponse({ ...valid, tokens: undefined })).toThrow('Invalid response format')
  })

  it('throws when vocabulary is missing', () => {
    expect(() => parseResponse({ ...valid, vocabulary: undefined })).toThrow('Invalid response format')
  })

  it('throws when grammar is missing', () => {
    expect(() => parseResponse({ ...valid, grammar: undefined })).toThrow('Invalid response format')
  })

  it('throws when tokens is not an array', () => {
    expect(() => parseResponse({ ...valid, tokens: 'bad' })).toThrow('Invalid response format')
  })

  it('throws when a token is missing text', () => {
    expect(() => parseResponse({ ...valid, tokens: [{ reading: null, wordId: null, grammarId: null }] })).toThrow('Invalid response format')
  })

  it('throws when called with null', () => {
    expect(() => parseResponse(null)).toThrow('Invalid response format')
  })
})
