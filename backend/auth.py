from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import os
import random
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import models
import schemas
from database import get_db

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

session_store = {}

def get_twilio_client():
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    if not sid or not token or "ACxxx" in sid:
        raise ValueError("Twilio credentials missing or invalid in .env")
    return Client(sid, token)

VALID_AADHAAR = {
    "234567890123": True,
    "345678901234": True,
    "456789012345": True,
}

@router.post("/send-otp", response_model=schemas.OTPSendResponse)
@router.post("/customer/send-otp", response_model=schemas.OTPSendResponse)
def send_otp(payload: schemas.OTPSendRequest):
    aadhaar = payload.aadhaar_number
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar Number")

    req_phone = payload.phone_number
    env_phone = os.getenv("DEMO_PHONE_NUMBER")
    
    phone = req_phone or env_phone or "+919876543210"
    if not phone.startswith("+"):
        phone = f"+91{phone.lstrip('0')}"

    try:
        client = get_twilio_client()
        verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        
        if not verify_sid or not verify_sid.startswith("VA"):
            raise ValueError("Invalid Verify Service SID (must start with VA)")
            
        verification = client.verify \
            .v2 \
            .services(verify_sid) \
            .verifications \
            .create(to=phone, channel="sms")
            
        print(f"Twilio Verify status: {verification.status}")
        
    except TwilioRestException as e:
        print(f"Twilio error: {e.code} - {e.msg}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {e.msg}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    return schemas.OTPSendResponse(
        success=True, 
        masked_phone=f"******{phone[-4:]}", 
        role="customer"
    )

@router.post("/verify-otp", response_model=schemas.TokenResponse)
@router.post("/customer/verify-otp", response_model=schemas.TokenResponse)
def verify_otp(payload: schemas.OTPVerifyRequest, db: Session = Depends(get_db)):
    aadhaar = payload.aadhaar_number
    otp = payload.otp
    role = payload.role
    
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be exactly 6 digits")

    req_phone = payload.phone_number
    env_phone = os.getenv("DEMO_PHONE_NUMBER")
    phone = req_phone or env_phone or "+919876543210"
    if not phone.startswith("+"):
        phone = f"+91{phone.lstrip('0')}"

    try:
        client = get_twilio_client()
        verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        
        verification_check = client.verify \
            .v2 \
            .services(verify_sid) \
            .verification_checks \
            .create(to=phone, code=otp)
            
        if verification_check.status != "approved":
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")
            
    except TwilioRestException as e:
        if e.code == 60202:
            raise HTTPException(status_code=429, detail="Max attempts reached. Request a new OTP.")
        elif e.code == 60203:
            raise HTTPException(status_code=400, detail="Max send attempts reached.")
        raise HTTPException(status_code=500, detail=f"Twilio error: {e.msg}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # AUTH SUCCESS
    user = db.query(models.User).filter(models.User.aadhaar_hash == aadhaar).first()
    if not user:
        name = "Rajesh Kumar" if aadhaar == "123456789012" else f"User_{aadhaar[-4:]}"
        user = models.User(
            aadhaar_hash=aadhaar,
            name=name,
            phone=phone,
            role=role,
            trust_score=100.0
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return schemas.TokenResponse(
        token=f"mock_jwt_session_{user.id}_{role}",
        user=schemas.UserOut.from_orm(user),
        role=role
    )

# ── B. ADMIN EMAIL/PASSWORD FLOW ─────────────────────────

@router.post("/admin/login", response_model=schemas.TokenResponse)
def admin_login(payload: schemas.AdminLoginRequest, db: Session = Depends(get_db)):
    if payload.email == "admin@returnguard.ai" and payload.password == "admin123":
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        if not admin:
            admin = models.User(name="System Admin", email="admin@returnguard.ai", role="admin", trust_score=100.0)
            db.add(admin)
            db.commit()
            db.refresh(admin)
        return schemas.TokenResponse(token=f"mock_jwt_admin_{admin.id}", user=schemas.UserOut.from_orm(admin), role="admin")
    raise HTTPException(status_code=401, detail="Authorized Personnel Only")

# ── C. MIDDLEWARE ────────────────────────────────────────

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authentication Token")
    token = authorization.split(" ")[1]
    parts = token.split("_")
    if len(parts) < 4: raise HTTPException(status_code=401, detail="Invalid Session Token")
    user_id = int(parts[3])
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=401, detail="Session Expired")
    return user
