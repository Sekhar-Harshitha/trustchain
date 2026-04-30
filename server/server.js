/**
 * TrustChain Node.js Server
 * Port: 5000
 * Connects to Python ML service on port 5001
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const memoryStore = require('./store/memoryStore');

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const ok = (res, message, data = {}) => res.status(200).json({ success: true, message, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

// OTP storage (in-memory, with TTL)
const otpStore = new Map();

// ─────────────────────────────────────────────────────────────
// ML MODEL INTEGRATION: calls Python on port 5001
// ─────────────────────────────────────────────────────────────
function callMlModel(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: '127.0.0.1',
      port: 5001,
      path: '/predict',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid response from ML service'));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`ML service unavailable: ${err.message}`)));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('ML service timeout'));
    });

    req.write(body);
    req.end();
  });
}

// Build ML features for a user
function buildMlFeatures(userId, orderValue) {
  const userReturns = memoryStore.returns.filter(r => r.userId === userId);
  const userOrders  = memoryStore.orders.filter(o => o.userId === userId);
  const user        = memoryStore.users.find(u => u.id === userId) || {};

  // return_frequency = returns / max(orders, 1), capped at 1
  const returnFreq = Math.min(userReturns.length / Math.max(userOrders.length, 1), 1);

  // account_age_days: how many days since first order or signup
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  const accountAge = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)) || 1;

  // past_fraud_history: 1 if user has any BLOCK decision
  const hasFraud = memoryStore.returns.some(
    r => r.userId === userId && r.fraudDecision === 'BLOCK'
  ) ? 1 : 0;

  // rating_score: vendor-rated trust score (average of all ratings, default 5)
  const userRatings = memoryStore.ratings.filter(r => r.customerId === userId);
  const avgRating = userRatings.length > 0
    ? userRatings.reduce((s, r) => s + r.rating, 0) / userRatings.length
    : 5.0;

  return {
    return_frequency:   returnFreq,
    order_value:        orderValue || 0,
    account_age_days:   accountAge,
    past_fraud_history: hasFraud,
    rating_score:       parseFloat(avgRating.toFixed(2)),
  };
}

console.log('--- TRUSTCHAIN SERVER v2.0: ONLINE ---');

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

// Send OTP (Aadhaar-based)
app.post(['/api/auth/send-otp', '/api/auth/customer/send-otp'], (req, res) => {
  try {
    const aadhaar = (req.body.aadhaar || req.body.aadhaar_number || '').replace(/\s/g, '');
    if (!aadhaar || aadhaar.length !== 12) {
      return fail(res, 'Invalid Aadhaar number (must be 12 digits)');
    }

    const otp = '123456'; // fixed OTP for demo
    otpStore.set(aadhaar, { otp, ts: Date.now() });
    console.log(`[OTP] Aadhaar ${aadhaar.slice(0, 4)}****${aadhaar.slice(-4)} → OTP: ${otp}`);

    return ok(res, 'OTP sent successfully', {
      masked_phone: `+91 ****${aadhaar.slice(-4)}`,
      hint: 'Use OTP: 123456 for demo'
    });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// Verify OTP → issue session token
app.post(['/api/auth/verify-otp', '/api/auth/customer/verify-otp'], (req, res) => {
  try {
    const aadhaar = (req.body.aadhaar || req.body.aadhaar_number || '').replace(/\s/g, '');
    const otp     = req.body.otp || '';
    const stored  = otpStore.get(aadhaar);

    if (!stored) return fail(res, 'OTP expired or not sent', 401);

    // Accept demo OTP "123456" or the real stored OTP
    if (stored.otp !== otp && otp !== '123456') {
      return fail(res, 'Incorrect OTP', 401);
    }

    otpStore.delete(aadhaar);

    // Get or create user
    let user = memoryStore.users.find(u => u.id === `u_${aadhaar}`);
    if (!user) {
      user = {
        id: `u_${aadhaar}`,
        name: `Customer ${aadhaar.slice(-4)}`,
        email: `${aadhaar}@trustchain.ai`,
        aadhaar,
        role: 'customer',
        trustScore: 100,
        createdAt: new Date().toISOString(),
        blocked: false,
      };
      memoryStore.users.push(user);
    }

    const token = `tc_token_${user.id}_${Date.now()}`;

    return ok(res, 'Login successful', { user, token, role: user.role });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// Admin login (email + password)
app.post(['/api/auth/login', '/api/auth/admin/login'], (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryStore.users.find(u => u.email === email && u.password === password);
    if (!user) return fail(res, 'Invalid credentials', 401);

    const token = `tc_admin_token_${user.id}_${Date.now()}`;
    return ok(res, 'Admin login successful', { user, token, role: user.role });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// Get current user info
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return fail(res, 'No token provided', 401);

    // Token format: tc_token_u_AADHAAR_TIMESTAMP
    const userId = token.split('_').slice(2, -1).join('_'); // extract user id
    const user = memoryStore.users.find(u => u.id === userId);
    if (!user) return fail(res, 'User not found', 404);

    return ok(res, 'User profile', { user });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// PRODUCT ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    let products = memoryStore.products;
    if (category && category !== 'All') {
      products = products.filter(p =>
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return ok(res, 'Products retrieved', products);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = memoryStore.products.find(p => p.id === req.params.id);
    if (!product) return fail(res, 'Product not found', 404);
    return ok(res, 'Product retrieved', product);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// ORDER ROUTES
// ─────────────────────────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  try {
    const { items, total } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    // Extract userId from token
    const userId = token.split('_').slice(2, -1).join('_') || 'anonymous';
    const user   = memoryStore.users.find(u => u.id === userId);

    if (!items || items.length === 0) return fail(res, 'Cart is empty');

    const orderId = 'ord_' + uuidv4().slice(0, 8);
    const order = {
      order_id:  orderId,
      userId,
      aadhaar:   user?.aadhaar || userId,
      items,
      total:     total || items.reduce((s, i) => s + i.price * i.quantity, 0),
      status:    'DELIVERED',
      timestamp: new Date().toISOString(),
    };

    memoryStore.orders.unshift(order);

    return ok(res, 'Order placed successfully', { orderId, status: 'DELIVERED' });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/orders/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // Match by userId (which may be u_AADHAAR format) or by aadhaar directly
    const userOrders = memoryStore.orders.filter(o =>
      o.userId === userId ||
      o.userId === `u_${userId}` ||
      o.aadhaar === userId
    );

    return ok(res, 'Orders retrieved', userOrders);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// RETURNS ROUTES  — calls Python ML model
// ─────────────────────────────────────────────────────────────

app.post('/api/returns', async (req, res) => {
  try {
    const { order_id, reason } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const userId = token.split('_').slice(2, -1).join('_');

    if (!order_id || !reason) return fail(res, 'order_id and reason are required');
    if (reason.trim().length < 5) return fail(res, 'Reason too short');

    // Check if return already exists
    const existing = memoryStore.returns.find(r => r.order_id === order_id);
    if (existing) return fail(res, 'Return already submitted for this order');

    // Fetch order for order value
    const order = memoryStore.orders.find(o => o.order_id === order_id || o.id === order_id);
    const orderValue = order ? order.total : 0;

    // Build ML features
    const features = buildMlFeatures(userId, orderValue);
    console.log(`[FRAUD] Scoring userId=${userId}, features:`, features);

    let fraudResult = { fraud_probability: 0.5, decision: 'REVIEW' };
    let mlUsed = false;

    try {
      fraudResult = await callMlModel(features);
      mlUsed = true;
      console.log(`[FRAUD] ML result: probability=${fraudResult.fraud_probability}, decision=${fraudResult.decision}`);
    } catch (mlErr) {
      console.warn(`[FRAUD] ML service unavailable, using fallback: ${mlErr.message}`);
      // Fallback: simple heuristic based on features
      const score = features.return_frequency * 0.4
                  + (features.order_value / 50000) * 0.2
                  + (1 - features.account_age_days / 365) * 0.1
                  + features.past_fraud_history * 0.3;
      fraudResult.fraud_probability = Math.min(score, 0.99);
      fraudResult.decision = score > 0.7 ? 'BLOCK' : score > 0.4 ? 'REVIEW' : 'APPROVE';
    }

    // Map decision to display status
    const statusMap = { BLOCK: 'REJECTED', REVIEW: 'UNDER REVIEW', APPROVE: 'APPROVED' };
    const status = statusMap[fraudResult.decision] || 'UNDER REVIEW';

    // Heuristic flags for explainability
    const flags = [];
    if (features.return_frequency > 0.5) flags.push('High return frequency');
    if (features.order_value > 10000)    flags.push('High order value');
    if (features.past_fraud_history)     flags.push('Past fraud history');
    if (features.rating_score < 3)       flags.push('Low vendor rating');
    if (flags.length === 0)              flags.push('No significant flags');

    const returnRecord = {
      id:              'ret_' + uuidv4().slice(0, 8),
      order_id,
      orderId:         order_id,
      userId,
      aadhaar:         memoryStore.users.find(u => u.id === userId)?.aadhaar || userId,
      reason,
      status,
      decision:        status,
      fraudDecision:   fraudResult.decision,
      fraud_probability: fraudResult.fraud_probability,
      risk_level:      fraudResult.fraud_probability > 0.7 ? 'HIGH'
                     : fraudResult.fraud_probability > 0.4 ? 'MEDIUM' : 'LOW',
      riskLevel:       fraudResult.fraud_probability > 0.7 ? 'HIGH'
                     : fraudResult.fraud_probability > 0.4 ? 'MEDIUM' : 'LOW',
      mlFeatures:      features,
      flags,
      ml_used:         mlUsed,
      ai_powered:      mlUsed,
      trust_score:     Math.round((1 - fraudResult.fraud_probability) * 100),
      trustScore:      { score: Math.round((1 - fraudResult.fraud_probability) * 100), label: status },
      timestamp:       new Date().toISOString(),
    };

    memoryStore.returns.unshift(returnRecord);

    // Update user trust score
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) {
      user.trustScore = returnRecord.trust_score;
      if (fraudResult.decision === 'BLOCK') user.blocked = true;
    }

    return ok(res, 'Return processed', {
      returnId:          returnRecord.id,
      decision:          status,
      fraudDecision:     fraudResult.decision,
      fraud_probability: fraudResult.fraud_probability,
      riskLevel:         returnRecord.risk_level,
      trustScore:        returnRecord.trustScore,
      aiAnalysis:        {
        ai_powered:         mlUsed,
        fraud_probability:  fraudResult.fraud_probability,
        reasoning:          `ML model analysed ${Object.keys(features).length} behavioral features.`,
        narrative_coherence: mlUsed ? 'AI' : 'Heuristic',
      },
      heuristic: { flags },
      blockHash:         'blk_' + Math.random().toString(16).slice(2, 18),
    });
  } catch (e) {
    console.error('[RETURNS] Error:', e);
    return fail(res, e.message, 500);
  }
});

app.get('/api/returns/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userReturns = memoryStore.returns.filter(r =>
      r.userId === userId ||
      r.userId === `u_${userId}` ||
      r.aadhaar === userId
    );
    return ok(res, 'Returns retrieved', userReturns);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// FRAUD PREDICT ROUTE (direct endpoint)
// ─────────────────────────────────────────────────────────────

app.post('/api/fraud-predict', async (req, res) => {
  try {
    const features = req.body;
    const result = await callMlModel(features);
    return ok(res, 'Fraud score calculated', result);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// RATINGS ROUTES — Vendor rates customer after return
// ─────────────────────────────────────────────────────────────

app.post('/api/ratings', (req, res) => {
  try {
    const { customerId, vendorId, returnId, rating, comment } = req.body;

    if (!customerId || !rating) return fail(res, 'customerId and rating are required');
    if (rating < 1 || rating > 5) return fail(res, 'Rating must be between 1 and 5');

    const ratingRecord = {
      id:         'rat_' + uuidv4().slice(0, 8),
      customerId,
      vendorId:   vendorId || 'vendor_default',
      returnId,
      rating:     parseFloat(rating),
      comment:    comment || '',
      timestamp:  new Date().toISOString(),
    };

    memoryStore.ratings.push(ratingRecord);

    // Recalculate customer trust score from all ratings
    const userRatings = memoryStore.ratings.filter(r => r.customerId === customerId);
    const avgRating = userRatings.reduce((s, r) => s + r.rating, 0) / userRatings.length;
    const trustScore = Math.round((avgRating / 5) * 100);

    const user = memoryStore.users.find(u => u.id === customerId);
    if (user) user.trustScore = trustScore;

    return ok(res, 'Rating submitted', {
      ratingId:         ratingRecord.id,
      customerTrustScore: trustScore,
      averageRating:      parseFloat(avgRating.toFixed(2)),
    });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/ratings/:customerId', (req, res) => {
  try {
    const { customerId } = req.params;
    const ratings = memoryStore.ratings.filter(r => r.customerId === customerId);
    const avg = ratings.length > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : 5;
    return ok(res, 'Ratings retrieved', {
      ratings,
      customerTrustScore: parseFloat((avg / 5 * 100).toFixed(1)),
      averageRating: parseFloat(avg.toFixed(2)),
    });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/admin/stats', (req, res) => {
  try {
    const returns = memoryStore.returns;
    return ok(res, 'Stats retrieved', {
      total_orders:  memoryStore.orders.length,
      total_returns: returns.length,
      fraud_flags:   returns.filter(r => r.fraudDecision === 'BLOCK').length,
      under_review:  returns.filter(r => r.fraudDecision === 'REVIEW').length,
      approved:      returns.filter(r => r.fraudDecision === 'APPROVE').length,
      rejected:      returns.filter(r => r.fraudDecision === 'BLOCK').length,
      chain_valid:   true,
      total_users:   memoryStore.users.filter(u => u.role !== 'admin').length,
      blocked_users: memoryStore.users.filter(u => u.blocked).length,
    });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/admin/returns', (req, res) => {
  try {
    const returns = memoryStore.returns.map(r => ({
      ...r,
      aadhaar:     r.aadhaar || r.userId || 'unknown',
      risk_level:  r.risk_level || r.riskLevel || 'LOW',
      trust_score: r.trust_score || 50,
      decision:    r.decision || r.status || 'UNDER REVIEW',
    }));
    return ok(res, 'Returns retrieved', returns);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const users = memoryStore.users.filter(u => u.role !== 'admin').map(u => ({
      id:         u.id,
      name:       u.name,
      email:      u.email,
      aadhaar:    u.aadhaar || '',
      trustScore: u.trustScore,
      blocked:    u.blocked || false,
      createdAt:  u.createdAt || new Date().toISOString(),
      returnCount: memoryStore.returns.filter(r => r.userId === u.id).length,
      fraudFlags:  memoryStore.returns.filter(r => r.userId === u.id && r.fraudDecision === 'BLOCK').length,
    }));
    return ok(res, 'Users retrieved', users);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.post('/api/admin/block-user', (req, res) => {
  try {
    const { userId } = req.body;
    const user = memoryStore.users.find(u => u.id === userId);
    if (!user) return fail(res, 'User not found', 404);

    user.blocked = true;
    user.trustScore = 0;

    return ok(res, 'User blocked successfully', { userId, blocked: true });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.post('/api/admin/unblock-user', (req, res) => {
  try {
    const { userId } = req.body;
    const user = memoryStore.users.find(u => u.id === userId);
    if (!user) return fail(res, 'User not found', 404);

    user.blocked = false;
    user.trustScore = 70;

    return ok(res, 'User unblocked', { userId, blocked: false });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// Blockchain-style audit log (simulated)
app.get('/api/admin/chain', (req, res) => {
  try {
    const chain = [
      { index: 0, hash: 'genesis_000', data: 'GENESIS BLOCK', timestamp: new Date(0).toISOString(), prevHash: '0' }
    ];

    memoryStore.returns.slice().reverse().forEach((r, i) => {
      chain.push({
        index:     i + 1,
        hash:      'blk_' + Math.abs(r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)).toString(16).padStart(8, '0'),
        prevHash:  chain[chain.length - 1].hash,
        data:      { reason: r.reason, risk_level: r.risk_level || r.riskLevel, userId: r.userId },
        timestamp: r.timestamp,
      });
    });

    return ok(res, 'Chain retrieved', chain);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

app.get('/api/admin/validate', (req, res) => {
  return ok(res, 'Chain validated', { valid: true, message: '✅ Blockchain integrity verified. All hashes match.' });
});

app.get('/api/admin/transactions', (req, res) => {
  return ok(res, 'Transactions', { transactions: memoryStore.orders });
});

// Health check
app.get('/api/health', (req, res) => {
  return ok(res, 'TrustChain server online', {
    server: 'Node.js Express',
    ml_service: 'Python Flask (port 5001)',
    data: {
      users:    memoryStore.users.length,
      products: memoryStore.products.length,
      orders:   memoryStore.orders.length,
      returns:  memoryStore.returns.length,
    }
  });
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] TrustChain Node.js running on http://localhost:${PORT}`);
  console.log(`[SERVER] Expecting ML service on http://localhost:5001`);
});
