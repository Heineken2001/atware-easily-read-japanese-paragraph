import { useState, useRef, useEffect, useCallback } from "react";
import { useAnalyze } from "./hooks/useAnalyze";
import { useOcr } from "./hooks/useOcr";
import FuriganaText from "./components/FuriganaText";
import WordPopup from "./components/WordPopup";
import VocabPanel from "./components/VocabPanel";
import GrammarPanel from "./components/GrammarPanel";

function errorMessage(error) {
  if (error === "TEXT_TOO_LONG")
    return "The paragraph is too long. Please try a shorter one.";
  return `Something went wrong: ${error}. Please try again.`;
}

function StatPill({ label, value, tone }) {
  const tones = {
    blue: "bg-[rgba(44,75,108,0.12)] text-[#26435f]",
    amber: "bg-[rgba(177,61,35,0.12)] text-[#8f2d1d]",
    slate: "bg-[rgba(98,74,53,0.12)] text-[#5b4936]",
  };

  return (
    <div className="rounded-full border border-[#d9ccb8] bg-[rgba(255,252,246,0.94)] px-4 py-2 shadow-[0_10px_24px_rgba(84,58,37,0.08)] backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8c7761]">
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
      <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9a4a3a]">
        {eyebrow}
      </div>
      <h2 className="font-serif-jp text-2xl font-semibold text-[#2d241c]">
        {title}
      </h2>
      {description && (
        <p className="text-sm leading-6 text-[#6b5d4f]">{description}</p>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      aria-hidden="true"
      className="inline-flex items-center gap-2 rounded-full border border-[#e7c4ab] bg-[#fff5ed] px-3 py-1.5 text-[#9a4a3a]"
    >
      <span className="loading-pulse-ring" />
      <span className="loading-dots">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function ImageInput({ onImageSelected, loading, preview, error }) {
  const fileInputRef = useRef(null);

  useEffect(() => {
    function handleGlobalPaste(e) {
      const item = [...(e.clipboardData?.items ?? [])].find((i) =>
        i.type.startsWith("image/")
      );
      if (!item) return;
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onImageSelected(ev.target.result);
      reader.readAsDataURL(file);
    }
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [onImageSelected]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImageSelected(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="rounded-[28px] border border-[#ddd1bf] bg-[rgba(255,252,247,0.96)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
      <div className="min-h-36 rounded-[22px] border-2 border-dashed border-[#d9ccb8] flex flex-col items-center justify-center gap-3 p-6">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-32 rounded-lg object-contain shadow-sm"
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/70">
                <LoadingIndicator />
                <p className="text-xs text-[#6b5d4f]">Extracting text...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 text-[#c4b09a]"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-[#5f5144]">
                Paste a screenshot here
              </p>
              <p className="mt-1 text-xs text-[#9a8a7a]">
                Press Ctrl+V / Cmd+V anywhere on this page
              </p>
            </div>
          </>
        )}
        {error && (
          <p className="text-xs text-[#9d3524]">Failed to extract: {error}</p>
        )}
      </div>

      <button
        type="button"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d9ccb8] bg-[rgba(255,252,247,0.96)] px-4 py-2.5 text-sm text-[#5f5144] transition hover:border-[#b6402c] hover:text-[#9a4a3a]"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Choose from photo library
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </button>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState(
    () => localStorage.getItem("jer-text") ?? ""
  );
  const [activeTab, setActiveTab] = useState("vocab");
  const [activeWordId, setActiveWordId] = useState(null);
  const [activeGrammarId, setActiveGrammarId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [showFurigana, setShowFurigana] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const [imagePreview, setImagePreview] = useState(null);
  const { result, loading, error, analyze } = useAnalyze();

  useEffect(() => {
    try {
      localStorage.setItem("jer-text", text);
    } catch {}
  }, [text]);
  const { extractText, loading: ocrLoading, error: ocrError } = useOcr();

  function handleAnalyze() {
    if (!text.trim()) return;
    setPopup(null);
    setActiveWordId(null);
    setActiveGrammarId(null);
    analyze(text);
  }

  function handleWordClick(vocabEntry, position) {
    const popupWidth = 320;
    const margin = 8;
    const x = Math.max(
      margin,
      Math.min(position.x, window.innerWidth - popupWidth - margin)
    );
    setActiveWordId(vocabEntry.id);
    setActiveTab("vocab");
    setPopup({ word: vocabEntry, position: { x, y: position.y } });
  }

  function handleGrammarClick(grammarId) {
    setActiveGrammarId(grammarId);
    setActiveTab("grammar");
    setPopup(null);
  }

  const handleImageSelected = useCallback(
    async (dataUrl) => {
      setImagePreview(dataUrl);
      const extracted = await extractText(dataUrl);
      if (extracted) {
        setText(extracted);
        setInputMode("text");
        setImagePreview(null);
      }
    },
    [extractText]
  );

  return (
    <div className="japanese-paper min-h-screen" onClick={() => setPopup(null)}>
      {popup && (
        <WordPopup
          word={popup.word}
          position={popup.position}
          onClose={() => setPopup(null)}
        />
      )}

      <header className="border-b border-[#d9ccb8] bg-[rgba(255,249,240,0.88)] px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#9a4a3a]">
              やさしい読解
            </div>
            <h1 className="font-serif-jp mt-2 text-3xl font-semibold tracking-[0.04em] text-[#2d241c]">
              Japanese Easy Read
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6b5d4f]">
              Furigana, translation, and grammar notes in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill
              label="Vocabulary"
              value={result?.vocabulary.length ?? 0}
              tone="blue"
            />
            <StatPill
              label="Grammar"
              value={result?.grammar.length ?? 0}
              tone="amber"
            />
            <StatPill
              label="Characters"
              value={text.trim().length}
              tone="slate"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 space-y-6 lg:p-8">
        <section className="japanese-panel overflow-hidden rounded-[32px]">
          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:px-7 lg:py-6">
            <div className="space-y-4">
              <SectionTitle
                eyebrow="Input"
                title="Paste Japanese text to analyze"
                description="The app adds furigana, a full translation, and separate vocabulary and grammar breakdowns for faster reading."
              />

              <div className="flex rounded-full border border-[#e2d5c3] bg-[rgba(244,237,226,0.9)] p-1">
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${inputMode === "text" ? "bg-[rgba(255,252,247,0.98)] text-[#26435f] shadow-sm" : "text-[#7d6d5a] hover:text-[#2d241c]"}`}
                  onClick={() => setInputMode("text")}
                >
                  Text
                </button>
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${inputMode === "image" ? "bg-[rgba(255,252,247,0.98)] text-[#26435f] shadow-sm" : "text-[#7d6d5a] hover:text-[#2d241c]"}`}
                  onClick={() => setInputMode("image")}
                >
                  Image
                </button>
              </div>

              {inputMode === "text" ? (
                <div className="rounded-[28px] border border-[#ddd1bf] bg-[rgba(255,252,247,0.96)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <textarea
                    className="min-h-36 w-full resize-none rounded-[22px] border border-[#d9ccb8] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(251,245,236,0.96))] px-4 py-4 text-lg leading-8 text-[#2f261f] outline-none transition focus:border-[#b6402c] focus:ring-4 focus:ring-[rgba(182,64,44,0.12)]"
                    rows={4}
                    placeholder="Paste a Japanese paragraph..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              ) : (
                <ImageInput
                  onImageSelected={handleImageSelected}
                  loading={ocrLoading}
                  preview={imagePreview}
                  error={ocrError}
                />
              )}
            </div>

            <div className="flex flex-col justify-end px-2 py-2 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3">
                {loading && <LoadingIndicator />}
                <p className="text-sm leading-6 text-[#5f5144]">
                  {loading
                    ? "Analyzing the text and preparing the translation..."
                    : "Paste your text, then click Analyze to see reading help, translation, and detailed notes."}
                </p>
              </div>
              <button
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#b6402c] px-6 py-3 text-sm font-semibold text-[#fff7ef] shadow-[0_14px_30px_rgba(182,64,44,0.28)] transition hover:bg-[#9d3524] disabled:cursor-not-allowed disabled:bg-[#d6c8b8] disabled:text-[#8b7a67] disabled:shadow-none"
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="loading-button-shimmer" />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[28px] border border-[#e6b2a6] bg-[#fff1ec] p-4 text-[#9d3524] shadow-[0_12px_28px_rgba(157,53,36,0.08)]">
            {errorMessage(error)}
          </div>
        )}

        {result && (
          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div
                className="japanese-panel relative overflow-hidden rounded-[32px] p-6"
                onClick={() => setPopup(null)}
              >
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,_rgba(182,64,44,0.12),_rgba(44,75,108,0.08)_58%,_transparent)]" />
                <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-[#e6d7c3] bg-[radial-gradient(circle,_rgba(182,64,44,0.08),_transparent_68%)]" />
                <div className="relative space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <SectionTitle
                      eyebrow="Reading"
                      title="Annotated paragraph"
                      description="Click a word for quick meaning lookup, or click underlined grammar to view the detailed note."
                    />

                    <button
                      type="button"
                      aria-pressed={showFurigana}
                      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${showFurigana ? "border-[#b0c0ce] bg-[rgba(44,75,108,0.1)] text-[#26435f]" : "border-[#d8ccb9] bg-[rgba(255,252,247,0.92)] text-[#5f5144] hover:border-[#bfaa90] hover:text-[#2d241c]"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFurigana((current) => !current);
                      }}
                    >
                      {showFurigana ? "Hide furigana" : "Show furigana"}
                    </button>
                  </div>

                  <div className="reading-frame rounded-[28px] p-5">
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
              </div>

              <div className="japanese-panel rounded-[32px] p-6">
                <SectionTitle
                  eyebrow="Translation"
                  title="Full paragraph translation"
                  description="A natural Vietnamese rendering so you can grasp the overall meaning before diving deeper."
                />
                <div className="mt-5 rounded-[26px] border border-[#e6d7c3] bg-[linear-gradient(180deg,_rgba(255,250,243,0.98),_rgba(255,255,255,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <p className="font-serif-jp text-[1.02rem] leading-8 text-[#3a3027]">
                    {result.translation}
                  </p>
                </div>
              </div>
            </div>

            <div className="japanese-panel overflow-hidden rounded-[32px]">
              <div className="border-b border-[#e6d7c3] px-6 pt-6">
                <SectionTitle
                  eyebrow="Details"
                  title="Vocabulary and grammar"
                  description="The lists stay synced with the reading view so you can move back and forth quickly."
                />
                <div className="mt-5 flex rounded-full border border-[#e2d5c3] bg-[rgba(244,237,226,0.9)] p-1.5">
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${activeTab === "vocab" ? "bg-[rgba(255,252,247,0.98)] text-[#26435f] shadow-sm" : "text-[#7d6d5a] hover:text-[#2d241c]"}`}
                    onClick={() => setActiveTab("vocab")}
                  >
                    Vocabulary
                  </button>
                  <button
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${activeTab === "grammar" ? "bg-[rgba(255,252,247,0.98)] text-[#9a4a3a] shadow-sm" : "text-[#7d6d5a] hover:text-[#2d241c]"}`}
                    onClick={() => setActiveTab("grammar")}
                  >
                    Grammar
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
