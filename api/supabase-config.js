export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ofgaqwoslqeaxwhpcjqs.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-';
  const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ofgaqwoslqeaxwhpcjqs';

  return res.status(200).json({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    projectRef: SUPABASE_PROJECT_REF
  });
}
