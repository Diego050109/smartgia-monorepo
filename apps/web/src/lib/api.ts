const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

function buildUrl(path: string) {
  // si ya viene URL completa, no tocar
  if (/^https?:\/\//i.test(path)) return path;
  // asegurar slash
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE_URL}${path}`;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : String(msg));
  }

  return data as T;
}

export function apiGet<T>(path: string, token?: string) {
  return request<T>("GET", path, undefined, token);
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return request<T>("POST", path, body, token);
}

export function apiPut<T>(path: string, body: unknown, token?: string) {
  return request<T>("PUT", path, body, token);
}

export function apiDelete<T>(path: string, token?: string) {
  return request<T>("DELETE", path, undefined, token);
}
