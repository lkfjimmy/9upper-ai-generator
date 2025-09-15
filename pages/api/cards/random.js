// pages/api/cards/random.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    if (count === 0) return res.status(200).json({ error: 'No cards available.' });

    const randomIndex = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .range(randomIndex, randomIndex);

    if (error) throw error;

    res.status(200).json({ randomCard: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch random card.' });
  }
}
