export default function WordPopup({ word, position, onClose }) {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xl font-bold">{word.word}</span>
          <span className="text-sm text-gray-500 ml-2">{word.reading}</span>
        </div>
        <button
          aria-label="Đóng"
          className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="text-blue-700 font-medium mb-3">{word.meaning}</p>
      <div className="space-y-2">
        {word.examples.map((ex, i) => (
          <p key={i} className="text-sm text-gray-600">{ex}</p>
        ))}
      </div>
    </div>
  )
}
