import { useState } from "react";
import { useAnalyze } from "./hooks/useAnalyze";
import FuriganaText from "./components/FuriganaText";
import WordPopup from "./components/WordPopup";
import VocabPanel from "./components/VocabPanel";
import GrammarPanel from "./components/GrammarPanel";

function errorMessage(error) {
  if (error === "TEXT_TOO_LONG")
    return "Đoạn văn quá dài, vui lòng thử đoạn ngắn hơn.";
  return `Có lỗi xảy ra: ${error}. Vui lòng thử lại.`;
}

function StatPill({ label, value, tone }) {
  const tones = {
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${tones[tone]}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("vocab");
  const [activeWordId, setActiveWordId] = useState(null);
  const [activeGrammarId, setActiveGrammarId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [showFurigana, setShowFurigana] = useState(false);
  const { result, loading, error, analyze } = useAnalyze();

  function handleAnalyze() {
    if (!text.trim()) return;
    setPopup(null);
    setActiveWordId(null);
    setActiveGrammarId(null);
    analyze(text);
  }

  function handleWordClick(vocabEntry, position) {
    setActiveWordId(vocabEntry.id);
    setActiveTab("vocab");
    setPopup({ word: vocabEntry, position });
  }

  function handleGrammarClick(grammarId) {
    setActiveGrammarId(grammarId);
    setActiveTab("grammar");
    setPopup(null);
  }

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_transparent_32%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_58%,_#eef2ff_100%)]"
      onClick={() => setPopup(null)}
    >
      <header className="border-b border-white/70 bg-white/70 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600">
              Cong cu ho tro doc hieu
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Japanese Easy Read
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Furigana, dịch nghĩa và giải thích ngữ pháp trên cùng một màn hình.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill label="Từ vựng" value={result?.vocabulary.length ?? 0} tone="blue" />
            <StatPill label="Ngữ pháp" value={result?.grammar.length ?? 0} tone="amber" />
            <StatPill label="Ký tự" value={text.trim().length} tone="slate" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 space-y-6 lg:p-8">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-7 lg:py-6">
            <div className="space-y-4">
              <SectionTitle
                eyebrow="Nhập đoạn văn"
                title="Dán đoạn tiếng Nhật cần phân tích"
                description="Ứng dụng sẽ thêm furigana, dịch nghĩa toàn đoạn và tách phần từ vựng, ngữ pháp để bạn đọc nhanh hơn."
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3 shadow-inner shadow-white/80">
                <textarea
                  className="min-h-36 w-full resize-none rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-lg leading-8 text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  rows={4}
                  placeholder="Nhập đoạn văn tiếng Nhật..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl bg-slate-900 px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:px-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/90">
                  Gợi ý dùng tốt
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>Đoạn từ 1 đến 4 câu sẽ cho kết quả rõ ràng và dễ học nhất.</li>
                  <li>Nhấn vào từ trong phần đọc để mở nghĩa và ví dụ thực tế.</li>
                  <li>Nhấn vào phần gạch chân để chuyển nhanh sang mục ngữ pháp liên quan.</li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-sm text-slate-300">
                  {loading
                    ? "Đang phân tích câu và tạo bản dịch..."
                    : "Sẵn sàng phân tích đoạn văn của bạn."}
                </p>
                <button
                  className="inline-flex min-w-32 items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 disabled:shadow-none"
                  onClick={handleAnalyze}
                  disabled={loading || !text.trim()}
                >
                  {loading ? "Đang phân tích..." : "Phân tích"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-sm">
            {errorMessage(error)}
          </div>
        )}

        {result && (
          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div
                className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,_rgba(251,191,36,0.14),_rgba(14,165,233,0.08)_60%,_transparent)]" />
                <div className="relative space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <SectionTitle
                      eyebrow="Đọc"
                      title="Đoạn văn phân tích"
                      description="Bấm vào từ để xem nghĩa nhanh, hoặc bấm vào phần ngữ pháp được gạch chân để xem giải thích chi tiết."
                    />

                    <button
                      type="button"
                      aria-pressed={showFurigana}
                      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${showFurigana ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
                      onClick={() => setShowFurigana((current) => !current)}
                    >
                      {showFurigana ? "Ẩn furigana" : "Hiện furigana"}
                    </button>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
                    <FuriganaText
                      tokens={result.tokens}
                      vocabulary={result.vocabulary}
                      grammar={result.grammar}
                      onWordClick={handleWordClick}
                      onGrammarClick={handleGrammarClick}
                      showFurigana={showFurigana}
                    />
                  </div>
                </div>
                {popup && (
                  <WordPopup
                    word={popup.word}
                    position={popup.position}
                    onClose={() => setPopup(null)}
                  />
                )}
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <SectionTitle
                  eyebrow="Dịch nghĩa"
                  title="Bản dịch toàn đoạn"
                  description="Diễn đạt tự nhiên bằng tiếng Việt để bạn nắm ý chính trước khi học sâu hơn."
                />
                <div className="mt-5 rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-5">
                  <p className="text-base leading-8 text-slate-700">
                    {result.translation}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 px-6 pt-6">
                <SectionTitle
                  eyebrow="Phân tích chi tiết"
                  title="Từ vựng và ngữ pháp"
                  description="Danh sách được đồng bộ với phần đọc để bạn chuyển qua lại nhanh hơn."
                />
                <div className="mt-5 flex rounded-full bg-slate-100 p-1.5">
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${activeTab === "vocab" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    onClick={() => setActiveTab("vocab")}
                  >
                    Từ vựng
                  </button>
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${activeTab === "grammar" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    onClick={() => setActiveTab("grammar")}
                  >
                    Ngữ pháp
                  </button>
                </div>
              </div>
              <div className="max-h-[42rem] overflow-y-auto px-3 py-3">
                {activeTab === "vocab" ? (
                  <VocabPanel
                    vocabulary={result.vocabulary}
                    activeWordId={activeWordId}
                  />
                ) : (
                  <GrammarPanel
                    grammar={result.grammar}
                    activeGrammarId={activeGrammarId}
                  />
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
