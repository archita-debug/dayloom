import { useState } from "react";
import { supaSignUp, supaSignIn, _token, _userId, _userEmail } from "../lib/supabase";

const BOARDS = [
  { emoji: "🌿", label: "Daily Habits",   color: "#34D399", bg: "#F0FDF4" },
  { emoji: "✅", label: "Task Board",     color: "#60A5FA", bg: "#EFF6FF" },
  { emoji: "💰", label: "Budget",         color: "#FBBF24", bg: "#FFFBEB" },
  { emoji: "📔", label: "Journal",        color: "#F472B6", bg: "#FDF2F8" },
  { emoji: "💪", label: "Fitness",        color: "#A78BFA", bg: "#F5F3FF" },
  { emoji: "📚", label: "Study Tracker",  color: "#06B6D4", bg: "#ECFEFF" },
];

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && password !== confirm) { setError("Passwords don't match."); return; }
    if (mode === "signup" && password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      if (mode === "signup") {
        const d = await supaSignUp(e, password);
        if (d.access_token) {
          localStorage.setItem("sb_token",   d.access_token);
          localStorage.setItem("sb_uid",     d.user?.id);
          localStorage.setItem("sb_email",   d.user?.email);
          if (d.refresh_token) localStorage.setItem("sb_refresh", d.refresh_token);
          onLogin(e);
        } else {
          setError("Check your email to confirm your account, then sign in.");
          setMode("login");
        }
      } else {
        const d = await supaSignIn(e, password);
        if (d.refresh_token) localStorage.setItem("sb_refresh", d.refresh_token);
        onLogin(e);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-grid" style={{ fontFamily: "'Nunito',sans-serif" }}>
      {/* Left decorative panel */}
      <div className="login-deco" style={{ background: "linear-gradient(155deg,#FDF0EB 0%,#F9E4DA 40%,#F2D0C2 100%)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div className="blob1" style={{ position: "absolute", top: "10%", left: "5%", width: 180, height: 180, borderRadius: "60% 40% 50% 60%", background: "rgba(212,117,106,.15)" }} />
        <div className="blob2" style={{ position: "absolute", bottom: "12%", right: "8%", width: 140, height: 140, borderRadius: "50% 60% 40% 50%", background: "rgba(143,175,138,.18)" }} />
        <div className="blob3" style={{ position: "absolute", top: "45%", right: "20%", width: 90, height: 90, borderRadius: "50%", background: "rgba(244,114,182,.13)" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 320 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "var(--terracotta)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>Your Boards</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {BOARDS.map((b, i) => (
              <div key={b.label} style={{ background: b.bg, border: "1px solid rgba(0,0,0,.06)", borderRadius: 20, padding: "18px 16px", animation: `fadeUp .5s ease ${i * 0.1}s both`, gridColumn: i === 5 ? "span 2" : "auto" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{b.emoji}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{b.label}</div>
                <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: "rgba(0,0,0,.06)", overflow: "hidden" }}>
                  <div style={{ width: `${40 + i * 10}%`, height: "100%", background: b.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", fontWeight: 300, color: "var(--warm-gray)", lineHeight: 1.4 }}>
            "Weaving your day together,<br/>one habit at a time."
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form" style={{ background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 380, animation: "fadeUp .5s ease .1s both" }}>
          <div className="flex items-center gap-3 mb-8">
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pinterest-red)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>D</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Dayloom</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div style={{ fontSize: 14, color: "var(--warm-gray)", marginBottom: 26 }}>
            {mode === "login" ? "Sign in to access your boards from any device." : "Start tracking your goals today."}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#DC2626", animation: "popIn .2s ease" }}>
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Email</label>
              <input className="pin-input" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && submit()} autoComplete="email" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Password</label>
              <input className="pin-input" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Min 6 characters" onKeyDown={e => e.key === "Enter" && submit()} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>
            {mode === "signup" && (
              <div style={{ animation: "popIn .2s ease" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>Confirm Password</label>
                <input className="pin-input" type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} autoComplete="new-password" />
              </div>
            )}
            <button className="pill-btn red" onClick={submit} disabled={loading} style={{ padding: "13px 24px", fontSize: 15, fontWeight: 700, marginTop: 4, width: "100%", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading
                ? <><div className="spinner" /> {mode === "login" ? "Signing in…" : "Creating account…"}</>
                : mode === "login" ? "Sign in →" : "Create my account →"}
            </button>
          </div>

          <div style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: "var(--warm-gray)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setPassword(""); setConfirm(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--terracotta)", fontWeight: 700, fontFamily: "'Nunito',sans-serif", fontSize: 13, padding: 0 }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
