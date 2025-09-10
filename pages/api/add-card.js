// pages/api/add-card.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { term, hints, explanation } = req.body;

  const { data, error } = await supabase
    .from('cards')
    .insert([{ term, hints, explanation }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, data });
}
