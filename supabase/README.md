# Walkaroo Supabase Integration & SQL Documentation

## Project Information
- **Supabase Project URL**: https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs
- **API URL**: https://ofgaqwoslqeaxwhpcjqs.supabase.co
- **Publishable / Anon API Key**: `sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-`
- **Project Ref**: `ofgaqwoslqeaxwhpcjqs`
- **Storage Bucket**: `walkaroo-assets`

---

## 🚀 How to Set Up SQL in Supabase Dashboard

Because Supabase restricts DDL (`CREATE TABLE`, `storage.buckets`) to SQL Editor / Postgres direct connections:

1. Open your Supabase SQL Editor:
   👉 **[Supabase SQL Editor](https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs/sql/new)**
2. Open [`supabase/schema.sql`](./schema.sql) (or [`supabase/storage.sql`](./storage.sql) for storage only).
3. Paste the SQL contents into the query box and click **RUN**.
4. To populate the database with all 1,592 products, 264 collections, and 295 blog posts:
   - Run [`supabase/seed.sql`](./seed.sql) in the SQL Editor, OR
   - Run the automated batch upload command in your terminal:
     ```bash
     npm run upload-supabase
     ```

---

## 🖼️ Supabase Storage & On-Demand Image Loading

### 1. Storage Bucket Configuration
The storage bucket `walkaroo-assets` is configured in [`supabase/storage.sql`](./storage.sql) with public read access and RLS policies allowing uploads.

Public CDN URL format:
```
https://ofgaqwoslqeaxwhpcjqs.supabase.co/storage/v1/object/public/walkaroo-assets/{image_path}
```

### 2. Home Page Preview & On-Demand Lazy Retraction
Implemented in [supabase-client.js](../supabase-client.js):
- **First Load on Home Page**: Only viewport / above-the-fold preview images (header, hero banners, top categories) are loaded initially.
- **Below-the-fold & Visited Sections**: Off-screen images are deferred and loaded only when the user scrolls or navigates to that section using an `IntersectionObserver`.
- **Automatic Fallback**: If an asset is not yet synced to Supabase Storage, it automatically falls back to the local asset mirror seamlessly.

### 3. Image Upload Scripts
- **Home Preview Images Only** (fast sync of critical banners & thumbnails):
  ```bash
  npm run upload-images-preview
  ```
- **Sync All Catalog Images**:
  ```bash
  npm run upload-images
  ```

---

## 🗄️ Database Tables Created

| Table Name | Description | RLS Policy |
|------------|-------------|------------|
| `products` | All footwear and accessories catalog (1,592 items) | Public Read & Upsert |
| `product_variants` | Sizes, SKUs, individual variant prices | Public Read & Upsert |
| `collections` | Categories & themed collections (264 items) | Public Read & Upsert |
| `blog_posts` | Footwear guides, care tips & trends (295 posts) | Public Read & Upsert |
| `cart_items` | Session-based online persistent cart | Session / Public |
| `orders` | Completed checkout orders with item details | Public insert, customer select |
| `newsletter_subscribers` | Email marketing signups | Public insert |
| `contact_inquiries` | Customer support & contact form messages | Public insert |
| `reviews` | Customer product ratings & reviews | Public read, verified submit |

---

## 🌐 Web Client Integration

The web app integrates with Supabase via `supabase-client.js`.

```javascript
// Fetch products from Supabase
const products = await WalkarooSupabase.getProducts({ category: 'Athletic Shoes', limit: 10 });

// Resolve any image to Supabase Storage CDN
const cdnUrl = WalkarooSupabase.getSupabaseImageUrl('/cdn/shop/files/banner.jpg');

// Subscribe newsletter
await WalkarooSupabase.subscribeNewsletter('user@example.com');
```
