from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from ai_engine import FraudDetector

fraud_detector = FraudDetector()

router = APIRouter(prefix="/returns", tags=["returns"])

@router.post("/submit", response_model=schemas.ReturnRequestOut)
def submit_return(payload: schemas.ReturnSubmitRequest, db: Session = Depends(get_db)):
    # Calculate AI Fraud Score
    fraud_score, explanation = fraud_detector.calculate_total_score(
        payload.damage_image_url, 
        payload.return_reason, 
        payload.user_id, 
        db
    )
    
    # Determine Status
    if fraud_score < 30:
        status = "auto_approved"
    elif fraud_score < 60:
        status = "pending_review"
    else:
        status = "flagged_fraud"

    # Hardcode a default vendor_id (e.g., 2 for TechStore) if not provided
    vendor_id = 2 
    
    return_req = models.ReturnRequest(
        user_id=payload.user_id,
        vendor_id=vendor_id,
        product_name=payload.product_name,
        order_value=payload.order_value,
        return_reason=payload.return_reason,
        damage_image_url=payload.damage_image_url,
        status=status,
        ai_fraud_score=fraud_score,
        ai_explanation=explanation
    )
    
    db.add(return_req)
    db.commit()
    db.refresh(return_req)
    return return_req

@router.get("/user/{user_id}", response_model=List[schemas.ReturnRequestOut])
def get_user_returns(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.ReturnRequest).filter(models.ReturnRequest.user_id == user_id).all()
