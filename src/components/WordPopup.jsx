import { useRef, useLayoutEffect, useState } from "react";

export default function WordPopup({ word, position, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: position.x, y: position.y + 8 });
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = position.x;
    let y = position.y + 8;

    if (x + width > vw - margin) x = vw - width - margin;
    if (x < margin) x = margin;
    if (y + height > vh - margin) y = position.y - height - 8;
    if (y < margin) y = margin;

    setPos({ x, y });
    setVisible(true);
  }, [position]);

  return (
    <div
      ref={ref}
      className="fixed z-50 w-80 rounded-[24px] border border-[#d9ccb8] bg-[linear-gradient(180deg,_rgba(255,253,248,0.98),_rgba(255,247,239,0.96))] p-4 shadow-[0_24px_50px_rgba(84,58,37,0.18)] backdrop-blur-sm transition-opacity duration-100"
      style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <span className="font-serif-jp text-2xl font-semibold text-[#2d241c]">
            {word.word}
          </span>
          <span className="ml-2 text-sm text-[#8c7761]">{word.reading}</span>
        </div>
        <button
          aria-label="Close"
          className="ml-2 text-xl leading-none text-[#8c7761] transition hover:text-[#9a4a3a]"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="mb-3 text-sm font-medium text-[#26435f]">{word.meaning}</p>
      <div className="space-y-2">
        {word.examples.map((ex, i) => (
          <p key={i} className="text-sm leading-6 text-[#5f5144]">
            {ex}
          </p>
        ))}
      </div>
    </div>
  );
}
