from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.models import Transaction, User
from schemas.schemas import TransactionCreate, TransactionOut
from utils.auth import get_current_user
from services.ai_service import categorize_transaction
import pandas as pd
import io

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if category:
        query = query.filter(Transaction.category == category)
    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=TransactionOut)
async def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Auto-categorize if not provided
    category = payload.category
    if category == "Uncategorized" or not category:
        category = await categorize_transaction(payload.merchant)

    txn = Transaction(
        user_id=current_user.id,
        merchant=payload.merchant,
        amount=payload.amount,
        category=category,
        date=payload.date,
        note=payload.note,
        type=payload.type,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(
    txn_id: int,
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(txn, field, value)
    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}")
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    return {"message": "Deleted successfully"}


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))

    required_cols = {"merchant", "amount"}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(status_code=400, detail="CSV must have 'merchant' and 'amount' columns")

    df.columns = df.columns.str.lower()
    added = 0
    for _, row in df.iterrows():
        category = await categorize_transaction(str(row["merchant"]))
        txn = Transaction(
            user_id=current_user.id,
            merchant=str(row["merchant"]),
            amount=float(row["amount"]),
            category=category,
            date=row.get("date", None),
            note=row.get("note", None),
            type=row.get("type", "expense"),
        )
        db.add(txn)
        added += 1

    db.commit()
    return {"message": f"{added} transactions imported successfully"}
