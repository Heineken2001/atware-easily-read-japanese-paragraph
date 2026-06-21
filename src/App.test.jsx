import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import App from "./App";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn(function () {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

const mockResult = {
  translation: "Tôi đang học tiếng Nhật.",
  tokens: [
    { text: "日本語", reading: "にほんご", wordId: "w1", grammarId: null },
    { text: "を", reading: null, wordId: null, grammarId: null },
    { text: "しています", reading: null, wordId: null, grammarId: "g1" },
  ],
  vocabulary: [
    {
      id: "w1",
      word: "日本語",
      reading: "にほんご",
      meaning: "tiếng Nhật",
      examples: ["Ex → VN"],
    },
  ],
  grammar: [
    {
      id: "g1",
      pattern: "〜しています",
      explanation: "đang làm",
      example: "Ex → VN",
    },
  ],
};

beforeEach(() => {
  vi.stubEnv("VITE_OPENAI_API_KEY", "test-api-key");
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify(mockResult),
        },
      },
    ],
  });
});

describe("App", () => {
  it("renders the textarea and Phân tích button", () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analyze/i }),
    ).toBeInTheDocument();
  });

  it("shows Analyzing... while loading", async () => {
    let resolveReq;
    mockCreate.mockImplementation(
      () =>
        new Promise((r) => {
          resolveReq = () =>
            r({
              choices: [
                {
                  message: {
                    content: JSON.stringify(mockResult),
                  },
                },
              ],
            });
        }),
    );
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    expect(screen.getByText("Analyzing...")).toBeInTheDocument();
    await act(async () => {
      resolveReq();
    });
  });

  it("keeps furigana hidden by default after successful analysis", async () => {
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() => expect(screen.getByText("日本語")).toBeInTheDocument());
    expect(document.querySelectorAll("rt")).toHaveLength(0);
  });

  it("shows furigana when the toggle is enabled", async () => {
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /show furigana/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /show furigana/i }));
    expect(document.querySelector("rt")?.textContent).toBe("にほんご");
  });

  it("shows a generic error on failure", async () => {
    mockCreate.mockRejectedValue(new Error("network failure"));
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    );
  });

  it("shows text too long message on 413", async () => {
    const err = new Error("context_length_exceeded");
    err.code = "context_length_exceeded";
    mockCreate.mockRejectedValue(err);
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() =>
      expect(screen.getByText(/too long/i)).toBeInTheDocument(),
    );
  });

  it("displays vocabulary in the Vocabulary tab by default after analysis", async () => {
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() => screen.getByText("tiếng Nhật"));
    expect(screen.getByText("tiếng Nhật")).toBeInTheDocument();
  });

  it("renders the paragraph translation after analysis", async () => {
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語をしています" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() =>
      expect(screen.getByText("Tôi đang học tiếng Nhật.")).toBeInTheDocument(),
    );
  });

  it("switches to the Grammar tab when a grammar token is clicked", async () => {
    render(<App />);
    fireEvent.change(
      screen.getByPlaceholderText(/paste a japanese paragraph/i),
      {
        target: { value: "日本語" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    await waitFor(() => screen.getByText("しています"));
    fireEvent.click(screen.getByText("しています"));
    expect(screen.getByText("〜しています")).toBeInTheDocument();
  });
});
