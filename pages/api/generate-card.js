import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 或者 gpt-4o, gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content: `你係一個專門為9upper卡牌遊戲設計冷門詞語卡嘅AI，每次生成：
- 一個冷門詞語（可以係網絡術語、次文化、歷史、文學等）
- 三個提示（只有一個與該詞語有關）
- 詞語解釋

輸出 JSON 格式如下：
{
  "term": "詞語",
  "hints": ["提示A", "提示B", "提示C"],
  "explanation": "詞語詳細解釋"
}`
        },
        {
          role: "user",
          content: "請幫我生成一張卡牌。"
        }
      ],
      temperature: 0.8,
    });

    const text = completion.choices[0].message.content.trim();

    // 嘗試轉成 JSON
    const data = JSON.parse(text);
    res.status(200).json(data);

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Failed to generate card" });
  }
}
