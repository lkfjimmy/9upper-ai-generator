export default function handler(req, res) {
  res.status(200).json({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING",
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Loaded!" : "MISSING",
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded!" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  });
}
