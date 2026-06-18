"use client";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "How can I save ₹5000 monthly?",
  "What's my biggest spending category?",
  "Am I on track with my goals?",
  "Which subscriptions should I cancel?",
  "Give me a budget plan for next month",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/api/chat/history").then(r => setMessages(r.data));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setTyping(true);
    setLoading(true);

    // Optimistic UI
    const temp: ChatMessage = { id: Date.now(), message: msg, response: "", timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);

    try {
      const res = await api.post("/api/chat/", { message: msg });
      setMessages(prev => prev.map(m => m.id === temp.id ? res.data : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === temp.id ? { ...m, response: "Sorry, I encountered an error. Please try again." } : m));
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>FinPilot AI Advisor</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#22c55e" }}>Online · Powered by GPT-4o</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 4, marginBottom: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 8 }}>Ask me anything about your finances</p>
              <p style={{ color: "#64748b", fontSize: 13 }}>I have access to your transactions, goals, and spending patterns.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={m.id}>
              {/* User message */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: "18px 18px 4px 18px", background: "#22c55e", color: "#000", fontSize: 14, fontWeight: 500 }}>
                  {m.message}
                </div>
              </div>
              {/* AI response */}
              {(m.response || (i === messages.length - 1 && typing)) && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
                  <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: "4px 18px 18px 18px", background: "#161b27", border: "1px solid #1e2535", fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>
                    {m.response || <span style={{ color: "#64748b" }}>Thinking<span className="animate-pulse">...</span></span>}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 999, background: "#161b27", border: "1px solid #1e2535", color: "#94a3b8", cursor: "pointer", transition: "all 0.15s" }}
                onMouseOver={e => (e.currentTarget.style.borderColor = "#22c55e", e.currentTarget.style.color = "#22c55e")}
                onMouseOut={e => (e.currentTarget.style.borderColor = "#1e2535", e.currentTarget.style.color = "#94a3b8")}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about your finances..."
            disabled={loading}
            style={{ flex: 1, padding: "12px 16px", borderRadius: 12 }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: "12px 20px", borderRadius: 12, flexShrink: 0 }}>
            {loading ? "⏳" : "Send ➤"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
