/**
 * Walkaroo E-Commerce Supabase Client Integration
 * - Database queries (Products, Collections, Blogs, Orders, Newsletter, Cart)
 * - Safe, non-blocking asset delivery (uses local mirrors with zero glitching)
 * - Automatic preloader / buffer dismiss failsafe
 */
(function(window) {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://ofgaqwoslqeaxwhpcjqs.supabase.co',
    anonKey: 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-',
    projectRef: 'ofgaqwoslqeaxwhpcjqs',
    bucket: 'walkaroo-assets',
    useStorageCdn: false // Keep false to use fast reliable local/CDN assets without 404 buffers
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

  // Convert local/CDN path to Supabase Storage public CDN URL (if enabled)
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

  // Preloader / Loading Bar Failsafe:
  // Ensure the page loading spinner smoothly disappears and never stays stuck buffering
  function dismissPreloader() {
    const bars = document.querySelectorAll('loading-bar, .loading-bar');
    bars.forEach(bar => {
      bar.style.transition = 'opacity 0.3s ease';
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      setTimeout(() => {
        bar.hidden = true;
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 350);
    });
    document.body.classList.add('loaded');
  }

  // Safe image error handler preventing infinite loops
  function setupImageSafeFallback() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('data-err-handled')) {
        img.setAttribute('data-err-handled', 'true');
        const originalError = img.onerror;
        img.onerror = function() {
          this.onerror = null; // Prevent infinite error recursion
          if (typeof originalError === 'function') {
            try { originalError.call(this); } catch(e) {}
          }
        };
      }
    });
  }

  // Attach to window
  window.WalkarooSupabase = WalkarooSupabase;

  // Auto-bind when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      getClient();
      setupImageSafeFallback();
      setTimeout(dismissPreloader, 200);
    });
  } else {
    getClient();
    setupImageSafeFallback();
    setTimeout(dismissPreloader, 100);
  }

  window.addEventListener('load', dismissPreloader);
  // Hard safety timeout to guarantee spinner never stays stuck
  setTimeout(dismissPreloader, 1500);

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
