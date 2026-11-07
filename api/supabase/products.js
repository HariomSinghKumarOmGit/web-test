import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ofgaqwoslqeaxwhpcjqs.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function loadLocalJson(filename) {
  try {
    const filePath = path.join(process.cwd(), 'supabase', 'data', filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {}
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { category, search, limit: limitParam } = req.query || {};
  const limit = parseInt(limitParam || '20', 10);

  try {
    let query = supabase.from('products').select('*');
    if (category) query = query.ilike('category', `%${category}%`);
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, error } = await query.limit(limit);
    if (!error && data && data.length > 0) {
      return res.status(200).json({ source: 'supabase', products: data });
    }
  } catch (e) {}

  let localProducts = loadLocalJson('products.json');
  if (category) {
    localProducts = localProducts.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    localProducts = localProducts.filter(p => p.title && p.title.toLowerCase().includes(search.toLowerCase()));
  }
  return res.status(200).json({ source: 'local_fallback', products: localProducts.slice(0, limit) });
}
