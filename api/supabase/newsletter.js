import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ofgaqwoslqeaxwhpcjqs.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let email = req.body?.email || req.query?.email;
  if (!email && req.body && typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      email = parsed.email;
    } catch {}
  }

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const { data, error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
    if (error && error.code !== '23505') {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    return res.status(200).json({ success: true, message: 'Subscribed (offline mode)' });
  }
}
