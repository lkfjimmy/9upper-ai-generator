import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 從 Supabase 隨機抽取一張
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('random()')
      .limit(1);

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random card" });
  }
}
