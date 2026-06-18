"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { DashboardStats, CATEGORY_COLORS } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

function StatCard({ icon, label, value, sub, color }: any) {
  return (
    <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/").then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppShell>
      <div style={{ color: "#64748b", textAlign: "center", paddingTop: 80 }}>Loading dashboard...</div>
    </AppShell>
  );

  return (
    <AppShell>
      <div style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Your financial overview at a glance</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon="💰" label="Total Balance" value={`₹${(stats?.total_balance ?? 0).toLocaleString("en-IN")}`} color="#22c55e" sub="All time" />
          <StatCard icon="📤" label="Monthly Spending" value={`₹${(stats?.monthly_spending ?? 0).toLocaleString("en-IN")}`} color="#f59e0b" sub="This month" />
          <StatCard icon="📈" label="Savings Rate" value={`${stats?.savings_rate ?? 0}%`} color="#3b82f6" sub="Income vs Spend" />
          <StatCard icon="🔢" label="Transactions" value={stats?.total_transactions ?? 0} color="#8b5cf6" sub="Total recorded" />
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Trend */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>Income vs Spending (6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats?.monthly_trend ?? []}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 8 }} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#income)" strokeWidth={2} />
                <Area type="monotone" dataKey="spending" stroke="#f43f5e" fill="url(#spending)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats?.top_categories ?? []} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {(stats?.top_categories ?? []).map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.category] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {(stats?.top_categories ?? []).slice(0, 4).map((c, i) => (
                <span key={i} style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[c.category] || "#6b7280", display: "inline-block" }} />
                  {c.category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Recent Transactions */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Recent Transactions</h3>
            {(stats?.recent_transactions ?? []).length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>No transactions yet. Add your first one!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(stats?.recent_transactions ?? []).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#0f1117", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{t.merchant}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{t.category} · {new Date(t.date).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: t.type === "income" ? "#22c55e" : "#f43f5e", fontFamily: "JetBrains Mono, monospace" }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>AI Insights</h3>
              <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>GPT-4o</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(stats?.ai_insights ?? ["Add transactions to get AI insights."]).map((insight, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
