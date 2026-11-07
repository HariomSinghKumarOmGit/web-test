// Vercel Serverless Function for Cart API
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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const action = req.query?.action || '';

  if (action === 'clear.js' || action === 'clear') {
    cartState.items = [];
    cartState.item_count = 0;
    cartState.total_price = 0;
    return res.status(200).json(cartState);
  }

  if (action && (action.includes('add') || action.includes('update') || action.includes('change'))) {
    return res.status(200).json({
      ...cartState,
      status: 200,
      sections: {}
    });
  }

  return res.status(200).json(cartState);
}
