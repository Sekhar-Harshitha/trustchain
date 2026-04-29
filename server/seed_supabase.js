const supabase = require('./db');
const { v4: uuidv4 } = require('uuid');

const products = [
  {
    id: uuidv4(),
    name: "iPhone 15 Pro Max",
    price: 1099,
    image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80",
    category: "Electronics",
    description: "The ultimate iPhone with Titanium design and A17 Pro chip."
  },
  {
    id: uuidv4(),
    name: "MacBook Air M3",
    price: 1299,
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    category: "Electronics",
    description: "Strikingly thin and fast so you can work, play, or create anywhere."
  },
  {
    id: uuidv4(),
    name: "Sony WH-1000XM5",
    price: 399,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "Electronics",
    description: "Industry leading noise canceling headphones with exceptional sound."
  },
  {
    id: uuidv4(),
    name: "Nike Air Jordan 1",
    price: 170,
    image_url: "https://images.unsplash.com/photo-1584735175315-9d58238a06ca?w=800&q=80",
    category: "Fashion",
    description: "Classic design meets modern comfort in this iconic silhouette."
  },
  {
    id: uuidv4(),
    name: "Designer Silk Scarf",
    price: 120,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    category: "Fashion",
    description: "Elegant silk scarf with hand-painted patterns."
  },
  {
    id: uuidv4(),
    name: "Minimalist Lounge Chair",
    price: 850,
    image_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    category: "Furniture",
    description: "A perfect blend of style and ergonomics for your living space."
  },
  {
    id: uuidv4(),
    name: "Solid Oak Dining Table",
    price: 1200,
    image_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80",
    category: "Furniture",
    description: "Handcrafted from sustainable European oak."
  },
  {
    id: uuidv4(),
    name: "Smart Coffee Maker",
    price: 249,
    image_url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
    category: "Home",
    description: "Brew your perfect cup from your phone."
  },
  {
    id: uuidv4(),
    name: "Aromatic Diffuser Set",
    price: 65,
    image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
    category: "Home",
    description: "Transform your home with soothing natural scents."
  },
  {
    id: uuidv4(),
    name: "Premium Yoga Mat",
    price: 85,
    image_url: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80",
    category: "Sports",
    description: "Non-slip surface for the ultimate yoga experience."
  }
];

async function seed() {
  console.log('--- STARTING DATABASE SEED ---');
  
  try {
    // 1. Clear existing products (optional but good for clean seed)
    // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 2. Insert new products
    const { data, error } = await supabase.from('products').insert(products);
    
    if (error) {
      console.error('[SEED ERROR]', error);
    } else {
      console.log('[SEED SUCCESS] 10 Products Added to Marketplace.');
    }
  } catch (err) {
    console.error('[SEED FATAL ERROR]', err);
  }
}

seed();
