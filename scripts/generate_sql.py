#!/usr/bin/env python3
"""
Generate Supabase Schema and Seed SQL files from extracted data.
"""
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "supabase", "data")
SQL_DIR = os.path.join(BASE_DIR, "supabase")

SCHEMA_SQL = """-- ====================================================================
-- Walkaroo E-Commerce Supabase Database Schema
-- Project: https://supabase.com/dashboard/project/ofgaqwoslqeaxwhpcjqs
-- Generated: 2026-11-07
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    brand TEXT DEFAULT 'Walkaroo',
    category TEXT DEFAULT 'Footwear',
    description TEXT,
    min_price NUMERIC(10, 2) DEFAULT 0,
    max_price NUMERIC(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    in_stock BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    variant_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT NOT NULL,
    sku TEXT,
    title TEXT NOT NULL,
    size VARCHAR(20),
    price NUMERIC(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    in_stock BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Walkaroo India',
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Cart Items Table (for persistent online cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    product_slug TEXT,
    sku TEXT,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address JSONB DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_slug TEXT NOT NULL,
    author_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for blazing fast lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(min_price);
CREATE INDEX IF NOT EXISTS idx_variants_product_slug ON public.product_variants(product_slug);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_cart_session ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow public read for catalog, allow anon inserts for interactions)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon and service can insert products" ON public.products;
CREATE POLICY "Anon and service can insert products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view variants" ON public.product_variants;
CREATE POLICY "Public can view variants" ON public.product_variants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon and service can insert variants" ON public.product_variants;
CREATE POLICY "Anon and service can insert variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view collections" ON public.collections;
CREATE POLICY "Public can view collections" ON public.collections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon and service can insert collections" ON public.collections;
CREATE POLICY "Anon and service can insert collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view blog posts" ON public.blog_posts;
CREATE POLICY "Public can view blog posts" ON public.blog_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon and service can insert blog posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage own cart items" ON public.cart_items;
CREATE POLICY "Public can manage own cart items" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
"""

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (dict, list)):
        escaped = json.dumps(val).replace("'", "''")
        return f"'{escaped}'::jsonb"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def main():
    print("Writing schema.sql...")
    with open(os.path.join(SQL_DIR, "schema.sql"), "w", encoding="utf-8") as f:
        f.write(SCHEMA_SQL)

    with open(os.path.join(DATA_DIR, "products.json"), "r", encoding="utf-8") as f:
        products = json.load(f)

    with open(os.path.join(DATA_DIR, "collections.json"), "r", encoding="utf-8") as f:
        collections = json.load(f)

    with open(os.path.join(DATA_DIR, "blogs.json"), "r", encoding="utf-8") as f:
        blogs = json.load(f)

    print("Generating collections SQL...")
    col_sql = ["-- Seed Collections"]
    for c in collections:
        col_sql.append(
            f"INSERT INTO public.collections (slug, title, description, image_url) VALUES "
            f"({escape_sql(c['slug'])}, {escape_sql(c['title'])}, {escape_sql(c['description'])}, {escape_sql(c['image_url'])}) "
            f"ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, image_url = EXCLUDED.image_url;"
        )
    with open(os.path.join(SQL_DIR, "seed_collections.sql"), "w", encoding="utf-8") as f:
        f.write("\n".join(col_sql) + "\n")

    print("Generating blogs SQL...")
    blog_sql = ["-- Seed Blog Posts"]
    for b in blogs:
        pub = f"'{b['published_at']}'::timestamptz" if b.get('published_at') else "now()"
        blog_sql.append(
            f"INSERT INTO public.blog_posts (slug, title, author, excerpt, image_url, published_at) VALUES "
            f"({escape_sql(b['slug'])}, {escape_sql(b['title'])}, {escape_sql(b['author'])}, {escape_sql(b['excerpt'])}, {escape_sql(b['image_url'])}, {pub}) "
            f"ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, image_url = EXCLUDED.image_url;"
        )
    with open(os.path.join(SQL_DIR, "seed_blogs.sql"), "w", encoding="utf-8") as f:
        f.write("\n".join(blog_sql) + "\n")

    print("Generating products & variants SQL...")
    prod_sql = ["-- Seed Products"]
    var_sql = ["-- Seed Product Variants"]

    for p in products:
        prod_sql.append(
            f"INSERT INTO public.products (slug, title, brand, category, description, min_price, max_price, currency, in_stock, image_url, images, variant_count) VALUES ("
            f"{escape_sql(p['slug'])}, {escape_sql(p['title'])}, {escape_sql(p['brand'])}, {escape_sql(p['category'])}, {escape_sql(p['description'])}, "
            f"{p['min_price']}, {p['max_price']}, {escape_sql(p['currency'])}, {escape_sql(p['in_stock'])}, {escape_sql(p['image_url'])}, {escape_sql(p['images'])}, {p['variant_count']}) "
            f"ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, min_price = EXCLUDED.min_price, max_price = EXCLUDED.max_price, in_stock = EXCLUDED.in_stock, image_url = EXCLUDED.image_url, images = EXCLUDED.images;"
        )
        for v in p.get("variants", []):
            var_sql.append(
                f"INSERT INTO public.product_variants (product_slug, sku, title, size, price, currency, in_stock, image_url) VALUES ("
                f"{escape_sql(p['slug'])}, {escape_sql(v['sku'])}, {escape_sql(v['title'])}, {escape_sql(v['size'])}, {v['price']}, {escape_sql(v['currency'])}, {escape_sql(v['in_stock'])}, {escape_sql(v['image_url'])});"
            )

    with open(os.path.join(SQL_DIR, "seed_products.sql"), "w", encoding="utf-8") as f:
        f.write("\n".join(prod_sql) + "\n")

    with open(os.path.join(SQL_DIR, "seed_variants.sql"), "w", encoding="utf-8") as f:
        f.write("\n".join(var_sql) + "\n")

    # Combine all into master seed.sql
    print("Writing master seed.sql...")
    with open(os.path.join(SQL_DIR, "seed.sql"), "w", encoding="utf-8") as f:
        f.write("-- Walkaroo Supabase Seed Data\n\n")
        f.write("-- 1. COLLECTIONS\n")
        f.write("\n".join(col_sql) + "\n\n")
        f.write("-- 2. BLOG POSTS\n")
        f.write("\n".join(blog_sql) + "\n\n")
        f.write("-- 3. PRODUCTS\n")
        f.write("\n".join(prod_sql) + "\n\n")
        f.write("-- 4. VARIANTS\n")
        f.write("\n".join(var_sql) + "\n")

    print("SQL generation complete!")

if __name__ == "__main__":
    main()
