// pages/api/generate-batch-cards.js
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 確保只有管理員才能使用（簡單密碼驗證）
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    /** -----------------------
     *  Step 1: 用 GPT 生成多張卡
     * ---------------------- */
    const prompt = `
Generate 5 unique and rare cards for a game called 9upper.
Each card must include:
- term: a rare or obscure word/concept (internet slang, subculture, history, literature, etc.)
- hints: three hints (two false, one true)
- explanation: a detailed explanation of the term.

Return ONLY valid JSON array in this format:
[
  {
    "term": "Example Term",
    "hints": ["Hint A", "Hint B", "Hint C"],
    "explanation": "This is the explanation."
  },
  ...
]
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let newCards = [];
    try {
      newCards = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseErr) {
      console.error("JSON Parse Error:", aiResponse.choices[0].message.content);
      return res.status(500).json({ error: "Failed to parse GPT response." });
    }

    /** -----------------------
     *  Step 2: 寫入 Supabase
     * ---------------------- */
    const { error: insertError } = await supabase.from('cards').insert(newCards);
    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({
      message: `Successfully added ${newCards.length} cards.`,
      cards: newCards,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
