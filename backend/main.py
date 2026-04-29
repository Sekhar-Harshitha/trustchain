from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
from dotenv import load_dotenv

import models
import schemas
from database import engine, get_db
from seed import seed
import auth
import returns
import ratings

load_dotenv()

# ── Boot ──────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="ReturnGuard AI", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a master router for /api
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
def health_check():
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
    is_configured = bool(sid and token and verify_sid)
    return {"status": "ok", "twilio_configured": is_configured}

# ── API Routes ───────────────────────────────────────────

@api_router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@api_router.get("/vendors", response_model=List[schemas.UserOut])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "vendor").all()

@api_router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Include Routers
api_router.include_router(auth.router)
api_router.include_router(returns.router)
api_router.include_router(ratings.router)

# Mount all under /api
app.include_router(api_router)
