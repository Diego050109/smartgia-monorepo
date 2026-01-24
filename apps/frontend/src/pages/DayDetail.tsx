import React, { useEffect, useMemo, useState } from "react";
import {  getWeekRoutine, completeToday  } from "../lib/services";
import { useNavigate, useParams } from "react-router-dom";

type Exercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
};

type RoutineDay = { dayOfWeek: number; focus?: string; exercises?: Exercise[] };
type Routine = { _id?: string; id?: string; title?: string; days?: RoutineDay[] };

const DAYS = [
  { key: "mon", label: "Lunes", dow: 1 },
  { key: "tue", label: "Martes", dow: 2 },
  { key: "wed", label: "Miércoles", dow: 3 },
  { key: "thu", label: "Jueves", dow: 4 },
  { key: "fri", label: "Viernes", dow: 5 },
  { key: "sat", label: "Sábado", dow: 6 },
  { key: "sun", label: "Domingo", dow: 7 },
];

function getProgressKey(routineId?: string) {
  return `progress:${routineId || "default"}`;
}

function stepsFor(exId: string, name: string) {
  const m: Record<string, string[]> = {
    bench: [
      "Acuéstate en el banco con pies firmes en el suelo.",
      "Agarra la barra un poco más ancho que hombros.",
      "Baja controlado al pecho y empuja hacia arriba sin rebotar.",
    ],
    squat: [
      "Pies al ancho de hombros, puntas ligeramente afuera.",
      "Baja caderas atrás/abajo con espalda neutra.",
      "Sube empujando el piso, rodillas alineadas.",
    ],
  };
  return m[exId] || [
    `Colócate en posición correcta para ${name}.`,
    "Ejecuta el movimiento controlado, sin dolor.",
    "Respira: exhala al esfuerzo e inhala al regresar.",
  ];
}

export default function DayDetail() {
  const nav = useNavigate();
  const params = useParams();
  const dayKey = (params.day || "mon").toLowerCase();
  const dayMeta = DAYS.find((d) => d.key === dayKey) || DAYS[0];

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [timer, setTimer] = useState<number>(0);
  const [timerOn, setTimerOn] = useState<boolean>(false);

  useEffect(() => {
    let i: any = null;
    if (timerOn && timer > 0) {
      i = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    }
    if (timer === 0) setTimerOn(false);
return () => i && clearInterval(i);
  }, [timerOn, timer]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const r = await getWeekRoutine();
      setRoutine(r);
    } catch (e: any) {
      setRoutine(null);
      setErr(e?.message || "No se pudo cargar la rutina");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [dayKey]);

  const routineId = (routine?._id || routine?.id || "") as string;

  const day = useMemo(() => {
    const days = routine?.days || [];
    return days.find((d) => d.dayOfWeek === dayMeta.dow) || null;
  }, [routine, dayMeta.dow]);

  const [progress, setProgress] = React.useState<any>(() => {
  try {
    return JSON.parse(localStorage.getItem(getProgressKey(rid)) || '{"days":{},"ex":{}}');
  } catch {
    return { days: {}, ex: {} };
  }
});

React.useEffect(() => {
  if (!routineId) return;
  try {
    setProgress(JSON.parse(localStorage.getItem(getProgressKey(rid)) || '{"days":{},"ex":{}}'));
  } catch {
    setProgress({ days: {}, ex: {} });
  }
}, [routineId]);
function saveProgress(next: any) {
    localStorage.setItem(getProgressKey(routineId), JSON.stringify(next));
    setProgress(next);

  }

  const doneDay = !!(routine?.completedDays?.includes(dayMeta.dow) || progress?.days?.[dayKey]?.done);

  function toggleDayDone() {
    const next = { ...progress, days: { ...(progress.days || {}) } };
    next.days[dayKey] = { ...(next.days[dayKey] || {}), done: !doneDay };
    saveProgress(next);
    setRoutine((r) => (r ? ({ ...r } as any) : r));
  }

  function toggleExercise(exId: string) {
    const next = { ...progress, ex: { ...(progress.ex || {}) } };
    next.ex[`${dayKey}:${exId}`] = !next.ex[`${dayKey}:${exId}`];
    saveProgress(next);
    setRoutine((r) => (r ? ({ ...r } as any) : r));
  }

  const card: React.CSSProperties = {
    maxWidth: 900,
    margin: "24px auto",
    padding: 18,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
    background: "white",
  };
  const btn: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer" };

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;return (
    <div style={{ padding: 12 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>{dayMeta.label}</h2>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              {day?.exercises?.length ? `Enfoque: ${day?.focus || "Entrenamiento"}` : "Descanso"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btn, background: "#f2f2f2" }} onClick={() => nav("/dashboard")}>Volver</button>
            <button
              style={{ ...btn, background: doneDay ? "#111" : "#eaeaea", color: doneDay ? "white" : "#111" }}
              onClick={async () => {
  try {
    await completeToday();
    const fresh = await getWeekRoutine();
    setRoutine(fresh as any);
    toggleDayDone();
  } catch (e: any) {
    alert(e?.message || "No se pudo marcar el día como completado");
  }
}}
            >
              {doneDay ? " Día completado" : "Marcar día como completado"}
            </button>
          </div>
        </div>

        {err && (
          <div style={{ marginTop: 12, background: "#ffe8e8", color: "#7b1c1c", padding: 10, borderRadius: 10 }}>
            {err}
          </div>
        )}

        {!day?.exercises?.length ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#fafafa" }}>
            Hoy no hay ejercicios. Descansa 
          </div>
        ) : (
          <>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0 }}>Ejercicios</h3>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,.12)" }}>
                  Descanso: <b>{timer}s</b>
                </div>
                <button style={{ ...btn, background: "#111", color: "white" }} onClick={() => { setTimer(60); setTimerOn(true); }}>
                  Iniciar 60s
                </button>
                <button style={{ ...btn, background: "#f2f2f2" }} onClick={() => { setTimer(0); setTimerOn(false); }}>
                  Reset
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {day.exercises.map((ex) => {
                const exDone = !!progress?.ex?.[`${dayKey}:${ex.exerciseId}`];
                const steps = stepsFor(ex.exerciseId, ex.name);return (
                  <div key={ex.exerciseId} style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,.10)", boxShadow: "0 6px 16px rgba(0,0,0,.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{ex.name}</div>
                        <div style={{ marginTop: 6, opacity: 0.85 }}>
                          <b>Sets:</b> {ex.sets} &nbsp;|&nbsp; <b>Reps:</b> {ex.reps} &nbsp;|&nbsp; <b>Descanso:</b> {ex.restSeconds}s
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          style={{ ...btn, background: exDone ? "#111" : "#eaeaea", color: exDone ? "white" : "#111" }}
                          onClick={() => toggleExercise(ex.exerciseId)}
                        >
                          {exDone ? " Hecho" : "Marcar hecho"}
                        </button>

                        <button
                          style={{ ...btn, background: "#111", color: "white" }}
                          onClick={() => { setTimer(ex.restSeconds || 60); setTimerOn(true); }}
                        >
                          Descanso
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Pasos</div>
                      <ol style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
                        {steps.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
                      </ol>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}























