/**
 * Walkaroo E-Commerce Supabase Client & Smart Page-Aware Image Integration
 * - Supabase Project: https://supabase.com/dashboard/project/zalicyoqqrfdhcsfhpau
 * - Home Page Preview Optimizer: Loads only visible viewport preview images on homepage first
 * - Other Webpages: Dynamically loads respective page images on-demand when visited
 * - Bulletproof Supabase Storage CDN retraction with 100% loop-free local fallback
 * - Automatic preloader / buffering dismiss failsafe
 */
(function(window) {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://zalicyoqqrfdhcsfhpau.supabase.co',
    anonKey: 'sb_publishable_FRs_pS0TJUWAaJl7FjOE-w_2Lv8ob66',
    projectRef: 'zalicyoqqrfdhcsfhpau',
    bucket: 'walkaroo-assets',
    useStorageCdn: true // Enables Supabase Storage CDN with automatic local fallback
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
    } else if (clean.startsWith('//www.walkaroo.in/')) {
      clean = clean.replace(/^\/\/www\.walkaroo\.in\//, '');
    } else if (clean.startsWith('//')) {
      clean = clean.replace(/^\/\//, '');
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

  // Safe image error fallback (strictly prevents infinite loops)
  function attachSafeFallback(img, originalSrc) {
    if (img.getAttribute('data-sb-handled')) return;
    img.setAttribute('data-sb-handled', 'true');

    img.onerror = function() {
      // Disarm error handler immediately to prevent infinite retry loops
      this.onerror = null;
      if (originalSrc && this.src !== originalSrc) {
        this.src = originalSrc;
      }
    };
  }

  /**
   * Smart Page-Aware Image Loading:
   * - Homepage: Only initial viewport / hero preview images load first; below-the-fold is deferred
   * - Other Webpages: Automatically loads images relevant to that page as user navigates
   */
  function initPageAwareImageLoading() {
    const pathname = window.location.pathname.toLowerCase();
    const isHomePage = pathname === '/' ||
                       pathname === '' ||
                       pathname.endsWith('/index.html') ||
                       pathname.endsWith('/www.walkaroo.in/') ||
                       pathname.endsWith('/www.walkaroo.in/index.html');

    const viewportHeight = window.innerHeight || 850;
    const images = Array.from(document.querySelectorAll('img'));

    // IntersectionObserver for lazy-loading images when nearing view
    let imageObserver = null;
    if ('IntersectionObserver' in window) {
      imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const targetSrc = img.getAttribute('data-src') || img.getAttribute('data-original-src');
            if (targetSrc) {
              const supabaseUrl = getSupabaseImageUrl(targetSrc);
              attachSafeFallback(img, targetSrc);
              img.src = (SUPABASE_CONFIG.useStorageCdn && supabaseUrl) ? supabaseUrl : targetSrc;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '300px 0px', // Pre-load slightly before scrolling into view
        threshold: 0.01
      });
    }

    images.forEach(img => {
      const currentSrc = img.getAttribute('src');
      if (!currentSrc || currentSrc.startsWith('data:image/svg+xml') || currentSrc.startsWith('data:image/gif')) {
        return;
      }

      // Check position relative to viewport
      const rect = img.getBoundingClientRect();
      const isVisibleInInitialViewport = (rect.top >= -50 && rect.top <= (viewportHeight * 1.1)) && (rect.height > 0 || rect.width > 0);

      if (isHomePage) {
        // HOME PAGE MODE:
        // Priority images in the top viewport load immediately
        // Below-the-fold or hidden carousel images are deferred until the user scrolls!
        if (!isVisibleInInitialViewport && imageObserver && rect.top > viewportHeight) {
          img.setAttribute('data-original-src', currentSrc);
          img.setAttribute('data-src', currentSrc);
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
          // Lightweight transparent placeholder SVG
          img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f3f3f3%22%2F%3E%3C%2Fsvg%3E';
          imageObserver.observe(img);
        } else {
          // Visible viewport image: load smoothly with Supabase CDN & fallback
          img.setAttribute('decoding', 'async');
          const supabaseUrl = getSupabaseImageUrl(currentSrc);
          attachSafeFallback(img, currentSrc);
          if (SUPABASE_CONFIG.useStorageCdn && supabaseUrl) {
            img.src = supabaseUrl;
          }
        }
      } else {
        // OTHER WEBPAGES (Products, Collections, Blogs, Cart, etc.):
        // Load this page's images on-demand with async decoding and CDN support
        img.setAttribute('decoding', 'async');
        const supabaseUrl = getSupabaseImageUrl(currentSrc);
        attachSafeFallback(img, currentSrc);
        if (SUPABASE_CONFIG.useStorageCdn && supabaseUrl) {
          img.src = supabaseUrl;
        }
      }
    });

    console.log(`⚡ Walkaroo Smart Asset Optimizer: Initialized (${isHomePage ? 'Home Page Preview Mode' : 'Webpage Dynamic Mode'})`);
  }

  // Preloader / Loading Bar Failsafe:
  // Smoothly hides any stuck loading animation without delay
  function dismissPreloader() {
    const bars = document.querySelectorAll('loading-bar, .loading-bar');
    bars.forEach(bar => {
      bar.style.transition = 'opacity 0.25s ease';
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      setTimeout(() => {
        bar.hidden = true;
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 300);
    });
    document.body.classList.add('loaded');
  }

  // Attach to window
  window.WalkarooSupabase = WalkarooSupabase;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      getClient();
      initPageAwareImageLoading();
      setTimeout(dismissPreloader, 150);
    });
  } else {
    getClient();
    initPageAwareImageLoading();
    setTimeout(dismissPreloader, 100);
  }

  window.addEventListener('load', dismissPreloader);
  setTimeout(dismissPreloader, 1200);

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
