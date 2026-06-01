import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  'gemini-3.5-flash'
];

/** Gọi Gemini, tự retry sang model nhẹ hơn khi bị 429 */
export const ask = async (prompt: string, modelIndex = 0): Promise<string> => {
  const model = MODELS[modelIndex] ?? MODELS[0];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text ?? '';
  } catch (err: any) {
    if ((err?.status === 429 || String(err?.message).includes('429')) && modelIndex < MODELS.length - 1) {
      console.warn(`[Gemini] ${model} rate limited, trying ${MODELS[modelIndex + 1]}...`);
      return ask(prompt, modelIndex + 1);
    }
    throw err;
  }
};

/** Parse JSON từ response Gemini (bỏ markdown code block nếu có) */
export const parseJSON = <T>(raw: string): T => {
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
};

export const hasApiKey = () => !!process.env.GEMINI_API_KEY;
