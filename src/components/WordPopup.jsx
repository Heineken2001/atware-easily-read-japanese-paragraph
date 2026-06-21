export default function WordPopup({ word, position, onClose }) {
  return (
    <div
      className="fixed z-50 w-80 rounded-[24px] border border-[#d9ccb8] bg-[linear-gradient(180deg,_rgba(255,253,248,0.98),_rgba(255,247,239,0.96))] p-4 shadow-[0_24px_50px_rgba(84,58,37,0.18)] backdrop-blur-sm"
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <span className="font-serif-jp text-2xl font-semibold text-[#2d241c]">{word.word}</span>
          <span className="ml-2 text-sm text-[#8c7761]">{word.reading}</span>
        </div>
        <button
          aria-label="Đóng"
          className="ml-2 text-xl leading-none text-[#8c7761] transition hover:text-[#9a4a3a]"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="mb-3 text-sm font-medium text-[#26435f]">{word.meaning}</p>
      <div className="space-y-2">
        {word.examples.map((ex, i) => (
          <p key={i} className="text-sm leading-6 text-[#5f5144]">{ex}</p>
        ))}
      </div>
    </div>
  )
}
