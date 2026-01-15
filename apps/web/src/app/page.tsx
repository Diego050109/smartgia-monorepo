"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>smartGIA</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Plataforma de entrenamiento personalizado (Web + Mobile) con backend de microservicios.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/register" style={btn()}>
          Crear cuenta
        </Link>
        <Link href="/login" style={btnOutline()}>
          Iniciar sesión
        </Link>
        <Link href="/dashboard" style={btnOutline()}>
          Dashboard
        </Link>
      </div>

      <div style={{ marginTop: 28, padding: 16, border: "1px solid #3333", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>API</h3>
        <code style={{ fontSize: 14 }}>NEXT_PUBLIC_API_URL = {process.env.NEXT_PUBLIC_API_URL ?? "(no cargó)"}</code>
        <p style={{ marginBottom: 0, opacity: 0.8 }}>
          Si ves “(no cargó)”, reinicia el dev server.
        </p>
      </div>
    </main>
  );
}

function btn(): React.CSSProperties {
  return {
    background: "black",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
  };
}

function btnOutline(): React.CSSProperties {
  return {
    border: "1px solid #3333",
    color: "black",
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
  };
}
