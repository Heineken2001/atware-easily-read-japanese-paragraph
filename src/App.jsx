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

export default function App() {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("vocab");
  const [activeWordId, setActiveWordId] = useState(null);
  const [activeGrammarId, setActiveGrammarId] = useState(null);
  const [popup, setPopup] = useState(null);
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
    <div className="min-h-screen bg-gray-50" onClick={() => setPopup(null)}>
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold">🇯🇵 Japanese Easy Read</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <textarea
            className="w-full border rounded p-3 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={4}
            placeholder="Nhập đoạn văn tiếng Nhật..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
            >
              {loading ? "Đang phân tích..." : "Phân tích"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {errorMessage(error)}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="bg-white rounded-lg border p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Đọc
              </h2>
              <FuriganaText
                tokens={result.tokens}
                vocabulary={result.vocabulary}
                grammar={result.grammar}
                onWordClick={handleWordClick}
                onGrammarClick={handleGrammarClick}
              />
              {popup && (
                <WordPopup
                  word={popup.word}
                  position={popup.position}
                  onClose={() => setPopup(null)}
                />
              )}
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === "vocab" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("vocab")}
                >
                  Từ vựng
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === "grammar" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("grammar")}
                >
                  Ngữ pháp
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
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
          </div>
        )}
      </main>
    </div>
  );
}
