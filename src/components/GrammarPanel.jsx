import { useEffect, useRef } from 'react'

export default function GrammarPanel({ grammar, activeGrammarId }) {
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current && typeof activeRef.current.scrollIntoView === 'function') {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeGrammarId])

  if (grammar.length === 0) {
    return <p className="p-4 text-sm text-[#8c7761]">Chưa có ngữ pháp.</p>
  }
  return (
    <div className="divide-y divide-[#ede3d5]">
      {grammar.map(entry => (
        <div
          key={entry.id}
          data-grammar-id={entry.id}
          ref={activeGrammarId === entry.id ? activeRef : null}
          className={`rounded-[22px] p-4 transition ${activeGrammarId === entry.id ? 'bg-orange-50 shadow-[0_8px_24px_rgba(154,74,58,0.08)]' : 'hover:bg-[rgba(250,246,239,0.86)]'}`}
        >
          <p className="font-serif-jp text-lg font-semibold text-[#9a4a3a]">{entry.pattern}</p>
          <p className="mt-1 text-sm leading-6 text-[#3a3027]">{entry.explanation}</p>
          <p className="mt-1 text-xs leading-5 text-[#6b5d4f]">{entry.example}</p>
        </div>
      ))}
    </div>
  )
}
