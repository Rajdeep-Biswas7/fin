from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# --- Transactions ---
class TransactionCreate(BaseModel):
    merchant: str
    amount: float
    category: Optional[str] = "Uncategorized"
    date: Optional[datetime] = None
    note: Optional[str] = None
    type: Optional[str] = "expense"


class TransactionOut(BaseModel):
    id: int
    merchant: str
    amount: float
    category: str
    date: datetime
    note: Optional[str]
    type: str

    class Config:
        from_attributes = True


# --- Goals ---
class GoalCreate(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    deadline: Optional[datetime] = None


class GoalUpdate(BaseModel):
    current_amount: float


class GoalOut(BaseModel):
    id: int
    goal_name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Subscriptions ---
class SubscriptionCreate(BaseModel):
    service_name: str
    monthly_cost: float
    next_billing: Optional[datetime] = None


class SubscriptionOut(BaseModel):
    id: int
    service_name: str
    monthly_cost: float
    is_active: bool
    next_billing: Optional[datetime]

    class Config:
        from_attributes = True


# --- Chat ---
class ChatMessage(BaseModel):
    message: str


class ChatOut(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Dashboard ---
class DashboardStats(BaseModel):
    total_balance: float
    monthly_spending: float
    savings_rate: float
    total_transactions: int
    top_categories: List[dict]
    monthly_trend: List[dict]
    recent_transactions: List[TransactionOut]
    ai_insights: List[str]
