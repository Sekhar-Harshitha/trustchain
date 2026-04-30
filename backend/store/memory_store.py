import uuid
import random
from datetime import datetime, timedelta

users = {}          # token -> { aadhaar, name, state, dob, trust_score, total_orders, account_age_days, avg_narrative_score }
orders = {}         # order_id -> { order_id, aadhaar, items, total, timestamp, status }
returns = []        # list of return dicts
otp_store = {}      # aadhaar -> { otp, expires_at }
sessions = {}       # token -> user dict

AADHAAR_DB = {
  "234567890123": { "name": "Priya Sharma",    "dob": "1995-03-12", "state": "Tamil Nadu" },
  "345678901234": { "name": "Rahul Verma",     "dob": "1988-07-24", "state": "Karnataka" },
  "456789012345": { "name": "Ananya Iyer",     "dob": "2001-11-05", "state": "Maharashtra" },
  "111122223333": { "name": "Fraud Test User", "dob": "1990-01-01", "state": "Delhi" },
}

PRODUCTS = [
    {"id": "p1", "name": "boAt Airdopes 141", "price": 1499, "category": "Electronics", "image": "https://picsum.photos/seed/p1/400/400", "rating": 4.2, "description": "Wireless earbuds with 42H playtime"},
    {"id": "p2", "name": "Sony Bravia 55\" 4K TV", "price": 62990, "category": "Electronics", "image": "https://picsum.photos/seed/p2/400/400", "rating": 4.8, "description": "Ultra HD Smart LED Google TV"},
    {"id": "p3", "name": "OnePlus Nord CE 3", "price": 26999, "category": "Electronics", "image": "https://picsum.photos/seed/p3/400/400", "rating": 4.3, "description": "5G Smartphone with 50MP Camera"},
    {"id": "p4", "name": "Apple iPad Air (M1)", "price": 54900, "category": "Electronics", "image": "https://picsum.photos/seed/p4/400/400", "rating": 4.9, "description": "10.9-inch Liquid Retina display"},
    {"id": "p5", "name": "Lenovo IdeaPad Slim 3", "price": 34990, "category": "Electronics", "image": "https://picsum.photos/seed/p5/400/400", "rating": 4.1, "description": "15.6\" FHD Thin & Light Laptop"},
    {"id": "p6", "name": "Biba Women's Kurta Set", "price": 1999, "category": "Fashion", "image": "https://picsum.photos/seed/p6/400/400", "rating": 4.5, "description": "Cotton Printed Straight Kurta"},
    {"id": "p7", "name": "Puma Running Shoes", "price": 2499, "category": "Fashion", "image": "https://picsum.photos/seed/p7/400/400", "rating": 4.0, "description": "Men's comfort running shoes"},
    {"id": "p8", "name": "Levi's Men 511 Jeans", "price": 2199, "category": "Fashion", "image": "https://picsum.photos/seed/p8/400/400", "rating": 4.6, "description": "Slim Fit Stretch Jeans"},
    {"id": "p9", "name": "Fastrack Analog Watch", "price": 1250, "category": "Fashion", "image": "https://picsum.photos/seed/p9/400/400", "rating": 4.2, "description": "Men's stylish analog watch"},
    {"id": "p10", "name": "Allen Solly Polo Shirt", "price": 899, "category": "Fashion", "image": "https://picsum.photos/seed/p10/400/400", "rating": 4.4, "description": "Regular fit solid polo neck t-shirt"},
    {"id": "p11", "name": "Wakefit Orthopedic Mattress", "price": 12499, "category": "Home", "image": "https://picsum.photos/seed/p11/400/400", "rating": 4.7, "description": "Memory Foam Queen Size Mattress"},
    {"id": "p12", "name": "Pigeon Induction Cooktop", "price": 1499, "category": "Home", "image": "https://picsum.photos/seed/p12/400/400", "rating": 3.9, "description": "1800 Watt Induction Cooktop"},
    {"id": "p13", "name": "Milton Thermosteel Flask", "price": 950, "category": "Home", "image": "https://picsum.photos/seed/p13/400/400", "rating": 4.5, "description": "1000ml Hot & Cold Flask"},
    {"id": "p14", "name": "Bombay Dyeing Bedsheet", "price": 1099, "category": "Home", "image": "https://picsum.photos/seed/p14/400/400", "rating": 4.1, "description": "Double bedsheet with 2 pillow covers"},
    {"id": "p15", "name": "L'Oreal Paris Shampoo", "price": 649, "category": "Beauty", "image": "https://picsum.photos/seed/p15/400/400", "rating": 4.3, "description": "Total Repair 5 Restoring Shampoo"},
    {"id": "p16", "name": "Lakme Sun Expert SPF 50", "price": 399, "category": "Beauty", "image": "https://picsum.photos/seed/p16/400/400", "rating": 4.4, "description": "Ultra Matte Lotion Sunscreen"},
    {"id": "p17", "name": "Maybelline Fit Me Foundation", "price": 549, "category": "Beauty", "image": "https://picsum.photos/seed/p17/400/400", "rating": 4.6, "description": "Matte + Poreless Liquid Foundation"},
    {"id": "p18", "name": "Yonex Carbonex Badminton", "price": 1850, "category": "Sports", "image": "https://picsum.photos/seed/p18/400/400", "rating": 4.5, "description": "Carbonex 7000 Plus Racquet"},
    {"id": "p19", "name": "Nivia Football", "price": 499, "category": "Sports", "image": "https://picsum.photos/seed/p19/400/400", "rating": 4.0, "description": "Storm Football Size 5"},
    {"id": "p20", "name": "Strauss Yoga Mat", "price": 699, "category": "Sports", "image": "https://picsum.photos/seed/p20/400/400", "rating": 4.2, "description": "Anti Slip Yoga Mat 6mm"}
]

def seed_fraud_user(aadhaar):
    now = datetime.utcnow()
    reasons = ["Item damaged in transit", "Received wrong item", "Defective product", "Not as expected", "Quality issues"]
    levels = ["HIGH", "HIGH", "HIGH", "CRITICAL", "CRITICAL"]
    for i in range(5):
        returns.append({
            "return_id": f"ret_{uuid.uuid4().hex[:8]}",
            "aadhaar": aadhaar,
            "order_id": f"ord_{uuid.uuid4().hex[:8]}",
            "product_id": f"p{random.randint(1, 20)}",
            "reason": reasons[i],
            "risk_level": levels[i],
            "timestamp": (now - timedelta(days=random.randint(1, 30))).isoformat()
        })

def get_user_returns(aadhaar):
    return [r for r in returns if r["aadhaar"] == aadhaar]

def get_user_orders(aadhaar):
    return [o for o in orders.values() if o["aadhaar"] == aadhaar]

def add_order(order_dict):
    orders[order_dict["order_id"]] = order_dict

def add_return(return_dict):
    returns.append(return_dict)

def get_all_returns():
    return returns

def get_all_orders():
    return list(orders.values())
