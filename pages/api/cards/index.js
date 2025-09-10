import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { term, hints, explanation } = req.body;

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{ term, hints, explanation }]);

      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add card" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
