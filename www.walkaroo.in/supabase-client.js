/**
 * Walkaroo E-Commerce Supabase Client Integration
 * Connects the web storefront with Supabase database & auth
 */
(function(window) {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://ofgaqwoslqeaxwhpcjqs.supabase.co',
    anonKey: 'sb_publishable_BBz18QCYvDjMyfXoh5nP5g_lbMxzVO-',
    projectRef: 'ofgaqwoslqeaxwhpcjqs'
  };

  let client = null;

  function getClient() {
    if (!client) {
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      } else {
        console.warn('Supabase JS SDK not loaded yet. Waiting for script...');
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

  const WalkarooSupabase = {
    config: SUPABASE_CONFIG,
    getClient,
    getSessionId,

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

  // Attach to window
  window.WalkarooSupabase = WalkarooSupabase;

  // Auto-bind to newsletter and forms when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    getClient();

    // Listen to newsletter forms
    const newsletterForms = document.querySelectorAll('form[action*="contact"], form.newsletter-form, form[id*="newsletter"]');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', async function(e) {
        const emailInput = form.querySelector('input[type="email"], input[name="contact[email]"]');
        if (emailInput && emailInput.value) {
          try {
            await WalkarooSupabase.subscribeNewsletter(emailInput.value);
            console.log('Subscribed to Walkaroo via Supabase:', emailInput.value);
          } catch (err) {
            console.warn('Newsletter sync to Supabase notice:', err);
          }
        }
      });
    });
  });

})(window);
