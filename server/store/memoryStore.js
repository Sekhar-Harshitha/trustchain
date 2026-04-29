// server/store/memoryStore.js

const memoryStore = {
  users: [
    { id: "u1", email: "user@demo.com", password: "demo123", name: "Demo User", trustScore: 100 },
    { id: "u2", email: "fraud@demo.com", password: "fraud123", name: "Fraud Simulation", trustScore: 45 },
    { id: "admin", email: "admin@demo.com", password: "admin123", name: "Admin User", trustScore: 100 }
  ],
  products: [
    { id: "p1", name: "Silken Rose Gown", price: 12500, category: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500", description: "Elegant floor-length silk gown in dusty rose." },
    { id: "p2", name: "Mint Breeze Blouse", price: 4500, category: "Tops", image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=500", description: "Lightweight linen blouse in pastel mint." },
    { id: "p3", name: "Lavender Dream Skirt", price: 6800, category: "Bottoms", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500", description: "Flowy lavender skirt with subtle pleats." },
    { id: "p4", name: "Pearl Essence Cardigan", price: 8200, category: "Outerwear", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500", description: "Hand-knitted wool cardigan with pearl buttons." },
    { id: "p5", name: "Azure Mist Trousers", price: 9500, category: "Bottoms", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500", description: "High-waisted trousers in soft azure blue." },
    { id: "p6", name: "Peach Blossom Sun-dress", price: 5900, category: "Dresses", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500", description: "Floral print sun-dress for warm afternoons." },
    { id: "p7", name: "Celestial Silk Scarf", price: 2500, category: "Accessories", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", description: "Pure silk scarf with celestial motifs." },
    { id: "p8", name: "Ivory Shell Top", price: 3800, category: "Tops", image: "https://images.unsplash.com/photo-1618333234901-b541e8c7c100?w=500", description: "Classic ivory shell top for effortless layering." },
    { id: "p9", name: "Dusk Velvet Blazer", price: 15000, category: "Outerwear", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500", description: "Rich velvet blazer in deep dusk blue." },
    { id: "p10", name: "Cloud Walker Sandals", price: 7200, category: "Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500", description: "Ultra-comfortable leather sandals." },
    { id: "p11", name: "Midnight Bloom Tote", price: 5400, category: "Accessories", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", description: "Spacious tote bag with embroidered florals." },
    { id: "p12", name: "Starlight Pendants", price: 11000, category: "Accessories", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500", description: "Handcrafted silver pendants with zircon crystals." }
  ],
  orders: [],
  returns: [
    // Pre-seeded returns for u2 (fraud simulation)
    { id: "ret_init_1", userId: "u2", orderId: "ord_init_1", reason: "scam didn't order", status: "REJECTED", riskLevel: "HIGH", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "ret_init_2", userId: "u2", orderId: "ord_init_2", reason: "fake item", status: "REJECTED", riskLevel: "HIGH", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  blockchain: []
};

module.exports = memoryStore;
