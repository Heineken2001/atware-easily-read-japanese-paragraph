# Task 3 Report: Vercel Serverless Function

## Status: DONE

## Commits
- `bef9d55` — feat: add Vercel serverless function with AWS Secrets Manager and OpenAI proxy

## Tests
12/12 passing (5 new + 7 from Task 2)

## Files Created
- `/Users/trannhathuy/Documents/japanese-easy-read/api/chat.js` — Vercel serverless handler
- `/Users/trannhathuy/Documents/japanese-easy-read/api/chat.test.js` — Vitest test suite

## Implementation Notes
The implementation follows the spec exactly:
- AWS Secrets Manager client with module-level `cachedApiKey` for warm-Lambda reuse
- OpenAI-compatible client pointing to `https://proxy.heyalice.net/v1` with model `chatgpt-5.4`
- `response_format: { type: 'json_object' }` on every call
- Error handling: 400 (missing text), 405 (non-POST), 413 (context_length_exceeded), 500 (all others)

## Concern: Vitest 4.x Mock Compatibility Patch

The spec test code uses arrow functions as mock implementations for constructors:

```js
// Spec (verbatim) — does NOT work with Vitest 4.1.9
SecretsManagerClient: vi.fn(() => ({ send: ... }))
default: vi.fn(() => ({ chat: ... }))
```

Vitest 4.x calls `Reflect.construct(implementation, args, newTarget)` for `vi.fn()` mocks used with `new`. Arrow functions cannot be passed to `Reflect.construct` as the target — they throw `TypeError: X is not a constructor`.

**Fix applied**: Changed both mock implementations from arrow functions to regular functions. This is semantically identical (same return value, same test coverage) but compatible with Vitest 4.1.9:

```js
// Fixed — works with Vitest 4.1.9
SecretsManagerClient: vi.fn(function() { return { send: ... } })
default: vi.fn(function() { return { chat: ... } })
```

This change should be reflected in the spec for future tasks.
