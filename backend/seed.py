from database import SessionLocal, engine
import models
from datetime import datetime

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh role-based seed
    db.query(models.VendorRating).delete()
    db.query(models.ReturnRequest).delete()
    db.query(models.User).delete()
    db.commit()

    # 1. USERS
    users = [
        models.User(
            id=1,
            name="System Admin",
            email="admin@returnguard.ai",
            password_hash="admin123", # Mock
            role="admin",
            trust_score=100.0
        ),
        models.User(
            id=2,
            aadhaar_hash="999999999999",
            name="TechStore Owner",
            phone="9988776655",
            role="vendor",
            trust_score=100.0
        ),
        models.User(
            id=3,
            aadhaar_hash="123456789012",
            name="Rahul Sharma",
            phone="9876543210",
            role="customer",
            trust_score=85.0
        ),
        models.User(
            id=4,
            aadhaar_hash="cust456",
            name="Priya Patel",
            phone="9123456789",
            role="customer",
            trust_score=42.0
        ),
    ]
    db.add_all(users)
    db.commit()

    # 2. SAMPLE RETURNS
    returns = [
        models.ReturnRequest(
            user_id=3,
            vendor_id=2,
            product_name="iPhone 15 Pro",
            order_value=999.0,
            return_reason="Unit heating during basic tasks",
            status="auto_approved",
            ai_fraud_score=12.0,
            ai_explanation="✅ Consistent reason. No stock photo markers detected."
        ),
        models.ReturnRequest(
            user_id=4,
            vendor_id=2,
            product_name="Sony WH-1000XM5",
            order_value=350.0,
            return_reason="Sound leaking from left ear",
            status="flagged_fraud",
            ai_fraud_score=82.0,
            ai_explanation="⚠️ Image source identified as stock asset. User trust score low."
        )
    ]
    db.add_all(returns)
    db.commit()
    db.close()
    print("[SEED] Role-based database initialized successfully.")

if __name__ == "__main__":
    seed()
