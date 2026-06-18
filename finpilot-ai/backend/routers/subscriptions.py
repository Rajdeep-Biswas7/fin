from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import Subscription, Transaction, User
from schemas.schemas import SubscriptionCreate, SubscriptionOut
from utils.auth import get_current_user
from collections import Counter
import re

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

KNOWN_SUBSCRIPTIONS = {
    "netflix": 649, "spotify": 119, "amazon prime": 299,
    "youtube premium": 139, "hotstar": 299, "zee5": 99,
    "apple music": 99, "google one": 130, "microsoft 365": 420,
}


@router.get("/", response_model=List[SubscriptionOut])
def get_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Subscription).filter(Subscription.user_id == current_user.id).all()


@router.post("/", response_model=SubscriptionOut)
def add_subscription(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = Subscription(user_id=current_user.id, **payload.dict())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/{sub_id}")
def delete_subscription(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"message": "Deleted"}


@router.post("/detect")
def detect_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Auto-detect recurring payments from transaction history."""
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    merchant_counts = Counter(t.merchant.lower() for t in transactions)

    detected = []
    for merchant, count in merchant_counts.items():
        if count >= 2:
            for known, cost in KNOWN_SUBSCRIPTIONS.items():
                if known in merchant:
                    detected.append({"service_name": merchant.title(), "monthly_cost": cost, "occurrences": count})
                    break
            else:
                if count >= 3:
                    amounts = [t.amount for t in transactions if t.merchant.lower() == merchant]
                    avg_amount = sum(amounts) / len(amounts)
                    if 50 <= avg_amount <= 2000:
                        detected.append({"service_name": merchant.title(), "monthly_cost": avg_amount, "occurrences": count})

    return {"detected": detected}
