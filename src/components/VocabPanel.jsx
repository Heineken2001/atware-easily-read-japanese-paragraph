export default function VocabPanel({ vocabulary, activeWordId }) {
  if (vocabulary.length === 0) {
    return <p className="p-4 text-sm text-[#8c7761]">Chưa có từ vựng.</p>
  }
  return (
    <div className="divide-y divide-[#ede3d5]">
      {vocabulary.map(entry => (
        <div
          key={entry.id}
          data-word-id={entry.id}
          className={`rounded-[22px] p-4 transition ${activeWordId === entry.id ? 'bg-blue-50 shadow-[0_8px_24px_rgba(38,67,95,0.08)]' : 'hover:bg-[rgba(250,246,239,0.86)]'}`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-serif-jp text-lg font-semibold text-[#2d241c]">{entry.word}</span>
            <span className="text-sm text-[#8c7761]">{entry.reading}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#26435f]">{entry.meaning}</p>
          <div className="mt-2 space-y-1">
            {entry.examples.map((ex, i) => (
              <p key={i} className="text-xs leading-5 text-[#6b5d4f]">{ex}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
