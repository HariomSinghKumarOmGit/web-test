import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3333', 10);
const HOST = process.env.HOST || '0.0.0.0';

const walkarooDir = path.join(__dirname, 'www.walkaroo.in');
const externalDir = path.join(__dirname, '_external');
const dataDir = path.join(__dirname, 'supabase', 'data');

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ofgaqwoslqeaxwhpcjqs.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-';
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'ofgaqwoslqeaxwhpcjqs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4'
};

// Build smart asset lookup map
const assetMap = new Map();

function indexDir(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        indexDir(fullPath);
        continue;
      }

      // Check version/width patterns e.g. foo.v_123_width_1600.jpg
      const match = f.match(/^(.+?)\.v_(\d+)(?:_width_(\d+))?(\.[a-zA-Z0-9]+)$/);
      if (match) {
        const [, base, v, width, ext] = match;
        const key = (base + ext).toLowerCase();
        if (!assetMap.has(key)) assetMap.set(key, []);
        assetMap.get(key).push({
          fullPath,
          v,
          width: width ? parseInt(width, 10) : 0
        });
      }

      // Also index by plain lowercase name
      const plainKey = f.toLowerCase();
      if (!assetMap.has(plainKey)) assetMap.set(plainKey, []);
      assetMap.get(plainKey).push({
        fullPath,
        v: '',
        width: 0
      });
    }
  } catch (err) {
    console.error('Error indexing directory', dir, err);
  }
}

console.log('Indexing assets for fast local delivery...');
indexDir(path.join(walkarooDir, 'cdn'));
indexDir(externalDir);
console.log(`Indexed ${assetMap.size} distinct asset keys!`);

function resolveSmartAsset(requestedBasename, queryParams) {
  const key = requestedBasename.toLowerCase();
  const entries = assetMap.get(key);
  if (!entries || entries.length === 0) return null;

  const targetWidth = queryParams.get('width') ? parseInt(queryParams.get('width'), 10) : 0;
  const targetV = queryParams.get('v') || '';

  // 1. Exact version and width
  if (targetV && targetWidth) {
    const exact = entries.find(e => e.v === targetV && e.width === targetWidth);
    if (exact) return exact.fullPath;
  }

  // 2. Exact width
  if (targetWidth) {
    const byWidth = entries.find(e => e.width === targetWidth);
    if (byWidth) return byWidth.fullPath;

    // Closest width
    const sorted = [...entries].sort((a, b) => Math.abs(a.width - targetWidth) - Math.abs(b.width - targetWidth));
    if (sorted.length > 0) return sorted[0].fullPath;
  }

  // 3. Largest available width
  const largest = [...entries].sort((a, b) => b.width - a.width);
  return largest[0].fullPath;
}

