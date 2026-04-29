const express = require('express');
const cors = require('cors');
const supabase = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE FOR DEMO STABILITY ---
let ORDERS_DB = [
  {
    id: "vibe-sync-init-" + Math.random().toString(36).substr(2, 5),
    user_id: "Sivavidhya Pugazhenthi",
    total: 399,
    status: 'delivered',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    order_items: [
      {
        quantity: 1,
        products: { name: "Sony WH-1000XM5", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", price: 399 }
      }
    ]
  }
];

let RETURNS_DB = [
  {
    id: uuidv4(),
    user_id: "Sivavidhya Pugazhenthi",
    reason: "Damaged on arrival",
    fraud_score: 12,
    status: 'pending',
    created_at: new Date().toISOString(),
    products: { name: "Sony WH-1000XM5", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" }
  },
  {
    id: uuidv4(),
    user_id: "GUEST_USER",
    reason: "Changed my mind",
    fraud_score: 85,
    status: 'pending',
    created_at: new Date().toISOString(),
    products: { name: "iPhone 15 Pro", image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80" }
  }
];

const FALLBACK_PRODUCTS = [
  { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", name: "Sony WH-1000XM5", price: 399, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", category: "Electronics" },
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "iPhone 15 Pro", price: 999, image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80", category: "Electronics" },
  { id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", name: "Nike Air Jordan 1", price: 170, image_url: "https://images.unsplash.com/photo-1584735175315-9d58238a06ca?w=800&q=80", category: "Fashion" },
  { id: "e4eaaaf2-d142-11e1-b3e4-080027620cdd", name: "MacBook Air M3", price: 1299, image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", category: "Electronics" }
];

console.log('--- VIBE MARKET v7.0: FULL STACK STABILITY ACTIVE ---');

// 1. Products (GET)
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data || data.length === 0) return res.json(FALLBACK_PRODUCTS);
    res.json(data);
  } catch (err) {
    res.json(FALLBACK_PRODUCTS);
  }
});

// 2. Checkout (POST)
app.post('/api/checkout', async (req, res) => {
  const { items, userId } = req.body;
  const safeId = userId || 'GUEST_USER';
  try {
    const orderId = uuidv4();
    const newOrder = {
      id: orderId,
      user_id: safeId,
      total: items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      status: 'placed',
      created_at: new Date().toISOString(),
      order_items: items.map(i => ({
        quantity: i.quantity,
        products: { name: i.name, image_url: i.image_url, price: i.price }
      }))
    };
    ORDERS_DB.unshift(newOrder);
    res.json({ success: true, order_id: orderId });
  } catch (err) {
    res.json({ success: true, order_id: `MOCK-${Date.now()}` });
  }
});

// 3. Orders (GET)
app.get('/api/orders', (req, res) => res.json(ORDERS_DB));

// 4. Returns (GET/POST)
app.get('/api/returns', (req, res) => res.json(RETURNS_DB));
app.post('/api/returns', (req, res) => {
  const newReturn = { ...req.body, id: uuidv4(), status: 'pending', created_at: new Date().toISOString() };
  RETURNS_DB.unshift(newReturn);
  res.json({ success: true, return: newReturn });
});

// 5. Admin Actions
app.post('/api/admin/returns/:id/action', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ret = RETURNS_DB.find(r => r.id === id);
  if (ret) ret.status = status;
  res.json({ success: true });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`[SERVER] Vibe Market Node v7.0 Online on ${PORT}`));
