// pages/api/cards/add.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term, hints, explanation } = req.body;

  if (!term || !hints || !explanation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('cards')
    .insert([{ term, hints, explanation }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true, card: data[0] });
}
