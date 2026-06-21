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
    expect(screen.getByPlaceholderText(/nhập đoạn văn/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /phân tích/i }),
    ).toBeInTheDocument();
  });

  it("shows Đang phân tích... while loading", async () => {
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
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    expect(screen.getByText("Đang phân tích...")).toBeInTheDocument();
    await act(async () => {
      resolveReq();
    });
  });

  it("renders furigana text after successful analysis", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    await waitFor(() =>
      expect(document.querySelector("rt")?.textContent).toBe("にほんご"),
    );
  });

  it("shows Có lỗi xảy ra on generic failure", async () => {
    mockCreate.mockRejectedValue(new Error("network failure"));
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    await waitFor(() =>
      expect(screen.getByText(/có lỗi xảy ra/i)).toBeInTheDocument(),
    );
  });

  it("shows text too long message on 413", async () => {
    const err = new Error("context_length_exceeded");
    err.code = "context_length_exceeded";
    mockCreate.mockRejectedValue(err);
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    await waitFor(() =>
      expect(screen.getByText(/quá dài/i)).toBeInTheDocument(),
    );
  });

  it("displays vocabulary in Từ vựng tab by default after analysis", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    await waitFor(() => screen.getByText("tiếng Nhật"));
    expect(screen.getByText("tiếng Nhật")).toBeInTheDocument();
  });

  it("switches to Ngữ pháp tab when grammar token is clicked", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/nhập đoạn văn/i), {
      target: { value: "日本語" },
    });
    fireEvent.click(screen.getByRole("button", { name: /phân tích/i }));
    await waitFor(() => screen.getByText("しています"));
    fireEvent.click(screen.getByText("しています"));
    expect(screen.getByText("〜しています")).toBeInTheDocument();
  });
});
