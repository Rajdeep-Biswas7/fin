"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      localStorage.setItem("fp_token", res.data.access_token);
      localStorage.setItem("fp_user", JSON.stringify(res.data.user));
      toast.success("Account created! Welcome to FinPilot 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0f1117 0%, #161b27 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <span className="text-2xl">💸</span>
          </div>
          <h1 className="text-3xl font-bold text-white">FinPilot <span style={{ color: "#22c55e" }}>AI</span></h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Start managing your finances smarter</p>
        </div>

        <div style={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: 16, padding: 32 }}>
          <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>Full Name</label>
              <input type="text" placeholder="Rahul Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>Password</label>
              <input type="password" placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#22c55e" }} className="font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
