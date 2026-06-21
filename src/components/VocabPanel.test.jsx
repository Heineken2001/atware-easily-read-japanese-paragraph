import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VocabPanel from './VocabPanel'

const vocabulary = [
  { id: 'w1', word: '日本語', reading: 'にほんご', meaning: 'tiếng Nhật', examples: ['Ex1 → VN1'] },
  { id: 'w2', word: '勉強', reading: 'べんきょう', meaning: 'học tập', examples: ['Ex2 → VN2'] },
]

describe('VocabPanel', () => {
  it('renders all vocabulary entries', () => {
    render(<VocabPanel vocabulary={vocabulary} activeWordId={null} />)
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('勉強')).toBeInTheDocument()
  })

  it('renders meanings for all entries', () => {
    render(<VocabPanel vocabulary={vocabulary} activeWordId={null} />)
    expect(screen.getByText('tiếng Nhật')).toBeInTheDocument()
    expect(screen.getByText('học tập')).toBeInTheDocument()
  })

  it('applies bg-blue-50 class to the active entry', () => {
    const { container } = render(<VocabPanel vocabulary={vocabulary} activeWordId="w1" />)
    const entries = container.querySelectorAll('[data-word-id]')
    const active = [...entries].find(el => el.dataset.wordId === 'w1')
    expect(active.className).toMatch(/bg-blue-50/)
  })

  it('does not apply bg-blue-50 to inactive entries', () => {
    const { container } = render(<VocabPanel vocabulary={vocabulary} activeWordId="w1" />)
    const entries = container.querySelectorAll('[data-word-id]')
    const inactive = [...entries].find(el => el.dataset.wordId === 'w2')
    expect(inactive.className).not.toMatch(/bg-blue-50/)
  })

  it('shows empty state when vocabulary is empty', () => {
    render(<VocabPanel vocabulary={[]} activeWordId={null} />)
    expect(screen.getByText('Chưa có từ vựng.')).toBeInTheDocument()
  })
})
