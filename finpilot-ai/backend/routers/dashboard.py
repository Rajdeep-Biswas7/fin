from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from database import get_db
from models.models import Transaction, User
from schemas.schemas import DashboardStats
from utils.auth import get_current_user
from services.ai_service import get_ai_insights
from collections import defaultdict

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardStats)
async def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)

    all_transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    monthly_transactions = [t for t in all_transactions if t.date and t.date >= start_of_month]

    # Monthly spending
    monthly_spending = sum(t.amount for t in monthly_transactions if t.type == "expense")
    monthly_income = sum(t.amount for t in monthly_transactions if t.type == "income")
    savings_rate = round(((monthly_income - monthly_spending) / monthly_income * 100) if monthly_income > 0 else 0, 1)

    # Total balance
    total_income = sum(t.amount for t in all_transactions if t.type == "income")
    total_expense = sum(t.amount for t in all_transactions if t.type == "expense")
    total_balance = total_income - total_expense

    # Category breakdown
    category_totals = defaultdict(float)
    for t in monthly_transactions:
        if t.type == "expense":
            category_totals[t.category] += t.amount
    top_categories = [
        {"category": k, "amount": round(v, 2)}
        for k, v in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ][:6]

    # Monthly trend (last 6 months)
    monthly_trend = []
    for i in range(5, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_txns = [
            t for t in all_transactions
            if t.date and t.date.month == month_date.month and t.date.year == month_date.year
        ]
        monthly_trend.append({
            "month": month_date.strftime("%b"),
            "spending": round(sum(t.amount for t in month_txns if t.type == "expense"), 2),
            "income": round(sum(t.amount for t in month_txns if t.type == "income"), 2),
        })

    # Recent transactions
    recent = sorted(all_transactions, key=lambda x: x.date or datetime.min, reverse=True)[:5]

    # AI Insights
    insights = await get_ai_insights(all_transactions, monthly_spending, savings_rate)

    return DashboardStats(
        total_balance=round(total_balance, 2),
        monthly_spending=round(monthly_spending, 2),
        savings_rate=savings_rate,
        total_transactions=len(all_transactions),
        top_categories=top_categories,
        monthly_trend=monthly_trend,
        recent_transactions=recent,
        ai_insights=insights,
    )
