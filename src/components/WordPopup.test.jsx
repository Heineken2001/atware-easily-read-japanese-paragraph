import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WordPopup from "./WordPopup";

const word = {
  word: "日本語",
  reading: "にほんご",
  meaning: "tiếng Nhật",
  examples: [
    "日本語を毎日練習しています。→ Tôi luyện tập tiếng Nhật mỗi ngày.",
    "日本語は難しいけど面白い。→ Tiếng Nhật khó nhưng thú vị.",
  ],
};

describe("WordPopup", () => {
  it("renders the word, reading, and Vietnamese meaning", () => {
    render(
      <WordPopup
        word={word}
        position={{ x: 100, y: 200 }}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("日本語")).toBeInTheDocument();
    expect(screen.getByText("にほんご")).toBeInTheDocument();
    expect(screen.getByText("tiếng Nhật")).toBeInTheDocument();
  });

  it("renders both example sentences", () => {
    render(
      <WordPopup word={word} position={{ x: 0, y: 0 }} onClose={() => {}} />,
    );
    expect(screen.getByText(word.examples[0])).toBeInTheDocument();
    expect(screen.getByText(word.examples[1])).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <WordPopup word={word} position={{ x: 0, y: 0 }} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("positions the popup using fixed coordinates from position prop", () => {
    const { container } = render(
      <WordPopup
        word={word}
        position={{ x: 150, y: 300 }}
        onClose={() => {}}
      />,
    );
    const popup = container.firstChild;
    expect(popup.style.left).toBe("150px");
    expect(popup.style.top).toBe("300px");
  });
});
