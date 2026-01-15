"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

type AuthResponse = {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const data = await apiPost<AuthResponse>("/auth/register", { email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("email", data.user.email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setMsg(`❌ ${err.message ?? "Error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">SmartGIA — Register</h1>
        <p className="text-sm opacity-80 mt-1">Crea tu cuenta</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@smartgia.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              type="password"
              required
            />
          </div>

          <button
            className="w-full rounded-xl border px-3 py-2 hover:opacity-90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          {msg && <div className="text-sm mt-2">{msg}</div>}

          <div className="text-sm opacity-80">
            ¿Ya tienes cuenta?{" "}
            <a className="underline" href="/login">
              Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
