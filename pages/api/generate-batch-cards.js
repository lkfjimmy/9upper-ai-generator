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
你是一個專門為社交推理遊戲「9upper」創作卡牌的生成器。

請生成 ${count} 張卡牌，每張卡牌包含以下元素：

1. 詞語 (term)：
   - 必須是冷門且大多數人不熟悉的詞語。
   - 詞語必須至少兩個中文字。
   - **四大主題比例均衡分佈**（每類約佔 25%）：
     a) 網絡迷因或次文化  
     b) 文學或歷史典故  
     c) 冷門天文、自然或科學名詞  
     d) 幻想作品或流行文化專有名詞（出自小說、動畫、遊戲或神話）
   - 絕對禁止日常生活常見詞彙，例如：貓、蘋果、火車、手機、電腦、咖啡等。
   - 不能是常見人名或地名，如：小明、東京、王力宏。

2. 提示 (hints)：
   - 提供三個簡短提示詞，每個提示為 1~3 個中文字或詞。
   - **只有其中一個提示詞與該詞語真正相關**，另外兩個完全無關。
   - 提示需模糊、含蓄，不會直接透露答案。

3. 解釋 (explanation)：
   - 以 1~2 句話描述該詞語的真實意思。
   - 包含詞語的來源、文化背景或使用場合，讓玩家閱讀後能獲得知識或趣味。

請將輸出格式化為 **純 JSON 陣列**，不包含多餘文字或註解，每張卡牌的格式如下：
{
  "term": "",
  "hints": ["", "", ""],
  "explanation": ""
}
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
