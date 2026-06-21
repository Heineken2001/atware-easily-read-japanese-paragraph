export function parseResponse(data) {
  if (
    !data ||
    !Array.isArray(data.tokens) ||
    !Array.isArray(data.vocabulary) ||
    !Array.isArray(data.grammar)
  ) {
    throw new Error('Invalid response format')
  }
  for (const token of data.tokens) {
    if (typeof token.text !== 'string') throw new Error('Invalid response format')
  }
  return { tokens: data.tokens, vocabulary: data.vocabulary, grammar: data.grammar }
}
