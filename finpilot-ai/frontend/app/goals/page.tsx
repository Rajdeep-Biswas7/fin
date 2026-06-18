"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { Goal } from "@/types";
import toast from "react-hot-toast";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal_name: "", target_amount: "", current_amount: "0", deadline: "" });
  const [saving, setSaving] = useState(false);
  const [updateGoal, setUpdateGoal] = useState<{ id: number; value: string } | null>(null);

  const load = () => {
    api.get("/api/goals/").then(r => setGoals(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/goals/", { ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount) });
      toast.success("Goal created!");
      setForm({ goal_name: "", target_amount: "", current_amount: "0", deadline: "" });
      setShowForm(false);
      load();
    } catch { toast.error("Failed to create goal"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id: number, value: string) => {
    await api.patch(`/api/goals/${id}`, { current_amount: parseFloat(value) });
    toast.success("Progress updated!");
    setUpdateGoal(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this goal?")) return;
    await api.delete(`/api/goals/${id}`);
    toast.success("Goal deleted");
    load();
  };

  const progress = (g: Goal) => Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));

  return (
    <AppShell>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Financial Goals</h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Track your savings and investment targets</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Goal</button>
        </div>

        {showForm && (
          <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Create New Goal</h3>
            <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Goal Name</label>
                <input placeholder="e.g. Buy Laptop" value={form.goal_name} onChange={e => setForm({ ...form, goal_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Target Amount (₹)</label>
                <input type="number" placeholder="80000" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Current Savings (₹)</label>
                <input type="number" placeholder="0" value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Target Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div style={{ gridColumn: "span 2", display: "flex", gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Create Goal"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ color: "#64748b", textAlign: "center", paddingTop: 40 }}>Loading...</div>
        ) : goals.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <p>No goals yet. Set your first financial goal!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {goals.map(g => {
              const pct = progress(g);
              const remaining = g.target_amount - g.current_amount;
              return (
                <div key={g.id} style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{g.goal_name}</div>
                      {g.deadline && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>By {new Date(g.deadline).toLocaleDateString("en-IN")}</div>}
                    </div>
                    <button onClick={() => handleDelete(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>🗑️</button>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                      <span>₹{g.current_amount.toLocaleString("en-IN")}</span>
                      <span style={{ color: "#22c55e", fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "#0f1117", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : "linear-gradient(90deg, #22c55e, #3b82f6)", borderRadius: 999, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                      Target: ₹{g.target_amount.toLocaleString("en-IN")} · {remaining > 0 ? `₹${remaining.toLocaleString("en-IN")} remaining` : "✅ Achieved!"}
                    </div>
                  </div>

                  {updateGoal?.id === g.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={updateGoal.value} onChange={e => setUpdateGoal({ ...updateGoal, value: e.target.value })} style={{ flex: 1 }} />
                      <button className="btn-primary" style={{ padding: "8px 14px" }} onClick={() => handleUpdate(g.id, updateGoal.value)}>Save</button>
                      <button className="btn-ghost" style={{ padding: "8px 14px" }} onClick={() => setUpdateGoal(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
                      onClick={() => setUpdateGoal({ id: g.id, value: String(g.current_amount) })}>
                      Update Progress
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
