import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const walkarooDir = path.join(rootDir, 'www.walkaroo.in');

const supabaseSnippet = `<!-- Supabase Web Integration -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/supabase-client.js"></script>
`;

let injectedCount = 0;

function processHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('supabase-client.js')) {
          if (content.includes('</head>')) {
            content = content.replace('</head>', `${supabaseSnippet}</head>`);
            fs.writeFileSync(fullPath, content, 'utf8');
            injectedCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

console.log('Building for deployment...');
console.log('Injecting Supabase client into HTML pages...');
processHtmlFiles(walkarooDir);
console.log(`Injected Supabase integration into ${injectedCount} HTML files.`);

// Sync root index.html from www.walkaroo.in/index.html
const sourceIndex = path.join(walkarooDir, 'index.html');
const destIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(sourceIndex)) {
  fs.copyFileSync(sourceIndex, destIndex);
  console.log('Synced root index.html with storefront homepage.');
}

console.log('Vercel build preparation completed successfully!');
