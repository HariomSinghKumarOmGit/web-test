#!/usr/bin/env node
/**
 * Walkaroo Image Uploader to Supabase Storage ('walkaroo-assets')
 * Supports uploading priority preview images first, or syncing all catalog images
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const walkarooDir = path.join(rootDir, 'www.walkaroo.in');
const externalDir = path.join(rootDir, '_external');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ofgaqwoslqeaxwhpcjqs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-';
const BUCKET_NAME = 'walkaroo-assets';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function getFilesRecursively(dir, filterExts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getFilesRecursively(fullPath, filterExts));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (filterExts.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err.message);
  }
  return results;
}

// Extract images referenced in the home page (for priority preview upload)
function getHomePageImages() {
  const homeHtmlPath = path.join(walkarooDir, 'index.html');
  if (!fs.existsSync(homeHtmlPath)) return [];
  const content = fs.readFileSync(homeHtmlPath, 'utf8');
  const matches = content.match(/[\/a-zA-Z0-9_\-\.]+\.(?:jpg|jpeg|png|webp|gif|svg)/gi) || [];
  const uniqueNames = new Set();
  for (const m of matches) {
    const base = path.basename(m);
    if (base && !base.includes('<') && !base.includes('>')) {
      uniqueNames.add(base.toLowerCase());
    }
  }
  return uniqueNames;
}

async function uploadFile(filePath, remoteKey) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remoteKey, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, key: remoteKey };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const previewOnly = args.includes('--preview') || args.includes('--home-preview');
  const concurrency = 5;

  console.log('='.repeat(65));
  console.log(`🖼️  Walkaroo Supabase Image Sync Tool`);
  console.log(`Target Bucket: ${BUCKET_NAME}`);
  console.log(`Supabase URL:  ${SUPABASE_URL}`);
  console.log(`Mode:          ${previewOnly ? 'Home Preview Images Only' : 'Priority Preview + Full Sync'}`);
  console.log('='.repeat(65));

  // 1. Verify bucket existence
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr || !buckets) {
    console.log('\n❌ Unable to list buckets:', bErr?.message);
    console.log('Ensure you have run `supabase/storage.sql` or `supabase/schema.sql` in your Supabase SQL Editor:');
    console.log('👉 https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs/sql/new\n');
  }

  const targetExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const allImages = [
    ...getFilesRecursively(path.join(walkarooDir, 'cdn'), targetExts),
    ...getFilesRecursively(externalDir, targetExts)
  ];

  console.log(`Found ${allImages.length} total local images.`);

  const homeImageNames = getHomePageImages();
  console.log(`Identified ${homeImageNames.size} distinct image references on Home Page.`);

  // Prioritize home page images first
  const priorityList = [];
  const secondaryList = [];

  for (const imgPath of allImages) {
    const base = path.basename(imgPath).toLowerCase();
    if (homeImageNames.has(base)) {
      priorityList.push(imgPath);
    } else {
      secondaryList.push(imgPath);
    }
  }

  console.log(`\nPriority Home Preview Images: ${priorityList.length}`);
  console.log(`Catalog / Secondary Images:   ${secondaryList.length}\n`);

  const queue = previewOnly ? priorityList : [...priorityList, ...secondaryList];
  let completed = 0;
  let failed = 0;

  console.log(`Starting upload queue of ${queue.length} images...`);

  // Simple concurrency worker pool
  let index = 0;
  async function worker() {
    while (index < queue.length) {
      const curIndex = index++;
      const fpath = queue[curIndex];
      // Normalize remote key
      let remoteKey = fpath.replace(walkarooDir + '/', '').replace(rootDir + '/', '');
      remoteKey = remoteKey.replace(/^\/+/, '');

      const res = await uploadFile(fpath, remoteKey);
      if (res.success) {
        completed++;
      } else {
        failed++;
        // If RLS blocked, stop early with helpful guidance
        if (res.error && res.error.includes('row-level security')) {
          console.log(`\n⚠️  Supabase Storage RLS policy must be initialized!`);
          console.log(`Run 'supabase/storage.sql' in your Supabase SQL editor:`);
          console.log(`👉 https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs/sql/new\n`);
          process.exit(0);
        }
      }

      if (completed % 10 === 0 || completed === queue.length) {
        process.stdout.write(`Progress: ${completed + failed}/${queue.length} (Success: ${completed}, Failed: ${failed})\r`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`\n✅ Upload finished! ${completed} uploaded, ${failed} failed.`);
}

main().catch(console.error);
