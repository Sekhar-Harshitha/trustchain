from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("/submit")
def submit_rating(payload: schemas.VendorRatingCreate, db: Session = Depends(get_db)):
    # 1. Save Rating
    new_rating = models.VendorRating(
        vendor_id=payload.vendor_id,
        user_id=payload.user_id,
        return_id=payload.return_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(new_rating)
    
    # 2. Update User Trust Score
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    score_change = 0
    if payload.rating == 5: score_change = 5
    elif payload.rating == 4: score_change = 2
    elif payload.rating == 3: score_change = 0
    elif payload.rating == 2: score_change = -15
    elif payload.rating == 1: score_change = -30
    
    user.trust_score = max(0.0, min(100.0, user.trust_score + score_change))
    
    # 3. Update Return Request status to approved/rejected based on rating if desired
    # For now, just mark it as "completed" or leave as is. 
    # The prompt doesn't explicitly say to change return status here, but usually, a rating implies completion.
    ret_req = db.query(models.ReturnRequest).filter(models.ReturnRequest.id == payload.return_id).first()
    if ret_req:
        ret_req.status = "processed"
    
    db.commit()
    return {"success": True, "new_trust_score": user.trust_score}
