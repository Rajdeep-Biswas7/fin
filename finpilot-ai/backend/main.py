from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, transactions, goals, subscriptions, dashboard, chat
from utils.auth import get_current_user
from models.models import User
from schemas.schemas import UserOut

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinPilot AI API",
    description="AI-powered personal finance assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(goals.router)
app.include_router(subscriptions.router)
app.include_router(dashboard.router)
app.include_router(chat.router)


# Patch /me endpoint
@app.get("/api/auth/me", response_model=UserOut, tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/")
def root():
    return {"message": "FinPilot AI API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
