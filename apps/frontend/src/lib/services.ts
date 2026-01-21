import { api } from "./http";

export type Profile = {
  email?: string;
  name?: string;
  goal?: string;
  level?: string;
};

export async function meProfile(): Promise<Profile> {
  // segun tu gateway, user-service expone /users/profile
  // (porque el gateway monta /users + controller @Get("profile"))
  return api("/users/profile");
}

export async function updateProfile(payload: Partial<Profile>) {
  return api("/users/profile", { method: "PUT", json: payload });
}

export async function getActiveRoutine() {
  return api("/routines/active");
}

export async function getWeekRoutine() {
  return api("/routines/active");
}

export async function generateWeekly(daysPerWeek = 4) {
  return api("/routines/generate", {
    method: "POST",
    json: { daysPerWeek },
  });
}




export async function getTodayRoutine() {
  return api("/routines/today");
}

export async function completeToday() {
  return api("/routines/today/complete", { method: "POST" });
}

