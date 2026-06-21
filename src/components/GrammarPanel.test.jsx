import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GrammarPanel from "./GrammarPanel";

const grammar = [
  {
    id: "g1",
    pattern: "〜しています",
    explanation: "Diễn tả hành động đang xảy ra.",
    example: "勉強しています。→ Tôi đang học.",
  },
  {
    id: "g2",
    pattern: "〜ので",
    explanation: "Diễn tả nguyên nhân.",
    example: "雨なので → vì trời mưa",
  },
];

describe("GrammarPanel", () => {
  it("renders all grammar patterns", () => {
    render(<GrammarPanel grammar={grammar} activeGrammarId={null} />);
    expect(screen.getByText("〜しています")).toBeInTheDocument();
    expect(screen.getByText("〜ので")).toBeInTheDocument();
  });

  it("renders explanations and examples", () => {
    render(<GrammarPanel grammar={grammar} activeGrammarId={null} />);
    expect(
      screen.getByText("Diễn tả hành động đang xảy ra."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("勉強しています。→ Tôi đang học."),
    ).toBeInTheDocument();
  });

  it("applies bg-orange-50 class to the active entry", () => {
    const { container } = render(
      <GrammarPanel grammar={grammar} activeGrammarId="g1" />,
    );
    const entries = container.querySelectorAll("[data-grammar-id]");
    const active = [...entries].find((el) => el.dataset.grammarId === "g1");
    expect(active.className).toMatch(/bg-orange-50/);
  });

  it("does not apply bg-orange-50 to inactive entries", () => {
    const { container } = render(
      <GrammarPanel grammar={grammar} activeGrammarId="g1" />,
    );
    const entries = container.querySelectorAll("[data-grammar-id]");
    const inactive = [...entries].find((el) => el.dataset.grammarId === "g2");
    expect(inactive.className).not.toMatch(/bg-orange-50/);
  });

  it("shows empty state when grammar is empty", () => {
    render(<GrammarPanel grammar={[]} activeGrammarId={null} />);
    expect(screen.getByText("No grammar yet.")).toBeInTheDocument();
  });
});
