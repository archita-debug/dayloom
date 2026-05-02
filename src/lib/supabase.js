// ─── Supabase Client (REST API, no npm needed) ────────────────────────────────
export const SUPA_URL = "https://nhricohdcwqvmkhrenmq.supabase.co";
export const SUPA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocmljb2hkY3dxdm1raHJlbm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTQ1NTksImV4cCI6MjA5MzEzMDU1OX0.DHPhcUZVCgGR9fAEbh3E_cHmivkO-X_SNrp5eYZgicc";

// Persist auth token in localStorage so session survives refresh
export let _token     = localStorage.getItem("sb_token")  || null;
export let _userId    = localStorage.getItem("sb_uid")    || null;
export let _userEmail = localStorage.getItem("sb_email")  || null;

export function authHeaders(extra = {}) {
  return {
    "Content-Type":  "application/json",
    "apikey":        SUPA_KEY,
    "Authorization": `Bearer ${_token || SUPA_KEY}`,
    ...extra,
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function supaSignUp(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPA_KEY },
    body: JSON.stringify({ email, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.msg || d.error_description || "Sign-up failed");
  return d;
}

export async function supaSignIn(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPA_KEY },
    body: JSON.stringify({ email, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error_description || d.msg || "Sign-in failed");
  _token     = d.access_token;
  _userId    = d.user?.id;
  _userEmail = d.user?.email;
  localStorage.setItem("sb_token",   _token);
  localStorage.setItem("sb_uid",     _userId);
  localStorage.setItem("sb_email",   _userEmail);
  return d;
}

export async function supaSignOut() {
  await fetch(`${SUPA_URL}/auth/v1/logout`, {
    method: "POST",
    headers: authHeaders(),
  }).catch(() => {});
  _token = _userId = _userEmail = null;
  localStorage.removeItem("sb_token");
  localStorage.removeItem("sb_uid");
  localStorage.removeItem("sb_email");
}

export async function supaRefreshToken() {
  const refresh = localStorage.getItem("sb_refresh");
  if (!refresh) return false;
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPA_KEY },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const d = await r.json();
    if (!r.ok) return false;
    _token     = d.access_token;
    _userId    = d.user?.id;
    _userEmail = d.user?.email;
    localStorage.setItem("sb_token",    _token);
    localStorage.setItem("sb_uid",      _userId);
    localStorage.setItem("sb_email",    _userEmail);
    localStorage.setItem("sb_refresh",  d.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Data (user_data table) ────────────────────────────────────────────────────
export async function dbGet(key) {
  const r = await fetch(
    `${SUPA_URL}/rest/v1/user_data?user_id=eq.${_userId}&key=eq.${key}&select=value`,
    { headers: authHeaders({ Accept: "application/json" }) }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0]?.value ?? null;
}

export async function dbSet(key, value) {
  const r = await fetch(`${SUPA_URL}/rest/v1/user_data`, {
    method: "POST",
    headers: authHeaders({ Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify({ user_id: _userId, key, value }),
  });
  if (!r.ok) {
    const e = await r.text();
    console.error("dbSet error:", e);
  }
}
