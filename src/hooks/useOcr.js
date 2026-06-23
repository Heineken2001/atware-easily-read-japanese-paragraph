import { useState, useCallback } from "react";
import OpenAI from "openai";

function createClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("MISSING_API_KEY");
  return new OpenAI({
    apiKey,
    baseURL: "https://proxy.heyalice.net/v1",
    dangerouslyAllowBrowser: true,
  });
}

export function useOcr() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractText = useCallback(async (imageDataUrl) => {
    setLoading(true);
    setError(null);
    try {
      const openai = createClient();
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-5.4",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all Japanese text from this image. Return only the Japanese text as-is, preserving line breaks. Do not add any explanation or translation.",
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
      });
      return completion.choices?.[0]?.message?.content?.trim() ?? "";
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { extractText, loading, error };
}
