export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  type: "expense" | "income";
}

export interface Goal {
  id: number;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  service_name: string;
  monthly_cost: number;
  is_active: boolean;
  next_billing?: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  response: string;
  timestamp: string;
}

export interface DashboardStats {
  total_balance: number;
  monthly_spending: number;
  savings_rate: number;
  total_transactions: number;
  top_categories: { category: string; amount: number }[];
  monthly_trend: { month: string; spending: number; income: number }[];
  recent_transactions: Transaction[];
  ai_insights: string[];
}

export type CategoryColor = {
  [key: string]: string;
};

export const CATEGORY_COLORS: CategoryColor = {
  Food: "#22c55e",
  Transport: "#3b82f6",
  Shopping: "#f59e0b",
  Entertainment: "#8b5cf6",
  Healthcare: "#ec4899",
  Education: "#06b6d4",
  Utilities: "#64748b",
  Housing: "#f97316",
  Fitness: "#10b981",
  Travel: "#6366f1",
  Income: "#22c55e",
  Banking: "#94a3b8",
  Other: "#6b7280",
};
