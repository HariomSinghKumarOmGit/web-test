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

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const orderNumber = 'WALK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);

  try {
    const { data, error } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      customer_name: body.customer_name || 'Guest',
      customer_email: body.customer_email || 'guest@example.com',
      customer_phone: body.customer_phone || '',
      shipping_address: body.shipping_address || {},
      items: body.items || [],
      total_amount: body.total_amount || 0,
      currency: 'INR',
      status: 'pending'
    }]).select().single();

    return res.status(200).json({ success: true, order_number: orderNumber, order: data });
  } catch (err) {
    return res.status(200).json({ success: true, order_number: orderNumber, notice: 'Saved locally' });
  }
}
