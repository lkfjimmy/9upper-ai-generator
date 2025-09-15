import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 初始化 Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API Route
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, only POST." });
  }

  try {
    const { count = 5 } = req.body; // 一次生成幾張卡，預設 5 張

    // ===== Prompt：生成 9upper 專用卡牌 =====
    const prompt = `
你是一個為社交推理遊戲「9upper」生成卡牌的專家。
請生成 ${count} 張全新卡牌，內容需冷門且有趣，不能太容易猜中。
每張卡包含以下欄位，並以 JSON 陣列輸出，不包含其他文字：

[
  {
    "term": "核心詞語，簡短，盡量冷門",
    "hints": [
      "提示 1，由淺入深",
      "提示 2",
      "提示 3"
    ],
    "explanation": "詞語的簡短解釋，讓主持人理解但不會直接暴雷。"
  }
]

生成規則：
1. 提示從模糊到明確，逐步縮小範圍。
2. 詞語要有文化或知識深度，不限於熱門名詞。
3. 不能包含色情、仇恨、政治敏感或違法內容。
4. JSON 必須完全正確，不可包含任何多餘文字或註解。
`;

    // 呼叫 OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是9upper卡牌生成專家，負責提供高品質詞語與提示。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    });

    // 嘗試解析 AI 回傳的 JSON
    let generatedCards;
    try {
      generatedCards = JSON.parse(aiResponse.choices[0].message.content.trim());
    } catch (err) {
      console.error("JSON Parse Error:", aiResponse.choices[0].message.content);
      return res.status(500).json({ error: "Failed to parse AI output as JSON." });
    }

    // 將生成的卡牌插入 Supabase
    const { data, error } = await supabase.from("cards").insert(
      generatedCards.map((card) => ({
        term: card.term,
        hints: card.hints,
        explanation: card.explanation,
      }))
    );

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to insert into Supabase." });
    }

    return res.status(200).json({
      message: `成功生成 ${generatedCards.length} 張卡牌並存入資料庫`,
      cards: generatedCards,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
}
