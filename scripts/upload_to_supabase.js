#!/usr/bin/env node
/**
 * Direct Batch Uploader to Supabase
 * Reads extracted JSON data and uploads to Supabase tables via @supabase/supabase-js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'supabase', 'data');

const supabaseUrl = process.env.SUPABASE_URL || 'https://zalicyoqqrfdhcsfhpau.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FRs_pS0TJUWAaJl7FjOE-w_2Lv8ob66';

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCollections() {
  const file = path.join(dataDir, 'collections.json');
  if (!fs.existsSync(file)) return;
  const cols = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Uploading ${cols.length} collections...`);
  
  const batchSize = 50;
  for (let i = 0; i < cols.length; i += batchSize) {
    const batch = cols.slice(i, i + batchSize).map(c => ({
      slug: c.slug,
      title: c.title,
      description: c.description || '',
      image_url: c.image_url || ''
    }));
    const { error } = await supabase.from('collections').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`Error uploading collections batch ${i}-${i + batch.length}:`, error.message);
      return false;
    }
    process.stdout.write(`Collections: ${Math.min(i + batchSize, cols.length)}/${cols.length}\r`);
  }
  console.log(`\nCollections uploaded successfully!`);
  return true;
}

async function uploadBlogs() {
  const file = path.join(dataDir, 'blogs.json');
  if (!fs.existsSync(file)) return;
  const blogs = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Uploading ${blogs.length} blog articles...`);
  
  const batchSize = 50;
  for (let i = 0; i < blogs.length; i += batchSize) {
    const batch = blogs.slice(i, i + batchSize).map(b => ({
      slug: b.slug,
      title: b.title,
      author: b.author || 'Walkaroo India',
      excerpt: b.excerpt || '',
      image_url: b.image_url || '',
      published_at: b.published_at || new Date().toISOString()
    }));
    const { error } = await supabase.from('blog_posts').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`Error uploading blogs batch ${i}-${i + batch.length}:`, error.message);
      return false;
    }
    process.stdout.write(`Blogs: ${Math.min(i + batchSize, blogs.length)}/${blogs.length}\r`);
  }
  console.log(`\nBlog articles uploaded successfully!`);
  return true;
}

async function uploadProducts() {
  const file = path.join(dataDir, 'products.json');
  if (!fs.existsSync(file)) return;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Uploading ${products.length} products...`);
  
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map(p => ({
      slug: p.slug,
      title: p.title,
      brand: p.brand || 'Walkaroo',
      category: p.category || 'Footwear',
      description: p.description || '',
      min_price: p.min_price || 0,
      max_price: p.max_price || 0,
      currency: p.currency || 'INR',
      in_stock: p.in_stock ?? true,
      image_url: p.image_url || '',
      images: p.images || [],
      variant_count: p.variant_count || 0
    }));
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`Error uploading products batch ${i}-${i + batch.length}:`, error.message);
      return false;
    }
    process.stdout.write(`Products: ${Math.min(i + batchSize, products.length)}/${products.length}\r`);
  }
  console.log(`\nProducts uploaded successfully!`);
  return true;
}

async function main() {
  console.log('Testing connection to Supabase tables...');
  const { error: testErr } = await supabase.from('products').select('slug').limit(1);
  if (testErr && testErr.code === 'PGRST205') {
    console.log('\nNOTE: The schema has not been executed yet on your Supabase database.');
    console.log('PostgREST cannot create tables automatically.');
    console.log('To initialize the tables:');
    console.log('1. Open your Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/zalicyoqqrfdhcsfhpau/sql/new');
    console.log('2. Copy & paste the contents of `supabase/schema.sql` (or `supabase/seed.sql`)');
    console.log('3. Click "RUN"');
    console.log('4. Then re-run this script: npm run upload-supabase\n');
    return;
  }

  await uploadCollections();
  await uploadBlogs();
  await uploadProducts();
  console.log('All data synced with Supabase successfully!');
}

main().catch(console.error);
