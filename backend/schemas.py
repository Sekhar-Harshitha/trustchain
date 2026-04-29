from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: str
    trust_score: float = 100.0

class UserOut(UserBase):
    id: int
    aadhaar_hash: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- AUTH SCHEMAS ---
class OTPSendRequest(BaseModel):
    aadhaar_number: str
    phone_number: Optional[str] = None # Added for demo flexibility

class OTPSendResponse(BaseModel):
    success: bool
    masked_phone: str
    role: str

class OTPVerifyRequest(BaseModel):
    aadhaar_number: str
    otp: str
    role: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: UserOut
    role: str

# --- RETURN SCHEMAS ---
class ReturnSubmitRequest(BaseModel):
    user_id: int
    vendor_id: int = 1
    product_name: str
    order_value: float
    return_reason: str
    damage_image_url: Optional[str] = None

class ReturnRequestOut(BaseModel):
    id: int
    user_id: int
    vendor_id: int
    product_name: str
    order_value: float
    return_reason: str
    damage_image_url: Optional[str] = None
    status: str
    ai_fraud_score: float
    ai_explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- RATING SCHEMAS ---
class RatingSubmitRequest(BaseModel):
    vendor_id: int
    user_id: int
    return_id: int
    rating: int
    comment: Optional[str] = None

class RatingOut(BaseModel):
    id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
