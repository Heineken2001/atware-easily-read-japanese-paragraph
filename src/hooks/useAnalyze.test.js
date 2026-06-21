import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalyze } from "./useAnalyze";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn(function () {
    return { chat: { completions: { create: mockCreate } } };
  }),
}));

const mockResult = {
  tokens: [
    { text: "日本語", reading: "にほんご", wordId: "w1", grammarId: null },
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
  grammar: [],
};

beforeEach(() => {
  vi.stubEnv("VITE_OPENAI_API_KEY", "test-api-key");
  mockCreate.mockReset();
});

describe("useAnalyze", () => {
  it("starts with null result, not loading, no error", () => {
    const { result } = renderHook(() => useAnalyze());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets result on success", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockResult),
          },
        },
      ],
    });
    const { result } = renderHook(() => useAnalyze());
    await act(() => result.current.analyze("日本語"));
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error TEXT_TOO_LONG when context length is exceeded", async () => {
    const err = new Error("context_length_exceeded");
    err.code = "context_length_exceeded";
    mockCreate.mockRejectedValue(err);
    const { result } = renderHook(() => useAnalyze());
    await act(() => result.current.analyze("very long text"));
    expect(result.current.error).toBe("TEXT_TOO_LONG");
    expect(result.current.result).toBeNull();
  });

  it("sets generic error on other failures", async () => {
    mockCreate.mockRejectedValue(new Error("network failure"));
    const { result } = renderHook(() => useAnalyze());
    await act(() => result.current.analyze("日本語"));
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).not.toBe("TEXT_TOO_LONG");
  });

  it("sets loading true while fetching", async () => {
    let resolveReq;
    mockCreate.mockImplementation(
      () =>
        new Promise((r) => {
          resolveReq = r;
        }),
    );
    const { result } = renderHook(() => useAnalyze());
    act(() => {
      result.current.analyze("日本語");
    });
    expect(result.current.loading).toBe(true);
    await act(async () => {
      resolveReq({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResult),
            },
          },
        ],
      });
    });
  });
});
