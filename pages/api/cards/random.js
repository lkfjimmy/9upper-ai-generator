// pages/api/cards/random.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server side full access key
);

export default async function handler(req, res) {
  try {
    // 取得總筆數
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count === 0) {
      return res.status(404).json({ error: 'No cards found in database' });
    }

    // 隨機 index
    const randomIndex = Math.floor(Math.random() * count);

    // 用 range 只拿一筆
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .range(randomIndex, randomIndex);

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Error fetching random card:', err.message);
    res.status(500).json({ error: err.message });
  }
}
