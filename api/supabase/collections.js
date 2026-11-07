import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zalicyoqqrfdhcsfhpau.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FRs_pS0TJUWAaJl7FjOE-w_2Lv8ob66';
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

  try {
    const { data, error } = await supabase.from('collections').select('*').limit(50);
    if (!error && data && data.length > 0) {
      return res.status(200).json({ source: 'supabase', collections: data });
    }
  } catch (e) {}

  const localCollections = loadLocalJson('collections.json');
  return res.status(200).json({ source: 'local_fallback', collections: localCollections });
}
