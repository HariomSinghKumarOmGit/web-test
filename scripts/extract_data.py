#!/usr/bin/env python3
"""
Walkaroo Website Data Extractor -> Supabase SQL & JSON
Extracts Products, Variants, Collections, and Blogs from local HTML files
"""
import os
import glob
import json
import re
import html
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WALKAROO_DIR = os.path.join(BASE_DIR, "www.walkaroo.in")
DATA_DIR = os.path.join(BASE_DIR, "supabase", "data")
os.makedirs(DATA_DIR, exist_ok=True)

def clean_text(text):
    if not text:
        return ""
    text = html.unescape(text)
    return text.strip()

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

def extract_products():
    print("Extracting products...")
    product_files = glob.glob(os.path.join(WALKAROO_DIR, "products", "*.html"))
    products = []
    variants_list = []
    
    seen_slugs = set()
    
    for fpath in product_files:
        basename = os.path.basename(fpath)
        slug = basename.replace(".html", "")
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            scripts = re.findall(r"<script type=[\"\x27]application/ld\+json[\"\x27]>(.*?)</script>", content, re.DOTALL)
            pg_data = None
            for s in scripts:
                try:
                    d = json.loads(s)
                    if d.get("@type") == "ProductGroup":
                        pg_data = d
                        break
                except Exception:
                    continue
            
            if not pg_data:
                # Fallback to HTML parsing
                soup = BeautifulSoup(content[:50000], "html.parser")
                title = soup.title.string if soup.title else slug.replace("-", " ").title()
                title = re.sub(r"\s*–\s*Walkaroo.*$", "", title).strip()
                desc = ""
                meta_desc = soup.find("meta", {"name": "description"})
                if meta_desc and meta_desc.get("content"):
                    desc = meta_desc["content"]
                brand = "Walkaroo"
                cat = "Footwear"
                variants = []
                pg_data = {
                    "name": title,
                    "description": desc,
                    "brand": {"name": brand},
                    "category": cat,
                    "hasVariant": []
                }
            
            name = clean_text(pg_data.get("name") or slug.replace("-", " ").title())
            name = re.sub(r"\s*–\s*Walkaroo.*$", "", name).strip()
            
            brand_val = pg_data.get("brand")
            brand = brand_val.get("name") if isinstance(brand_val, dict) else (brand_val or "Walkaroo")
            brand = clean_text(brand)
            
            category = clean_text(pg_data.get("category") or "Footwear")
            description = clean_text(pg_data.get("description") or "")
            
            has_variants = pg_data.get("hasVariant", [])
            images = []
            prices = []
            
            # Extract images from content if any
            main_image = None
            
            parsed_variants = []
            for v in has_variants:
                v_name = clean_text(v.get("name") or "")
                v_sku = clean_text(v.get("sku") or "")
                v_img = v.get("image") or ""
                if v_img and v_img not in images:
                    images.append(v_img)
                    if not main_image:
                        main_image = v_img
                        
                offers = v.get("offers") or {}
                price_str = str(offers.get("price") or "0").replace(",", "").strip()
                try:
                    price = float(price_str)
                except ValueError:
                    price = 0.0
                if price > 0:
                    prices.append(price)
                
                currency = offers.get("priceCurrency") or "INR"
                avail = offers.get("availability") or "http://schema.org/InStock"
                in_stock = "InStock" in avail
                
                # Determine size
                size_match = re.search(r"-\s*(\d+[\.\d]*)\s*$", v_name)
                size = size_match.group(1) if size_match else ""
                
                parsed_variants.append({
                    "sku": v_sku,
                    "title": v_name,
                    "size": size,
                    "price": price,
                    "currency": currency,
                    "in_stock": in_stock,
                    "image_url": v_img
                })
            
            min_price = min(prices) if prices else 0.0
            max_price = max(prices) if prices else 0.0
            
            product_record = {
                "slug": slug,
                "title": name,
                "brand": brand,
                "category": category,
                "description": description[:1000],
                "min_price": min_price,
                "max_price": max_price,
                "currency": "INR",
                "in_stock": True if len(prices) > 0 else False,
                "image_url": main_image or (images[0] if images else ""),
                "images": images,
                "variant_count": len(parsed_variants),
                "variants": parsed_variants
            }
            products.append(product_record)
            
        except Exception as err:
            continue
            
    print(f"Extracted {len(products)} products.")
    with open(os.path.join(DATA_DIR, "products.json"), "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)
    return products

def extract_collections():
    print("Extracting collections...")
    col_files = glob.glob(os.path.join(WALKAROO_DIR, "collections", "*.html"))
    collections = []
    seen = set()
    
    for fpath in col_files:
        slug = os.path.basename(fpath).replace(".html", "")
        if slug in seen:
            continue
        seen.add(slug)
        
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            scripts = re.findall(r"<script type=[\"\x27]application/ld\+json[\"\x27]>(.*?)</script>", content, re.DOTALL)
            name = None
            img_url = ""
            for s in scripts:
                try:
                    d = json.loads(s)
                    if d.get("@type") == "CollectionPage":
                        name = d.get("name")
                        img = d.get("image")
                        if isinstance(img, dict):
                            img_url = img.get("url", "")
                        elif isinstance(img, str):
                            img_url = img
                        break
                except Exception:
                    continue
            
            soup = BeautifulSoup(content[:30000], "html.parser")
            if not name:
                title_elem = soup.title.string if soup.title else slug.replace("-", " ").title()
                name = re.sub(r"\s*–\s*Walkaroo.*$", "", title_elem).strip()
            
            desc = ""
            meta_desc = soup.find("meta", {"name": "description"})
            if meta_desc and meta_desc.get("content"):
                desc = meta_desc["content"]
                
            collections.append({
                "slug": slug,
                "title": clean_text(name),
                "description": clean_text(desc),
                "image_url": img_url
            })
        except Exception:
            continue
            
    print(f"Extracted {len(collections)} collections.")
    with open(os.path.join(DATA_DIR, "collections.json"), "w", encoding="utf-8") as f:
        json.dump(collections, f, indent=2)
    return collections

def extract_blogs():
    print("Extracting blogs...")
    blog_files = glob.glob(os.path.join(WALKAROO_DIR, "blogs", "all", "*.html"))
    articles = []
    seen = set()
    
    for fpath in blog_files:
        slug = os.path.basename(fpath).replace(".html", "")
        if slug in seen:
            continue
        seen.add(slug)
        
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            scripts = re.findall(r"<script type=[\"\x27]application/ld\+json[\"\x27]>(.*?)</script>", content, re.DOTALL)
            headline = None
            author = "Walkaroo India"
            image_url = ""
            date_published = None
            
            for s in scripts:
                try:
                    d = json.loads(s)
                    if d.get("@type") in ("Article", "BlogPosting"):
                        headline = d.get("headline")
                        auth = d.get("author")
                        if isinstance(auth, dict):
                            author = auth.get("name", "Walkaroo India")
                        elif isinstance(auth, str):
                            author = auth
                        img = d.get("image")
                        if isinstance(img, dict):
                            image_url = img.get("url", "")
                        elif isinstance(img, str):
                            image_url = img
                        date_published = d.get("datePublished")
                        break
                except Exception:
                    continue
            
            soup = BeautifulSoup(content[:40000], "html.parser")
            if not headline:
                t = soup.title.string if soup.title else slug.replace("-", " ").title()
                headline = re.sub(r"\s*–\s*Walkaroo.*$", "", t).strip()
                
            desc = ""
            meta_desc = soup.find("meta", {"name": "description"})
            if meta_desc and meta_desc.get("content"):
                desc = meta_desc["content"]
                
            articles.append({
                "slug": slug,
                "title": clean_text(headline),
                "author": clean_text(author),
                "excerpt": clean_text(desc),
                "image_url": image_url,
                "published_at": date_published
            })
        except Exception:
            continue
            
    print(f"Extracted {len(articles)} blog articles.")
    with open(os.path.join(DATA_DIR, "blogs.json"), "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2)
    return articles

if __name__ == "__main__":
    products = extract_products()
    collections = extract_collections()
    blogs = extract_blogs()
    print("All extractions completed successfully!")
