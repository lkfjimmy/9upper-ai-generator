import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 你嘅 OpenAI API Key
});

export default async function handler(req, res) {
  try {
    /** -----------------------
     *  Step 1: 從 Supabase 隨機抽卡
     * ---------------------- */
    const { data: allCards, error: fetchError } = await supabase.from('cards').select('*');
    if (fetchError) throw new Error(fetchError.message);

    if (!allCards || allCards.length === 0) {
      return res.status(404).json({ error: 'No cards found in Supabase.' });
    }

    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];

    /** -----------------------
     *  Step 2: 用 OpenAI 生成多張新卡
     * ---------------------- */
    const prompt = `
Generate 3 unique card entries for a game called 9upper.
Each card should include:
- term: a rare or obscure word/concept (from internet slang, subculture, history, or literature)
- hints: three hints (two false, one true)
- explanation: detailed description of the term.

Return as a JSON array, like:
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
      console.error("Failed to parse AI response:", aiResponse.choices[0].message.content);
      throw new Error("AI response is not valid JSON.");
    }

    /** -----------------------
     *  Step 3: 插入新卡到 Supabase
     * ---------------------- */
    const { error: insertError } = await supabase.from('cards').insert(newCards);
    if (insertError) {
      console.error("Insert error:", insertError);
    }

    /** -----------------------
     *  Step 4: 回傳抽取的卡
     * ---------------------- */
    return res.status(200).json({
      randomCard,
      newCardsAdded: newCards.length,
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
