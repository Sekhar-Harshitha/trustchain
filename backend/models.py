from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    aadhaar_hash = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    trust_score = Column(Float, default=100.0)
    role = Column(String, default="customer")  # "admin", "vendor", "customer"
    created_at = Column(DateTime, default=datetime.utcnow)

    returns_as_customer = relationship("ReturnRequest", foreign_keys="ReturnRequest.user_id", back_populates="customer")
    returns_as_vendor = relationship("ReturnRequest", foreign_keys="ReturnRequest.vendor_id", back_populates="vendor")
    ratings_given = relationship("VendorRating", foreign_keys="VendorRating.user_id", back_populates="rater")
    ratings_received = relationship("VendorRating", foreign_keys="VendorRating.vendor_id", back_populates="vendor")

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_name = Column(String, nullable=False)
    order_value = Column(Float, nullable=False)
    return_reason = Column(String, nullable=False)
    damage_image_url = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending_review, auto_approved, flagged_fraud
    ai_fraud_score = Column(Float, default=0.0)
    ai_explanation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("User", foreign_keys=[user_id], back_populates="returns_as_customer")
    vendor = relationship("User", foreign_keys=[vendor_id], back_populates="returns_as_vendor")
    rating = relationship("VendorRating", back_populates="return_request", uselist=False)

class VendorRating(Base):
    __tablename__ = "vendor_ratings"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    return_id = Column(Integer, ForeignKey("return_requests.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1–5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("User", foreign_keys=[vendor_id], back_populates="ratings_received")
    rater = relationship("User", foreign_keys=[user_id], back_populates="ratings_given")
    return_request = relationship("ReturnRequest", back_populates="rating")
