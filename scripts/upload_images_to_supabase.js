#!/usr/bin/env node
/**
 * Walkaroo Supabase Image Uploader to 'walkaroo-assets'
 * - Prioritizes Home Page images first so the homepage is ready immediately
 * - Syncs all catalog, collection, and product images into the bucket
 * - Handles auto bucket creation if service_role key is present
 * - Provides interactive guidance if storage RLS needs running
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

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zalicyoqqrfdhcsfhpau.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_FRs_pS0TJUWAaJl7FjOE-w_2Lv8ob66';
const BUCKET_NAME = 'walkaroo-assets';
const PROJECT_REF = 'zalicyoqqrfdhcsfhpau';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
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
  if (!fs.existsSync(homeHtmlPath)) return new Set();
  const content = fs.readFileSync(homeHtmlPath, 'utf8');
  const matches = content.match(/[\/a-zA-Z0-9_\-\.]+\.(?:jpg|jpeg|png|webp|gif|svg|ico)/gi) || [];
  const uniqueNames = new Set();
  for (const m of matches) {
    const base = path.basename(m);
    if (base && !base.includes('<') && !base.includes('>')) {
      uniqueNames.add(base.toLowerCase());
    }
  }
  return uniqueNames;
}

async function uploadFile(filePath, remoteKey, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
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
        if (attempt < retries && (error.message.includes('fetch failed') || error.status === 429)) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return { success: false, error: error.message };
      }
      return { success: true, key: remoteKey };
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return { success: false, error: err.message };
    }
  }
}

async function ensureBucket() {
  // Test if bucket is accessible
  const { data: listData, error: listErr } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1 });
  if (!listErr) {
    return { ok: true };
  }

  // If error, attempt creation if service role or admin
  console.log(`Bucket '${BUCKET_NAME}' check returned:`, listErr.message);
  const { data: cData, error: cErr } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 52428800
  });

  if (!cErr) {
    console.log(`✅ Bucket '${BUCKET_NAME}' created successfully!`);
    return { ok: true };
  } else {
    return { ok: false, error: cErr.message || listErr.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const homeOnly = args.includes('--home-preview') || args.includes('--home-only') || args.includes('--preview');
  const concurrency = 10;

  console.log('='.repeat(68));
  console.log(`🖼️   Walkaroo Supabase Storage Image Sync Tool`);
  console.log(`Project Ref:   ${PROJECT_REF}`);
  console.log(`Supabase URL:  ${SUPABASE_URL}`);
  console.log(`Target Bucket: ${BUCKET_NAME}`);
  console.log(`Upload Mode:   ${homeOnly ? 'Home Page Preview Images Only' : 'Home Page First, then All Other Webpages'}`);
  console.log('='.repeat(68));

  // 1. Check or create bucket
  const bucketCheck = await ensureBucket();
  if (!bucketCheck.ok) {
    console.log(`\n❌ Supabase Storage Bucket '${BUCKET_NAME}' is not ready:`);
    console.log(`   ${bucketCheck.error}\n`);
    console.log(`👉 To initialize the bucket and enable public storage uploads:`);
    console.log(`   1. Open the Supabase SQL Editor:`);
    console.log(`      https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    console.log(`   2. Copy & paste the contents of: supabase/storage.sql`);
    console.log(`   3. Click "RUN" to create 'walkaroo-assets' with public upload/view policies.`);
    console.log(`   (Or add SUPABASE_SERVICE_ROLE_KEY to your .env file)\n`);
    process.exit(1);
  }

  // 2. Discover local images
  const targetExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico'];
  const allImages = [
    ...getFilesRecursively(path.join(walkarooDir, 'cdn'), targetExts),
    ...getFilesRecursively(externalDir, targetExts)
  ];

  console.log(`\n📁 Discovered ${allImages.length} total local store assets.`);

  const homeImageNames = getHomePageImages();
  console.log(`🎯 Identified ${homeImageNames.size} distinct image references on Home Page.`);

  // 3. Separate priority home images and secondary images
  const homeImages = [];
  const secondaryImages = [];

  for (const imgPath of allImages) {
    const base = path.basename(imgPath).toLowerCase();
    if (homeImageNames.has(base)) {
      homeImages.push(imgPath);
    } else {
      secondaryImages.push(imgPath);
    }
  }

  console.log(`\n🔹 Priority 1 (Home Page Images):   ${homeImages.length}`);
  console.log(`🔹 Priority 2 (Other Webpage Images): ${secondaryImages.length}\n`);

  async function processQueue(items, label) {
    let completed = 0;
    let failed = 0;
    let skipped = 0;
    let index = 0;

    async function worker() {
      while (index < items.length) {
        const curIndex = index++;
        const fpath = items[curIndex];
        let remoteKey = fpath.replace(walkarooDir + '/', '').replace(rootDir + '/', '');
        remoteKey = remoteKey.replace(/^\/+/, '');

        const res = await uploadFile(fpath, remoteKey);
        if (res.success) {
          completed++;
        } else {
          failed++;
        }

        if ((completed + failed) % 15 === 0 || (completed + failed) === items.length) {
          const pct = Math.round(((completed + failed) / items.length) * 100);
          process.stdout.write(`   [${label}] ${pct}% (${completed + failed}/${items.length}) - Success: ${completed}, Failed: ${failed}\r`);
        }
      }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
    console.log(`\n   ✅ ${label} finished: ${completed} uploaded, ${failed} failed.`);
  }

  // Upload Home page images first
  console.log(`🚀 Step 1: Uploading Home Page images to bucket...`);
  await processQueue(homeImages, 'Home Page');

  if (!homeOnly && secondaryImages.length > 0) {
    console.log(`\n🚀 Step 2: Uploading remaining images for other webpages...`);
    await processQueue(secondaryImages, 'Other Pages');
  }

  console.log('\n🎉 All uploads finished!');
  console.log(`Public CDN assets are now live in '${BUCKET_NAME}' at:`);
  console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/<image_path>\n`);
}

main().catch(err => {
  console.error('\nFatal error during image upload:', err);
  process.exit(1);
});
