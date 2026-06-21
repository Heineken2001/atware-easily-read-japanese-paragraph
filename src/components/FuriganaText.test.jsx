import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FuriganaText from "./FuriganaText";

const tokens = [
  { text: "日本語", reading: "にほんご", wordId: "w1", grammarId: null },
  { text: "を", reading: null, wordId: null, grammarId: null },
  { text: "しています", reading: null, wordId: null, grammarId: "g1" },
];
const vocabulary = [
  {
    id: "w1",
    word: "日本語",
    reading: "にほんご",
    meaning: "tiếng Nhật",
    examples: [],
  },
];
const grammar = [
  { id: "g1", pattern: "〜しています", explanation: "đang làm", example: "" },
];

describe("FuriganaText", () => {
  it("renders all token texts", () => {
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={() => {}}
      />,
    );
    expect(screen.getByText("日本語")).toBeInTheDocument();
    expect(screen.getByText("を")).toBeInTheDocument();
    expect(screen.getByText("しています")).toBeInTheDocument();
  });

  it("renders furigana reading in rt tag above kanji token", () => {
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={() => {}}
        showFurigana
      />,
    );
    expect(screen.getByText("にほんご")).toBeInTheDocument();
    expect(document.querySelector("rt").textContent).toBe("にほんご");
  });

  it("only renders rt tags for tokens with reading", () => {
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={() => {}}
        showFurigana
      />,
    );
    expect(document.querySelectorAll("rt")).toHaveLength(1);
  });

  it("hides furigana by default", () => {
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={() => {}}
      />,
    );
    expect(screen.queryByText("にほんご")).not.toBeInTheDocument();
    expect(document.querySelectorAll("rt")).toHaveLength(0);
  });

  it("calls onWordClick with vocab entry and position when word token clicked", () => {
    const onWordClick = vi.fn();
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={onWordClick}
        onGrammarClick={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("日本語"));
    expect(onWordClick).toHaveBeenCalledWith(
      vocabulary[0],
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );
  });

  it("calls onGrammarClick with grammarId when grammar token clicked", () => {
    const onGrammarClick = vi.fn();
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={onGrammarClick}
      />,
    );
    fireEvent.click(screen.getByText("しています"));
    expect(onGrammarClick).toHaveBeenCalledWith("g1");
  });

  it("does not call onGrammarClick when clicking a plain token", () => {
    const onGrammarClick = vi.fn();
    render(
      <FuriganaText
        tokens={tokens}
        vocabulary={vocabulary}
        grammar={grammar}
        onWordClick={() => {}}
        onGrammarClick={onGrammarClick}
      />,
    );
    fireEvent.click(screen.getByText("を"));
    expect(onGrammarClick).not.toHaveBeenCalled();
  });
});
