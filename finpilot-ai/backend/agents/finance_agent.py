from openai import AsyncOpenAI
from config import settings
from typing import List
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def run_finance_agent(message: str, transactions, goals, user_name: str) -> str:
    """
    Multi-agent finance assistant using GPT-4o.
    Routes to appropriate sub-agent based on intent.
    """
    # Build context
    total_spending = sum(t.amount for t in transactions if t.type == "expense")
    total_income = sum(t.amount for t in transactions if t.type == "income")

    category_summary = {}
    for t in transactions:
        if t.type == "expense":
            category_summary[t.category] = category_summary.get(t.category, 0) + t.amount

    goals_summary = [
        {"name": g.goal_name, "target": g.target_amount, "current": g.current_amount}
        for g in goals
    ]

    context = f"""
User: {user_name}
Total income: ₹{total_income:,.0f}
Total spending: ₹{total_spending:,.0f}
Balance: ₹{total_income - total_spending:,.0f}
Category breakdown: {json.dumps(category_summary, indent=2)}
Financial goals: {json.dumps(goals_summary, indent=2)}
"""

    system_prompt = """You are FinPilot, an expert AI personal finance advisor for Indian users.
You have access to the user's transaction history and financial goals.
Provide specific, actionable advice in a friendly tone.
Use ₹ for currency. Be concise but thorough.
For savings recommendations, give concrete numbers.
For goal tracking, calculate progress percentages.
Always end with one motivational tip."""

    try:
        resp = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{context}\n\nUser question: {message}"},
            ],
            max_tokens=500,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment. (Error: {str(e)[:50]})"
