import { useEffect, useRef } from 'react'

export default function GrammarPanel({ grammar, activeGrammarId }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current && typeof activeRef.current.scrollIntoView === 'function') {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeGrammarId])

  if (grammar.length === 0) {
    return <p className="text-gray-400 text-sm p-4">Chưa có ngữ pháp.</p>
  }
  return (
    <div className="divide-y divide-gray-100">
      {grammar.map(entry => (
        <div
          key={entry.id}
          data-grammar-id={entry.id}
          ref={activeGrammarId === entry.id ? activeRef : null}
          className={`p-3 ${activeGrammarId === entry.id ? 'bg-orange-50' : ''}`}
        >
          <p className="font-bold text-orange-700">{entry.pattern}</p>
          <p className="text-sm text-gray-700 mt-1">{entry.explanation}</p>
          <p className="text-xs text-gray-500 mt-1">{entry.example}</p>
        </div>
      ))}
    </div>
  )
}
