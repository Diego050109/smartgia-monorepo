import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {getActiveRoutine, getProfile, generateWeekly} from "../lib/api";

type Profile = {
  email?: string;
  name?: string;
  goal?: string;
  level?: string;
};

type RoutineExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  steps?: string[];
};

type RoutineDay = {
  dayOfWeek: number; // 1=Mon ... 7=Sun
  focus: string;     // UPPER / LOWER / FULL / CARDIO / REST
  exercises: RoutineExercise[];
};

type Routine = {
  _id: string;
  title: string;
  goal: string;
  level: string;
  period: "WEEKLY";
  status: "ACTIVE" | "INACTIVE";
  periodStart: string;
  periodEnd: string;
  days: RoutineDay[];
};

const DOW = [
  { n: 1, key: "mon", label: "Lunes" },
  { n: 2, key: "tue", label: "Martes" },
  { n: 3, key: "wed", label: "Miércoles" },
  { n: 4, key: "thu", label: "Jueves" },
  { n: 5, key: "fri", label: "Viernes" },
  { n: 6, key: "sat", label: "Sábado" },
  { n: 7, key: "sun", label: "Domingo" },
];

function fmtRange(a?: string, b?: string) {
  if (!a || !b) return "";
  try {
    const A = new Date(a).toISOString().slice(0, 10);
    const B = new Date(b).toISOString().slice(0, 10);
    return `${A} → ${B}`;
  } catch {
    return "";
  }
}

function focusLabel(focus: string) {
  const x = (focus || "").toUpperCase();
  if (x === "UPPER") return "Upper body";
  if (x === "LOWER") return "Lower body";
  if (x === "FULL") return "Full body";
  if (x === "CARDIO") return "Cardio / movilidad";
  if (x === "REST" || x === "DESCANSO") return "Descanso";
  return focus || "Entrenamiento";
}

function isRestDay(d?: RoutineDay | null) {
  if (!d) return true;
  const x = (d.focus || "").toUpperCase();
  return x === "REST" || x === "DESCANSO" || (d.exercises?.length ?? 0) === 0;
}

export default function Dashboard() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  async function refresh() {
    setErr("");
    setLoading(true);
    const p = await getProfile();
    setProfile(p);
    const r = await getActiveRoutine();
    setRoutine(r);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const daysByDow = useMemo(() => {
    const map = new Map<number, RoutineDay>();
    (routine?.days ?? []).forEach((d) => map.set(d.dayOfWeek, d));
    return map;
  }, [routine]);

    const trainingsThisWeek = useMemo(() => {
    let t = 0;
    for (const it of DOW) {
      const d = daysByDow.get(it.n) || null;
      if (d && !isRestDay(d)) t++;
    }
    return t;
  }, [daysByDow]);


  
  // ✅ Progreso basado en backend
  const doneDays = routine?.completedDays?.length || 0;
  const totalWeek = trainingsThisWeek;
  const consistency = totalWeek ? Math.round((doneDays / totalWeek) * 100) : 0;
const headerName = profile?.name || profile?.email || "Usuario";
  const goal = profile?.goal || routine?.goal || "—";
  const level = profile?.level || routine?.level || "—";

  async function onGenerate() {
    setErr("");
    try {
      await generateWeekly(4);
      await refresh();
    } catch (e: any) {
      const msg = String(e?.message || "No se pudo generar rutina");
      if (msg.toLowerCase().includes("profile") || msg.toLowerCase().includes("goal") || msg.toLowerCase().includes("level")) {
        setErr("Completa tu perfil primero (goal/level).");
        nav("/profile");
        return;
      }
      setErr(msg);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.05 }}>Hola, {headerName} ðŸ‘‹</h1>
          <div style={{ marginTop: 8, color: "#556", fontSize: 16 }}>
            Objetivo: <b>{goal}</b> · Nivel: <b>{level}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/profile" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", textDecoration: "none", color: "#111" }}>
            Perfil
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("accessToken");
              nav("/login");
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 18, marginTop: 22 }}>
        <button
          onClick={onGenerate}
          style={{
            height: 92,
            borderRadius: 14,
            border: "1px solid #0f172a",
            background: "linear-gradient(180deg,#0b1220,#0b1220)",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          Generar rutina
        </button>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Progreso</h3>
            <span style={{ fontSize: 12, color: "#667" }}>Rutina: <b>{routine?.status === "ACTIVE" ? "Activa" : "—"}</b></span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#667" }}>Entrenamientos esta semana</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{routine ? `${doneDays} / ${trainingsThisWeek}` : "—"}</div>
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#667" }}>Constancia</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{routine ? `${consistency}%` : "—"}</div>
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#667" }}>Semana</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{routine ? fmtRange(routine.periodStart, routine.periodEnd) : "—"}</div>
            </div>
          </div>

          <button
            onClick={refresh}
            style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            Refrescar
          </button>
        </div>
      </div>

      <div style={{ marginTop: 22, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>Rutina semanal</h3>
            <div style={{ marginTop: 4, fontSize: 13, color: "#667" }}>Toca un día para ver ejercicios.</div>
          </div>
          <span style={{ fontSize: 12, color: "#667", border: "1px solid #eee", padding: "6px 10px", borderRadius: 999 }}>
            {routine ? "1 rutina activa" : "sin rutina"}
          </span>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#fee2e2", border: "1px solid #fecaca", color: "#7f1d1d" }}>
            {err} <Link to="/profile" style={{ marginLeft: 8 }}>Completar perfil</Link>
          </div>
        ) : null}

        {loading ? (
          <div style={{ marginTop: 14, color: "#667" }}>Cargando…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
            {DOW.map((it) => {
              const d = daysByDow.get(it.n) || null;
              const rest = isRestDay(d);
              const title = rest ? `${it.label} — Descanso` : `${it.label} — ${focusLabel(d?.focus || "")}`;
              const subtitle = rest ? "Descanso" : "Entrenamiento";
              const chip = "Pendiente";

              return (
                <Link
                  key={it.n}
                  to={rest ? "/dashboard" : `/day/${it.key}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    opacity: routine ? 1 : 0.6,
                    pointerEvents: routine && !rest ? "auto" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{title}</div>
                    <div style={{ marginTop: 2, fontSize: 12, color: "#667" }}>{subtitle}</div>
                  </div>
                  <div style={{ alignSelf: "center", fontSize: 12, color: "#556", border: "1px solid #eee", padding: "6px 10px", borderRadius: 999 }}>
                    {chip}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {!profile?.goal || !profile?.level ? (
        <div style={{ marginTop: 14, fontSize: 13, color: "#667" }}>
          Nota: si sale “Complete your profile first”, entra a <Link to="/profile">Perfil</Link> y llena goal/level.
        </div>
      ) : null}
    </div>
  );
}