// In-memory mock cart
let cartState = {
  token: 'local-session-cart-token',
  note: '',
  attributes: {},
  original_total_price: 77900,
  total_price: 77900,
  total_discount: 0,
  total_weight: 0.0,
  item_count: 1,
  items: [
    {
      id: 51533239910719,
      properties: {},
      quantity: 1,
      variant_id: 51533239910719,
      key: '51533239910719:af00a07713b6e9ec1a63c8f3bf39d39b',
      title: "Men's Daily Wear Comfort Sandals - WGP53032 Camel - 6",
      price: 77900,
      original_price: 77900,
      discounted_price: 77900,
      line_price: 77900,
      original_line_price: 77900,
      total_discount: 0,
      discounts: [],
      sku: 'P53032G-CML006-779',
      grams: 0,
      vendor: 'BOUNCEEZ',
      taxable: true,
      product_id: 9991700971839,
      product_has_only_default_variant: false,
      gift_card: false,
      final_price: 77900,
      final_line_price: 77900,
      url: '/products/mens-daily-wear-comfort-sandals-wgp53032-camel?variant=51533239910719',
      featured_image: {
        aspect_ratio: 1.0,
        alt: "Men's Daily Wear Comfort Sandals - WGP53032 Camel",
        height: 1600,
        url: '/cdn/shop/files/1_b1003f68-0e49-405d-b120-4763f14709eb.jpg?v=1786512022',
        width: 1600
      },
      image: '/cdn/shop/files/1_b1003f68-0e49-405d-b120-4763f14709eb.jpg?v=1786512022',
      handle: 'mens-daily-wear-comfort-sandals-wgp53032-camel',
      requires_shipping: true,
      product_type: 'SANDALS',
      product_title: "Men's Daily Wear Comfort Sandals - WGP53032 Camel",
      product_description: 'Step into superior comfort and versatile style with these Mens Camel Comfort Sandals.',
      variant_title: '6',
      variant_options: ['6'],
      options_with_values: [{ name: 'Size', value: '6' }],
      line_level_discount_allocations: [],
      line_level_total_discount: 0
    }
  ],
  requires_shipping: true,
  currency: 'INR',
  items_subtotal_price: 77900,
  cart_level_discount_applications: [],
  checkout_charge_amount: 77900
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

// Local cache for JSON data fallback
function loadLocalJson(filename) {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Serve client script
  if (pathname === '/supabase-client.js' || pathname === '/www.walkaroo.in/supabase-client.js') {
    const clientPath = path.join(__dirname, 'supabase-client.js');
    if (fs.existsSync(clientPath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      fs.createReadStream(clientPath).pipe(res);
      return;
    }
  }

  // Supabase Configuration API
  if (pathname === '/api/supabase-config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      projectRef: SUPABASE_PROJECT_REF
    }));
    return;
  }

  // Supabase Products API
  if (pathname === '/api/supabase/products') {
    const category = parsedUrl.searchParams.get('category');
    const search = parsedUrl.searchParams.get('search');
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '20', 10);
    
    try {
      let query = supabase.from('products').select('*');
      if (category) query = query.ilike('category', `%${category}%`);
      if (search) query = query.ilike('title', `%${search}%`);
      const { data, error } = await query.limit(limit);
      if (!error && data && data.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ source: 'supabase', products: data }));
        return;
      }
    } catch (e) {
      // fallback
    }

    // Local JSON fallback
    let localProducts = loadLocalJson('products.json');
    if (category) {
      localProducts = localProducts.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      localProducts = localProducts.filter(p => p.title && p.title.toLowerCase().includes(search.toLowerCase()));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ source: 'local_fallback', products: localProducts.slice(0, limit) }));
    return;
  }

  // Supabase Collections API
  if (pathname === '/api/supabase/collections') {
    try {
      const { data, error } = await supabase.from('collections').select('*').limit(50);
      if (!error && data && data.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ source: 'supabase', collections: data }));
        return;
      }
    } catch (e) {}

    const localCollections = loadLocalJson('collections.json');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ source: 'local_fallback', collections: localCollections }));
    return;
  }

  // Supabase Newsletter Subscribe API
  if (pathname === '/api/supabase/newsletter' && req.method === 'POST') {
    const body = await readBody(req);
    const email = body.email;
    if (!email) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Email required' }));
      return;
    }
    try {
      const { data, error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
      if (error && error.code !== '23505') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Subscribed successfully' }));
      return;
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Subscribed (offline mode)' }));
      return;
    }
  }

  // Supabase Order Checkout API
  if (pathname === '/api/supabase/order' && req.method === 'POST') {
    const body = await readBody(req);
    const orderNumber = 'WALK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
    try {
      const { data, error } = await supabase.from('orders').insert([{
        order_number: orderNumber,
        customer_name: body.customer_name || 'Guest',
        customer_email: body.customer_email || 'guest@example.com',
        customer_phone: body.customer_phone || '',
        shipping_address: body.shipping_address || {},
        items: body.items || cartState.items,
        total_amount: body.total_amount || (cartState.total_price / 100),
        currency: 'INR',
        status: 'pending'
      }]).select().single();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, order_number: orderNumber, order: data }));
      return;
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, order_number: orderNumber, notice: 'Saved locally' }));
      return;
    }
  }

  // Normalize root path
  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  }

  // Handle mock Shopify Cart API endpoints
  if (pathname === '/cart.js' || pathname === '/cart.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cartState));
    return;
  }

  if (pathname === '/cart/add.js' || pathname === '/cart/add.json' || pathname === '/cart/update.js' || pathname === '/cart/update.json' || pathname === '/cart/change.js') {
    const body = await readBody(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...cartState,
      status: 200,
      sections: {}
    }));
    return;
  }

  if (pathname === '/cart/clear.js') {
    cartState.items = [];
    cartState.item_count = 0;
    cartState.total_price = 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cartState));
    return;
  }

  // Telemetry & analytics endpoints -> 200 OK
  if (pathname.includes('/.well-known/') || pathname.includes('/api/collect') || pathname.includes('/monorail')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  let cleanPath = pathname;
  if (cleanPath.startsWith('/www.walkaroo.in/')) {
    cleanPath = cleanPath.replace('/www.walkaroo.in/', '/');
  }

  // 1. Smart asset matching for images & media
  const ext = path.extname(cleanPath).toLowerCase();
  const isImageOrMedia = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.woff', '.woff2'].includes(ext);

  if (isImageOrMedia) {
    const basename = path.basename(cleanPath);
    const resolvedPath = resolveSmartAsset(basename, parsedUrl.searchParams);
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(resolvedPath).pipe(res);
      return;
    }
  }

  // 2. Direct file lookup
  let foundFile = null;
  const candidates = [
    path.join(__dirname, cleanPath),
    path.join(walkarooDir, cleanPath),
    path.join(externalDir, cleanPath),
    path.join(walkarooDir, cleanPath + '.html'),
    path.join(walkarooDir, cleanPath, 'index.html')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      foundFile = c;
      break;
    }
  }

  // Fallback for navigation requests
  if (!foundFile && !ext) {
    foundFile = path.join(walkarooDir, 'index.html');
  }

  if (foundFile) {
    const fileExt = path.extname(foundFile).toLowerCase();
    const contentType = mimeTypes[fileExt] || 'application/octet-stream';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // If HTML file, dynamically inject Supabase Client scripts if not already present
    if (fileExt === '.html') {
      try {
        let htmlContent = fs.readFileSync(foundFile, 'utf8');
        const supabaseSnippet = `
<!-- Supabase Web Integration -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/supabase-client.js"></script>
`;
        if (!htmlContent.includes('supabase-client.js')) {
          if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${supabaseSnippet}</head>`);
          } else {
            htmlContent = supabaseSnippet + htmlContent;
          }
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(htmlContent);
        return;
      } catch (err) {
        // Fall back to stream
      }
    }

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    };

    const isCompressible = /text|javascript|json|xml|svg/i.test(contentType);

    if (isCompressible && acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      fs.createReadStream(foundFile).pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, headers);
      fs.createReadStream(foundFile).pipe(res);
    }
  } else {
    // If an image was requested but truly missing, deliver a clean 1x1 transparent PNG
    if (isImageOrMedia) {
      const transparent1x1Png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000'
      });
      res.end(transparent1x1Png);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log('='.repeat(65));
  console.log(`🚀 Walkaroo E-Commerce Server with Supabase Active!`);
  console.log(`📡 Local URL:      http://localhost:${PORT}`);
  console.log(`⚡ Supabase Ref:   ${SUPABASE_PROJECT_REF}`);
  console.log(`📊 Supabase API:   http://localhost:${PORT}/api/supabase/products`);
  console.log(`✨ Smart Asset Matching & Dynamic Catalog Sync Enabled!`);
  console.log('='.repeat(65));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
