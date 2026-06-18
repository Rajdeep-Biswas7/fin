"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { Transaction } from "@/types";
import toast from "react-hot-toast";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Healthcare", "Education", "Utilities", "Housing", "Fitness", "Travel", "Income", "Banking", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ merchant: "", amount: "", category: "Other", type: "expense", note: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const load = () => {
    api.get("/api/transactions/").then(r => setTransactions(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/transactions/", { ...form, amount: parseFloat(form.amount) });
      toast.success("Transaction added!");
      setForm({ merchant: "", amount: "", category: "Other", type: "expense", note: "" });
      setShowForm(false);
      load();
    } catch { toast.error("Failed to add transaction"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/api/transactions/${id}`);
    toast.success("Deleted");
    load();
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/api/transactions/upload-csv", fd);
      toast.success(res.data.message);
      load();
    } catch { toast.error("CSV upload failed"); }
  };

  const filtered = transactions.filter(t =>
    t.merchant.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AppShell>
      <div style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Transactions</h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{transactions.length} total transactions</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ cursor: "pointer" }}>
              <span className="btn-ghost" style={{ padding: "9px 16px", fontSize: 13 }}>📤 Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
            </label>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Transaction</button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>New Transaction</h3>
            <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Merchant</label>
                <input placeholder="e.g. Swiggy" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Amount (₹)</label>
                <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Note (optional)</label>
                <input placeholder="Any notes..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
              <div style={{ gridColumn: "span 2", display: "flex", gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Transaction"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input placeholder="🔍  Search by merchant or category..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>

        {/* List */}
        {loading ? (
          <div style={{ color: "#64748b", textAlign: "center", paddingTop: 40 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <p>No transactions found. Add your first one!</p>
          </div>
        ) : (
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2535" }}>
                  {["Merchant", "Category", "Date", "Type", "Amount", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #1e2535" }}>
                    <td style={{ padding: "13px 16px", fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>{t.merchant}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "#0f1117", color: "#94a3b8", border: "1px solid #1e2535" }}>{t.category}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{new Date(t.date).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: t.type === "income" ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)", color: t.type === "income" ? "#22c55e" : "#f43f5e" }}>{t.type}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 15, fontWeight: 700, color: t.type === "income" ? "#22c55e" : "#f43f5e", fontFamily: "JetBrains Mono, monospace" }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 16 }} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
