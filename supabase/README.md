# Walkaroo Supabase Integration & SQL Documentation

## Project Information
- **Supabase Project URL**: https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs
- **API URL**: https://ofgaqwoslqeaxwhpcjqs.supabase.co
- **Publishable / Anon API Key**: `sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-`
- **Project Ref**: `ofgaqwoslqeaxwhpcjqs`

---

## 🚀 How to Set Up SQL in Supabase Dashboard

Because Supabase restricts DDL (`CREATE TABLE`) to SQL Editor / Postgres direct connections:

1. Open your Supabase SQL Editor:
   👉 **[Supabase SQL Editor](https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs/sql/new)**
2. Open [`supabase/schema.sql`](./schema.sql) in this repository.
3. Paste the SQL contents into the query box and click **RUN**.
4. To populate the database with all 1,592 products, 264 collections, and 295 blog posts:
   - Run [`supabase/seed.sql`](./seed.sql) in the SQL Editor, OR
   - Run the automated batch upload command in your terminal:
     ```bash
     npm run upload-supabase
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

### Client Usage Examples:
```javascript
// Fetch products
const products = await WalkarooSupabase.getProducts({ category: 'Athletic Shoes', limit: 10 });

// Fetch a single product with variants
const product = await WalkarooSupabase.getProductBySlug('alton-mens-lace-up-sports-shoe-ws9616-dark-grey');

// Subscribe newsletter
await WalkarooSupabase.subscribeNewsletter('user@example.com');

// Submit an order
await WalkarooSupabase.createOrder({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 9876543210',
  total: 999.00,
  items: [ ... ]
});
```
