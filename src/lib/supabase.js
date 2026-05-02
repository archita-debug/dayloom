// ─── Supabase Client ──────────────────────────────────────────────────────────
export const SUPA_URL = "https://nhricohdcwqvmkhrenmq.supabase.co";
export const SUPA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocmljb2hkY3dxdm1raHJlbm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTQ1NTksImV4cCI6MjA5MzEzMDU1OX0.DHPhcUZVCgGR9fAEbh3E_cHmivkO-X_SNrp5eYZgicc";

let _token     = localStorage.getItem("sb_token")  || null;
let _userId    = localStorage.getItem("sb_uid")    || null;
let _userEmail = localStorage.getItem("sb_email")  || null;

export const getToken     = () => _token;
export const getUserId    = () => _userId;
export const getUserEmail = () => _userEmail;

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
  if (d.refresh_token) localStorage.setItem("sb_refresh", d.refresh_token);
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
  localStorage.removeItem("sb_refresh");
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
    localStorage.setItem("sb_token",   _token);
    localStorage.setItem("sb_uid",     _userId);
    localStorage.setItem("sb_email",   _userEmail);
    localStorage.setItem("sb_refresh", d.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Data (user_data table) ────────────────────────────────────────────────────
export async function dbGet(key) {
  const uid = getUserId();
  if (!uid) return null;
  try {
    const url = `${SUPA_URL}/rest/v1/user_data?user_id=eq.${uid}&key=eq.${encodeURIComponent(key)}&select=value`;
    const r = await fetch(url, { headers: authHeaders({ Accept: "application/json" }) });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function dbSet(key, value) {
  const uid = getUserId();
  if (!uid) return;

  // Check if row already exists
  const existsUrl = `${SUPA_URL}/rest/v1/user_data?user_id=eq.${uid}&key=eq.${encodeURIComponent(key)}&select=user_id`;
  const existsRes = await fetch(existsUrl, { headers: authHeaders({ Accept: "application/json" }) });
  const existsRows = existsRes.ok ? await existsRes.json() : [];
  const rowExists = existsRows.length > 0;

  if (rowExists) {
    // UPDATE existing row with PATCH
    const r = await fetch(
      `${SUPA_URL}/rest/v1/user_data?user_id=eq.${uid}&key=eq.${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ value }),
      }
    );
    if (!r.ok) console.error("[supabase] PATCH failed:", await r.text());
  } else {
    // INSERT new row with POST
    const r = await fetch(`${SUPA_URL}/rest/v1/user_data`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ user_id: uid, key, value }),
    });
    if (!r.ok) console.error("[supabase] POST failed:", await r.text());
  }
}
