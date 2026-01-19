import { useEffect, useState } from "react";
import { api } from "./lib/api";

export default function App() {
  const [status, setStatus] = useState<string>("loading...");

  useEffect(() => {
    api.get("/health")
      .then(() => setStatus("API OK"))
      .catch((e) => setStatus(e?.message || "error"));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>SmartGIA Frontend</h1>
      <p>{status}</p>
    </main>
  );
}
