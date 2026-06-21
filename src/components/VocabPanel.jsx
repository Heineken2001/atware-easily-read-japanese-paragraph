export default function VocabPanel({ vocabulary, activeWordId }) {
  if (vocabulary.length === 0) {
    return <p className="text-gray-400 text-sm p-4">Chưa có từ vựng.</p>
  }
  return (
    <div className="divide-y divide-gray-100">
      {vocabulary.map(entry => (
        <div
          key={entry.id}
          data-word-id={entry.id}
          className={`p-3 ${activeWordId === entry.id ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-bold">{entry.word}</span>
            <span className="text-sm text-gray-500">{entry.reading}</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">{entry.meaning}</p>
          <div className="mt-2 space-y-1">
            {entry.examples.map((ex, i) => (
              <p key={i} className="text-xs text-gray-500">{ex}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
