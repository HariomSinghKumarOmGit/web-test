/**
 * Walkaroo E-Commerce Supabase Client & Smart Image Retract Integration
 * - Retracts images on-demand from Supabase Storage CDN (walkaroo-assets)
 * - Home Page Preview Optimizer: Loads only visible viewport preview images first
 * - Defers below-the-fold images until the user actually visits/scrolls to that section
 */
(function(window) {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://ofgaqwoslqeaxwhpcjqs.supabase.co',
    anonKey: 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-',
    projectRef: 'ofgaqwoslqeaxwhpcjqs',
    bucket: 'walkaroo-assets',
    useStorageCdn: true
  };

  let client = null;

  function getClient() {
    if (!client) {
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      }
    }
    return client;
  }

  // Session ID for anonymous cart tracking
  function getSessionId() {
    let sid = localStorage.getItem('walkaroo_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('walkaroo_session_id', sid);
    }
    return sid;
  }

  // Convert local/CDN path to Supabase Storage public CDN URL
  function getSupabaseImageUrl(originalUrl) {
    if (!originalUrl) return '';
    let clean = originalUrl;
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      if (clean.includes('walkaroo.in/')) {
        clean = clean.split('walkaroo.in/')[1];
      } else {
        return originalUrl;
      }
    }
    // Remove query params (v=..., width=...) and leading slashes for Supabase storage key
    clean = clean.split('?')[0].replace(/^\/+/, '');
    return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${clean}`;
  }

  const WalkarooSupabase = {
    config: SUPABASE_CONFIG,
    getClient,
    getSessionId,
    getSupabaseImageUrl,

    // Product Queries
    async getProducts(options = {}) {
      const sb = getClient();
      if (!sb) return [];
      let query = sb.from('products').select('*');
      if (options.category) query = query.ilike('category', `%${options.category}%`);
      if (options.brand) query = query.ilike('brand', `%${options.brand}%`);
      if (options.search) query = query.ilike('title', `%${options.search}%`);
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      const { data, error } = await query;
      if (error) console.error('Error fetching products:', error);
      return data || [];
    },

    async getProductBySlug(slug) {
      const sb = getClient();
      if (!sb) return null;
      const { data, error } = await sb.from('products').select('*, product_variants(*)').eq('slug', slug).single();
      if (error) console.error('Error fetching product:', error);
      return data;
    },

    // Collections
    async getCollections() {
      const sb = getClient();
      if (!sb) return [];
      const { data, error } = await sb.from('collections').select('*').limit(100);
      if (error) console.error('Error fetching collections:', error);
      return data || [];
    },

    // Blogs
    async getBlogPosts(limit = 20) {
      const sb = getClient();
      if (!sb) return [];
      const { data, error } = await sb.from('blog_posts').select('*').order('published_at', { ascending: false }).limit(limit);
      if (error) console.error('Error fetching blog posts:', error);
      return data || [];
    },

    // Newsletter Subscription
    async subscribeNewsletter(email) {
      const sb = getClient();
      if (!sb) return { success: false, message: 'Client not ready' };
      const { data, error } = await sb.from('newsletter_subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') {
          return { success: true, message: 'Already subscribed!' };
        }
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Thank you for subscribing!' };
    },

    // Contact form / Lead inquiry
    async submitInquiry(inquiryData) {
      const sb = getClient();
      if (!sb) return { success: false, message: 'Client not ready' };
      const { data, error } = await sb.from('contact_inquiries').insert([inquiryData]);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Message sent successfully!' };
    },

    // Create an order / checkout submission
    async createOrder(orderData) {
      const sb = getClient();
      if (!sb) return { success: false, message: 'Client not ready' };
      const orderNumber = 'WALK-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
      const payload = {
        order_number: orderNumber,
        customer_name: orderData.name || 'Guest',
        customer_email: orderData.email || 'customer@example.com',
        customer_phone: orderData.phone || '',
        shipping_address: orderData.address || {},
        items: orderData.items || [],
        total_amount: orderData.total || 0,
        currency: 'INR',
        status: 'pending'
      };
      const { data, error } = await sb.from('orders').insert([payload]).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, order: data };
    },

    // Cart persistence
    async syncCartItem(item) {
      const sb = getClient();
      if (!sb) return;
      const sessionId = getSessionId();
      await sb.from('cart_items').upsert({
        session_id: sessionId,
        product_slug: item.slug || '',
        sku: item.sku || '',
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        image_url: item.image || ''
      });
    },

    // Product reviews
    async submitReview(review) {
      const sb = getClient();
      if (!sb) return { success: false };
      const { data, error } = await sb.from('reviews').insert([review]);
      if (error) return { success: false, message: error.message };
      return { success: true };
    }
  };

  // Smart On-Demand Image Retract & Home Page Preview Optimizer
  function initSmartImageLoading() {
    const isHomePage = window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/index.html') ||
                       window.location.pathname.endsWith('/www.walkaroo.in/');

    const viewportHeight = window.innerHeight || 800;
    const images = Array.from(document.querySelectorAll('img'));

    // IntersectionObserver for retracting images only when user scrolls to that part
    let imageObserver = null;
    if ('IntersectionObserver' in window) {
      imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const targetUrl = img.getAttribute('data-sb-src') || img.getAttribute('data-original-src');
            if (targetUrl) {
              // Try retracting from Supabase Storage first, fallback to original if unavailable
              const supabaseUrl = getSupabaseImageUrl(targetUrl);
              const fallbackUrl = img.getAttribute('data-original-src') || targetUrl;

              img.onerror = function() {
                // If Supabase CDN object not found yet, gracefully load original local mirror
                if (img.src !== fallbackUrl) {
                  img.src = fallbackUrl;
                }
              };

              img.src = SUPABASE_CONFIG.useStorageCdn ? supabaseUrl : fallbackUrl;
              img.removeAttribute('data-sb-src');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '250px 0px', // Pre-fetch slightly before coming into view
        threshold: 0.01
      });
    }

    images.forEach(img => {
      const currentSrc = img.getAttribute('src');
      if (!currentSrc || currentSrc.startsWith('data:image/svg+xml')) return;

      const rect = img.getBoundingClientRect();
      const isAboveTheFold = rect.top >= 0 && rect.top <= (viewportHeight * 1.2);

      // On Home Page: preview images above the fold load immediately
      // Below the fold images are deferred until the user visits/scrolls down!
      if (isHomePage && !isAboveTheFold && imageObserver) {
        img.setAttribute('data-original-src', currentSrc);
        img.setAttribute('data-sb-src', currentSrc);
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        // Low-overhead placeholder while waiting for user scroll
        img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f2f2f2%22%2F%3E%3C%2Fsvg%3E';
        imageObserver.observe(img);
      } else {
        // Immediate preview image: enable async decoding & Supabase fallback
        img.setAttribute('decoding', 'async');
        const original = currentSrc;
        const supabaseUrl = getSupabaseImageUrl(original);
        if (SUPABASE_CONFIG.useStorageCdn) {
          img.onerror = function() {
            if (img.src !== original) {
              img.src = original;
            }
          };
          img.src = supabaseUrl;
        }
      }
    });

    console.log(`⚡ Walkaroo Smart Asset Optimizer: Managed ${images.length} images (Home Page Preview Mode: ${isHomePage})`);
  }

  // Attach to window
  window.WalkarooSupabase = WalkarooSupabase;

  // Auto-bind when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      getClient();
      initSmartImageLoading();
    });
  } else {
    getClient();
    initSmartImageLoading();
  }

  // Auto-listen to newsletter forms
  document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('form[action*="contact"], form.newsletter-form, form[id*="newsletter"]');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        const emailInput = form.querySelector('input[type="email"], input[name="contact[email]"]');
        if (emailInput && emailInput.value) {
          try {
            await WalkarooSupabase.subscribeNewsletter(emailInput.value);
            console.log('Subscribed to Walkaroo via Supabase:', emailInput.value);
          } catch (err) {
            console.warn('Newsletter notice:', err);
          }
        }
      });
    });
  });

})(window);
