"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";

type Profile = {
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  level?: string;
};

type Routine = {
  _id: string;
  title: string;
  goal: string;
  level: string;
  exercises: string[];
  createdAt?: string;
};

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Form: Perfil
  const [pAge, setPAge] = useState<string>("");
  const [pWeight, setPWeight] = useState<string>("");
  const [pHeight, setPHeight] = useState<string>("");
  const [pGoal, setPGoal] = useState<string>("fuerza");
  const [pLevel, setPLevel] = useState<string>("intermedio");
  const [savingProfile, setSavingProfile] = useState(false);

  // Form: Rutina
  const [rTitle, setRTitle] = useState("Rutina UI");
  const [rGoal, setRGoal] = useState("fuerza");
  const [rLevel, setRLevel] = useState("intermedio");
  const [rExercises, setRExercises] = useState("pushups, squats");
  const [creatingRoutine, setCreatingRoutine] = useState(false);

  const hasToken = useMemo(() => Boolean(token), [token]);

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  function handleAuthError(e: any) {
    const message = e?.message ?? "Error";
    console.log("❌ handleAuthError:", e);

    if (
      String(message).toLowerCase().includes("unauthorized") ||
      String(message).includes("401")
    ) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    setErr(String(message));
  }

  async function loadAll(tk: string) {
    setErr(null);
    setMsg(null);
    setLoading(true);

    // Perfil
    try {
      const prof = await apiGet<any>("/users/profile", tk);
      setProfile(prof ?? null);

      setPAge(prof?.age != null ? String(prof.age) : "");
      setPWeight(prof?.weight != null ? String(prof.weight) : "");
      setPHeight(prof?.height != null ? String(prof.height) : "");
      setPGoal(prof?.goal ?? "fuerza");
      setPLevel(prof?.level ?? "intermedio");
    } catch (e: any) {
      const m = e?.message ?? "";
      if (String(m).toLowerCase().includes("not found")) {
        setProfile(null);
      } else {
        handleAuthError(e);
      }
    }

    // Rutinas ✅ FIX: backend devuelve ARRAY directo
    try {
      const res = await apiGet<any>("/routines/routines", tk);
      setRoutines(Array.isArray(res) ? (res as Routine[]) : []);
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const tk = localStorage.getItem("accessToken");
    const storedEmail = localStorage.getItem("email");

    if (!tk) {
      window.location.href = "/login";
      return;
    }

    setToken(tk);
    setEmail(storedEmail);

    loadAll(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setErr(null);
    setMsg(null);
    setSavingProfile(true);

    try {
      const body: Profile = {
        age: pAge ? Number(pAge) : undefined,
        weight: pWeight ? Number(pWeight) : undefined,
        height: pHeight ? Number(pHeight) : undefined,
        goal: pGoal,
        level: pLevel,
      };

      console.log("➡️ PUT /users/profile", body);

      const updated = await apiPut<any>("/users/profile", body, token);
      setProfile(updated);
      setMsg("✅ Perfil guardado");
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setSavingProfile(false);
    }
  }

  async function onCreateRoutine(e: React.FormEvent) {
    e.preventDefault();
    console.log("✅ SUBMIT onCreateRoutine");
    if (!token) return;

    setErr(null);
    setMsg(null);
    setCreatingRoutine(true);

    try {
      const exercises = rExercises
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        title: rTitle,
        goal: rGoal,
        level: rLevel,
        exercises,
      };

      console.log("➡️ POST /routines/routines", payload);

      await apiPost<any>("/routines/routines", payload, token);

      setMsg("✅ Rutina creada");

      // refrescar lista ✅ FIX: backend devuelve ARRAY directo
      const res = await apiGet<any>("/routines/routines", token);
      setRoutines(Array.isArray(res) ? (res as Routine[]) : []);

      // opcional: limpiar inputs
      setRTitle("Rutina UI");
      setRExercises("pushups, squats");
    } catch (e: any) {
      handleAuthError(e);
    } finally {
      setCreatingRoutine(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">SmartGIA — Dashboard</h1>
        <button
          className="rounded-xl border px-3 py-2 hover:opacity-90"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <p className="text-sm opacity-80">Sesión:</p>
        <p className="font-medium">{email ?? "-"}</p>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border p-4">
          <p className="text-sm opacity-80">Cargando perfil y rutinas…</p>
        </div>
      )}

      {msg && (
        <div className="mt-6 rounded-xl border p-4">
          <p className="text-sm">{msg}</p>
        </div>
      )}

      {err && (
        <div className="mt-6 rounded-xl border p-4">
          <p className="text-sm">❌ {err}</p>
          <p className="text-sm opacity-70 mt-1">
            Si es 401, vuelve a iniciar sesión.
          </p>
        </div>
      )}

      {/* PERFIL */}
      <div className="mt-6 rounded-xl border p-4">
        <h2 className="font-semibold">Perfil</h2>

        {profile ? (
          <div className="mt-3 space-y-1 text-sm opacity-90">
            <p>Edad: {profile.age ?? "-"}</p>
            <p>Peso: {profile.weight ?? "-"}</p>
            <p>Altura: {profile.height ?? "-"}</p>
            <p>Objetivo: {profile.goal ?? "-"}</p>
            <p>Nivel: {profile.level ?? "-"}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm opacity-70">
            Aún no tienes perfil. Llena el formulario y guárdalo.
          </p>
        )}

        <form
          onSubmit={onSaveProfile}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="space-y-1">
            <label className="text-sm opacity-80">Edad</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={pAge}
              onChange={(e) => setPAge(e.target.value)}
              placeholder="28"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Peso (kg)</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={pWeight}
              onChange={(e) => setPWeight(e.target.value)}
              placeholder="80"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Altura (cm)</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={pHeight}
              onChange={(e) => setPHeight(e.target.value)}
              placeholder="175"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Objetivo</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={pGoal}
              onChange={(e) => setPGoal(e.target.value)}
            >
              <option value="fuerza">fuerza</option>
              <option value="bajar_peso">bajar_peso</option>
              <option value="resistencia">resistencia</option>
              <option value="hipertrofia">hipertrofia</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Nivel</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={pLevel}
              onChange={(e) => setPLevel(e.target.value)}
            >
              <option value="principiante">principiante</option>
              <option value="intermedio">intermedio</option>
              <option value="avanzado">avanzado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl border px-3 py-2 hover:opacity-90 disabled:opacity-60"
              disabled={!hasToken || savingProfile}
            >
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </button>
          </div>
        </form>
      </div>

      {/* RUTINAS */}
      <div className="mt-6 rounded-xl border p-4">
        <h2 className="font-semibold">Mis rutinas</h2>

        <form
          onSubmit={onCreateRoutine}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm opacity-80">Título</label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={rTitle}
              onChange={(e) => setRTitle(e.target.value)}
              placeholder="Rutina Full Body"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Objetivo</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={rGoal}
              onChange={(e) => setRGoal(e.target.value)}
            >
              <option value="fuerza">fuerza</option>
              <option value="bajar_peso">bajar_peso</option>
              <option value="resistencia">resistencia</option>
              <option value="hipertrofia">hipertrofia</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-80">Nivel</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={rLevel}
              onChange={(e) => setRLevel(e.target.value)}
            >
              <option value="principiante">principiante</option>
              <option value="intermedio">intermedio</option>
              <option value="avanzado">avanzado</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm opacity-80">
              Ejercicios (separados por coma)
            </label>
            <input
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
              value={rExercises}
              onChange={(e) => setRExercises(e.target.value)}
              placeholder="pushups, squats, plank"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl border px-3 py-2 hover:opacity-90 disabled:opacity-60"
              disabled={!hasToken || creatingRoutine}
              onClick={() => console.log("🟦 CLICK crear rutina")}
            >
              {creatingRoutine ? "Creando…" : "Crear rutina"}
            </button>
          </div>
        </form>

        <div className="mt-5 space-y-2">
          {routines.length === 0 && (
            <p className="opacity-70 text-sm">No tienes rutinas aún</p>
          )}

          {routines.map((r) => (
            <div key={r._id} className="rounded-xl border p-3">
              <p className="font-medium">{r.title}</p>
              <p className="text-sm opacity-80">
                {r.goal} · {r.level}
              </p>
              {Array.isArray(r.exercises) && r.exercises.length > 0 && (
                <p className="text-sm opacity-70 mt-1">
                  {r.exercises.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

