# TrustChain — AI Return Fraud Detection Platform

A full-stack ecommerce platform with ML-based return fraud detection and vendor-to-customer rating system.

## Tech Stack

| Layer     | Technology           |
|-----------|----------------------|
| Frontend  | React 18 + Vite + TailwindCSS |
| Backend   | Node.js + Express    |
| ML Model  | Python + scikit-learn (RandomForest) |
| Database  | In-memory store (demo) |
| Auth      | JWT-style tokens + Aadhaar OTP |

---

## Architecture

```
Browser (React :5173)
    ↕ Vite Proxy
Node.js API (:5000)
    ↕ HTTP call
Python ML Service (:5001)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### Option 1: One-click (Windows)

```
Double-click start_all.bat
```

### Option 2: Manual (3 terminals)

**Terminal 1 — ML Service**
```bash
cd ml
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5001
```

**Terminal 2 — Node.js API**
```bash
cd server
node server.js
# Runs on http://localhost:5000
```

**Terminal 3 — React Frontend**
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Features

### 1. Auth System
- Aadhaar-based OTP login (demo OTP: `123456`)
- JWT-style token stored in localStorage
- User profile with trust score

### 2. Ecommerce System
- Product listing with categories (Electronics, Fashion, Home, Sports, Beauty)
- Add to cart, cart drawer
- Checkout with payment method selection
- Order history

### 3. Return System
- Return request form with reason
- Stored with: reason, product, timestamp, fraud score

### 4. AI Fraud Detection (RandomForest)
The ML model is trained on synthetic data with these features:
| Feature | Description |
|---------|-------------|
| `return_frequency` | Returns / Total orders (0–1) |
| `order_value` | Value of order in ₹ |
| `account_age_days` | Days since account creation |
| `past_fraud_history` | 1 if previously flagged |
| `rating_score` | Average vendor rating (1–5) |

Model: `RandomForestClassifier(n_estimators=150, class_weight='balanced')`

Output: `fraud_probability` (0.0 – 1.0)

### 5. Decision Engine
| Probability | Decision | Display |
|-------------|----------|---------|
| > 0.7       | BLOCK    | REJECTED |
| 0.4 – 0.7   | REVIEW   | UNDER REVIEW |
| < 0.4       | APPROVE  | APPROVED |

### 6. Vendor Rating System
- After a return, vendor rates customer (1–5 stars)
- `customerTrustScore = avg(ratings) / 5 × 100`
- This score feeds directly into the next ML prediction as `rating_score`

### 7. Admin Dashboard
- **Returns tab**: All returns with fraud probability bars, ML vs heuristic labels
- **Users tab**: Block/unblock users, view trust scores and fraud flags
- **Blockchain tab**: Simulated ledger of all return transactions

---

## API Endpoints

### Auth
```
POST /api/auth/send-otp        { aadhaar }
POST /api/auth/verify-otp      { aadhaar, otp }
POST /api/auth/login           { email, password }   ← Admin
GET  /api/auth/me              Authorization: Bearer <token>
```

### Products
```
GET  /api/products             ?category=Electronics
GET  /api/products/:id
```

### Orders
```
POST /api/orders               { items, total }       requires token
GET  /api/orders/:userId
```

### Returns
```
POST /api/returns              { order_id, reason }   requires token  → calls ML
GET  /api/returns/:userId
```

### Fraud Predict
```
POST /api/fraud-predict        { return_frequency, order_value, account_age_days, past_fraud_history, rating_score }
```

### Ratings
```
POST /api/ratings              { customerId, returnId, rating, vendorId }
GET  /api/ratings/:customerId
```

### Admin
```
GET  /api/admin/stats
GET  /api/admin/returns
GET  /api/admin/users
POST /api/admin/block-user     { userId }
POST /api/admin/unblock-user   { userId }
GET  /api/admin/chain
GET  /api/admin/validate
```

---

## Demo Credentials

### Customer Login
| Name | Aadhaar | Profile |
|------|---------|---------|
| Priya Sharma | `234567890123` | Low risk, trusted customer |
| Fraud Test User | `111122223333` | High risk, pre-flagged |

OTP for all: **`123456`**

### Admin Login
URL: http://localhost:5173/admin  
Password: **`admin123`**

---

## Full Flow Demo

```
1. Open http://localhost:5173
2. Enter Aadhaar: 234567890123 → Send OTP
3. Enter OTP: 123456 → Logged in as Priya Sharma
4. Add products to cart → Checkout → Place Order
5. Go to Order History → Request Return → Enter reason
6. Watch AI Analysis animation
7. See Fraud Score + Decision (APPROVED / REVIEW / REJECTED)
8. Rate the vendor (1–5 stars) → Trust score updates
9. Open http://localhost:5173/admin (password: admin123)
10. View Returns tab → see fraud probability bars
11. View Users tab → block/unblock users
12. View Blockchain tab → ledger of all transactions
```
