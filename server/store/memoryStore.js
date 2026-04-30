// server/store/memoryStore.js

const memoryStore = {
  users: [
    // Admin user
    {
      id: 'admin',
      email: 'admin@trustchain.ai',
      password: 'admin123',
      name: 'Admin',
      role: 'admin',
      trustScore: 100,
      blocked: false,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Demo customer — low risk
    {
      id: 'u_234567890123',
      email: '234567890123@trustchain.ai',
      aadhaar: '234567890123',
      name: 'Priya Sharma',
      role: 'customer',
      trustScore: 92,
      blocked: false,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Demo customer — high risk
    {
      id: 'u_111122223333',
      email: '111122223333@trustchain.ai',
      aadhaar: '111122223333',
      name: 'Fraud Test User',
      role: 'customer',
      trustScore: 22,
      blocked: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  products: [
    { id: 'p1',  name: 'Silken Rose Gown',         price: 12500, category: 'Fashion',     image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'Elegant floor-length silk gown in dusty rose.' },
    { id: 'p2',  name: 'Wireless Noise-Cancel Headphones', price: 8999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', description: 'Premium ANC headphones with 30-hour battery.' },
    { id: 'p3',  name: 'Lavender Dream Skirt',      price: 6800, category: 'Fashion',     image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', description: 'Flowy lavender skirt with subtle pleats.' },
    { id: 'p4',  name: 'Smart Watch Pro',           price: 24999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', description: 'Health tracking, GPS, AMOLED display.' },
    { id: 'p5',  name: 'Artisan Coffee Maker',      price: 18500, category: 'Home',       image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', description: 'Italian espresso machine for home baristas.' },
    { id: 'p6',  name: 'Peach Blossom Sundress',    price: 5900, category: 'Fashion',     image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', description: 'Floral print sun-dress for warm afternoons.' },
    { id: 'p7',  name: 'Luxury Yoga Mat',           price: 4200, category: 'Sports',     image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', description: 'Non-slip cork yoga mat, eco-friendly.' },
    { id: 'p8',  name: 'Vitamin C Serum Kit',       price: 3500, category: 'Beauty',     image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=500', description: 'Brightening serum with hyaluronic acid.' },
    { id: 'p9',  name: 'Dusk Velvet Blazer',        price: 15000, category: 'Fashion',   image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', description: 'Rich velvet blazer in deep dusk blue.' },
    { id: 'p10', name: 'Mechanical Keyboard RGB',   price: 11200, category: 'Electronics', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', description: 'TKL mechanical keyboard with Cherry MX switches.' },
    { id: 'p11', name: 'Minimalist Wall Clock',     price: 2800, category: 'Home',       image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Scandi-style silent-sweep wall clock.' },
    { id: 'p12', name: 'Starlight Silver Pendant',  price: 11000, category: 'Beauty',    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', description: 'Handcrafted silver pendant with zircon crystals.' },
  ],

  orders: [
    // Pre-seeded orders for demo users
    {
      order_id: 'ord_demo_001',
      userId: 'u_234567890123',
      aadhaar: '234567890123',
      items: [{ id: 'p1', name: 'Silken Rose Gown', price: 12500, quantity: 1 }],
      total: 12500,
      status: 'DELIVERED',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      order_id: 'ord_demo_002',
      userId: 'u_234567890123',
      aadhaar: '234567890123',
      items: [{ id: 'p2', name: 'Wireless Noise-Cancel Headphones', price: 8999, quantity: 1 }],
      total: 8999,
      status: 'DELIVERED',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      order_id: 'ord_fraud_001',
      userId: 'u_111122223333',
      aadhaar: '111122223333',
      items: [{ id: 'p4', name: 'Smart Watch Pro', price: 24999, quantity: 2 }],
      total: 49998,
      status: 'DELIVERED',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  returns: [
    // Pre-seeded return for fraud user to show ML in action
    {
      id:               'ret_pre_001',
      order_id:         'ord_fraud_001',
      orderId:          'ord_fraud_001',
      userId:           'u_111122223333',
      aadhaar:          '111122223333',
      reason:           'Not working, totally broken and fake',
      status:           'REJECTED',
      decision:         'REJECTED',
      fraudDecision:    'BLOCK',
      fraud_probability: 0.82,
      risk_level:       'HIGH',
      riskLevel:        'HIGH',
      trust_score:      18,
      trustScore:       { score: 18, label: 'High Risk' },
      flags:            ['High return frequency', 'Past fraud history', 'High order value'],
      ml_used:          false,
      ai_powered:       false,
      timestamp:        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  ratings: [
    // Pre-seeded vendor rating for fraud user (low rating)
    {
      id:          'rat_pre_001',
      customerId:  'u_111122223333',
      vendorId:    'vendor_default',
      returnId:    'ret_pre_001',
      rating:      1.5,
      comment:     'Suspicious return behavior',
      timestamp:   new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

module.exports = memoryStore;
