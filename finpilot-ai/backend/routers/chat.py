from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import ChatHistory, Transaction, Goal, User
from schemas.schemas import ChatMessage, ChatOut
from utils.auth import get_current_user
from agents.finance_agent import run_finance_agent

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/", response_model=ChatOut)
async def chat(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    response = await run_finance_agent(payload.message, transactions, goals, current_user.name)

    history = ChatHistory(user_id=current_user.id, message=payload.message, response=response)
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


@router.get("/history", response_model=List[ChatOut])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.asc())
        .limit(50)
        .all()
    )
