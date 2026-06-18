from openai import AsyncOpenAI
from config import settings
from typing import List
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

CATEGORY_MAP = {
    "swiggy": "Food", "zomato": "Food", "dominos": "Food", "mcdonald": "Food",
    "kfc": "Food", "uber eats": "Food", "starbucks": "Food & Drinks",
    "uber": "Transport", "ola": "Transport", "rapido": "Transport",
    "irctc": "Transport", "makemytrip": "Travel", "goibibo": "Travel",
    "amazon": "Shopping", "flipkart": "Shopping", "myntra": "Shopping",
    "netflix": "Entertainment", "spotify": "Entertainment", "hotstar": "Entertainment",
    "youtube": "Entertainment", "pvr": "Entertainment", "book my show": "Entertainment",
    "apollo": "Healthcare", "medplus": "Healthcare", "pharmeasy": "Healthcare",
    "byju": "Education", "udemy": "Education", "coursera": "Education",
    "hdfc": "Banking", "sbi": "Banking", "icici": "Banking",
    "electricity": "Utilities", "water": "Utilities", "gas": "Utilities",
    "airtel": "Utilities", "jio": "Utilities", "bsnl": "Utilities",
    "rent": "Housing", "maintenance": "Housing",
    "gym": "Fitness", "cult": "Fitness",
    "salary": "Income", "freelance": "Income", "dividend": "Income",
}


async def categorize_transaction(merchant: str) -> str:
    merchant_lower = merchant.lower()
    for keyword, category in CATEGORY_MAP.items():
        if keyword in merchant_lower:
            return category

    # Fallback to GPT
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a finance assistant. Categorize the merchant into one of: Food, Transport, Shopping, Entertainment, Healthcare, Education, Utilities, Housing, Fitness, Travel, Income, Banking, Other. Reply with ONLY the category name.",
                },
                {"role": "user", "content": f"Merchant: {merchant}"},
            ],
            max_tokens=10,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return "Other"


async def get_ai_insights(transactions, monthly_spending: float, savings_rate: float) -> List[str]:
    if not transactions:
        return ["Add your first transaction to get personalized insights."]

    try:
        summary = {
            "monthly_spending": monthly_spending,
            "savings_rate": savings_rate,
            "total_transactions": len(transactions),
        }

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a personal finance advisor. Generate 3 short, actionable insights based on spending data. Reply with a JSON array of strings.",
                },
                {"role": "user", "content": f"Finance summary: {json.dumps(summary)}"},
            ],
            max_tokens=300,
        )
        text = resp.choices[0].message.content.strip()
        # Clean JSON
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        insights = json.loads(text)
        return insights[:3]
    except Exception:
        return [
            f"Monthly spending is ₹{monthly_spending:,.0f}. Review your top categories.",
            f"Savings rate is {savings_rate}%. Aim for at least 20%.",
            "Consider reviewing recurring subscriptions for potential savings.",
        ]
