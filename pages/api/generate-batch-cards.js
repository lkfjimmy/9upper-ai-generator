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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, only POST." });
  }

  try {
    const { count = 5 } = req.body; // 一次生成的卡牌數量，默認 5

    // Prompt
    const prompt = `
你是一個專門為社交推理遊戲「9upper」生成卡牌的設計專家。

請生成 ${count} 張全新卡牌，每張卡牌需以純 JSON 陣列輸出，不能包含任何多餘的文字或註解。

JSON 結構：
[
  {
    "term": "詞語，冷門專有名詞，來源於網絡、次文化、歷史、文學、天文或其他冷門科學，日常生活中不會見到",
    "hints": [
      "提示1：單一名詞，可能正確，也可能完全無關",
      "提示2：單一名詞，可能正確，也可能完全無關",
      "提示3：單一名詞，可能正確，也可能完全無關"
    ],
    "explanation": "簡短解釋，清楚描述詞語真正的來源和含義，方便主持人理解，但不直接暴露答案。"
  }
]

### 規則：
1. 詞語 (term) 必須非常冷門，不出現在日常生活中。
2. 三個提示為單一名詞，其中只有一個正確且與詞語真實相關，另外兩個必須完全無關。
3. 僅能輸出 JSON，不能有額外說明或符號。
`;

    // 呼叫 OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是9upper卡牌生成專家。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    });

    // 嘗試解析 AI 輸出
    let generatedCards;
    try {
      generatedCards = JSON.parse(aiResponse.choices[0].message.content.trim());
    } catch (err) {
      console.error("JSON Parse Error:", aiResponse.choices[0].message.content);
      return res.status(500).json({ error: "Failed to parse AI output as JSON." });
    }

    // 插入 Supabase
    const { error } = await supabase.from("cards").insert(
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
