"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { Subscription } from "@/types";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [detected, setDetected] = useState<any[]>([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ service_name: "", monthly_cost: "" });

  useEffect(() => {
    const u = localStorage.getItem("fp_user");
    if (u) setUser(JSON.parse(u));
    api.get("/api/subscriptions/").then(r => setSubscriptions(r.data));
  }, []);

  const detectSubs = async () => {
    const res = await api.post("/api/subscriptions/detect");
    setDetected(res.data.detected);
    toast.success(`Found ${res.data.detected.length} potential subscriptions`);
  };

  const addSub = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/subscriptions/", { ...subForm, monthly_cost: parseFloat(subForm.monthly_cost) });
    toast.success("Subscription added!");
    setSubForm({ service_name: "", monthly_cost: "" });
    setShowSubForm(false);
    api.get("/api/subscriptions/").then(r => setSubscriptions(r.data));
  };

  const deleteSub = async (id: number) => {
    await api.delete(`/api/subscriptions/${id}`);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    toast.success("Removed");
  };

  const totalSubs = subscriptions.reduce((a, s) => a + s.monthly_cost, 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Profile & Settings</h1>

        {/* User Card */}
        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}</div>
          </div>
        </div>

        {/* Subscriptions */}
        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Subscriptions</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Total monthly: <span style={{ color: "#f59e0b", fontWeight: 600 }}>₹{totalSubs.toLocaleString("en-IN")}</span></p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }} onClick={detectSubs}>🔍 Auto-detect</button>
              <button className="btn-primary" style={{ fontSize: 12, padding: "7px 12px" }} onClick={() => setShowSubForm(!showSubForm)}>+ Add</button>
            </div>
          </div>

          {showSubForm && (
            <form onSubmit={addSub} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input placeholder="Service name" value={subForm.service_name} onChange={e => setSubForm({ ...subForm, service_name: e.target.value })} required style={{ flex: 2 }} />
              <input type="number" placeholder="Monthly cost ₹" value={subForm.monthly_cost} onChange={e => setSubForm({ ...subForm, monthly_cost: e.target.value })} required style={{ flex: 1 }} />
              <button type="submit" className="btn-primary" style={{ padding: "10px 16px" }}>Add</button>
            </form>
          )}

          {subscriptions.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>No subscriptions tracked. Add one or use auto-detect.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subscriptions.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#0f1117", borderRadius: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{s.service_name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", fontFamily: "JetBrains Mono, monospace" }}>₹{s.monthly_cost}/mo</span>
                    <button onClick={() => deleteSub(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 15 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detected.length > 0 && (
            <div style={{ marginTop: 16, padding: 14, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 10 }}>🔍 Detected from transactions:</p>
              {detected.map((d, i) => (
                <div key={i} style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>• {d.service_name} — ₹{d.monthly_cost}/mo ({d.occurrences} payments)</div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div style={{ background: "#161b27", border: "1px solid #2d1515", borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f43f5e", marginBottom: 8 }}>Account</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Manage your session and account settings.</p>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
