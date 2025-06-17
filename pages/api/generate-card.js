export default async function handler(req, res) {
  const prompt = `
請為一款叫9upper嘅社交遊戲生成一張詞語卡。
要求：
- 詞語來自冷門歷史、文學、網絡次文化等
- 列出3個提示，只有1個係真實同該詞語有關
- 提供該詞語詳細解釋

請用 JSON 格式回覆：
{
  "term": "...",
  "hints": ["...", "...", "..."],
  "explanation": "..."
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  res.status(200).json(JSON.parse(text));
}
