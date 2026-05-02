export const TEMPLATES = [
  { id: "habits",  label: "Daily Habits",    emoji: "🌿", desc: "Track streaks & monthly goals",   accent: "#34D399", bg: "linear-gradient(135deg,#F0FDF4,#DCFCE7)" },
  { id: "tasks",   label: "Task Manager",    emoji: "✅", desc: "Organized task board",            accent: "#60A5FA", bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" },
  { id: "budget",  label: "Money Budget",    emoji: "💰", desc: "Income, expenses & limits",       accent: "#FBBF24", bg: "linear-gradient(135deg,#FFFBEB,#FEF3C7)" },
  { id: "journal", label: "Daily Journal",   emoji: "📔", desc: "Mood tracking & free writing",    accent: "#F472B6", bg: "linear-gradient(135deg,#FDF2F8,#FCE7F3)" },
  { id: "fitness", label: "Fitness Tracker", emoji: "💪", desc: "Workouts, calories & goals",      accent: "#A78BFA", bg: "linear-gradient(135deg,#F5F3FF,#EDE9FE)" },
  { id: "study",   label: "Study Tracker",   emoji: "📚", desc: "Sessions, subjects & focus time", accent: "#06B6D4", bg: "linear-gradient(135deg,#ECFEFF,#CFFAFE)" },
];

const HEIGHTS = [180, 210, 170, 200, 185, 190];

export default function HomePage({ userEmail, onLogout, onSelect }) {
  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Top nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(253,248,243,.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--pinterest-red)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>D</span>
          Dayloom
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warm-gray)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>👤 {userEmail}</span>
          <button className="pill-btn" onClick={onLogout} style={{ fontSize: 12, padding: "6px 12px" }}>Sign out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 18px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "var(--terracotta)", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Weaving your day together</div>
          <div className="home-title">Choose your board</div>
          <div style={{ fontSize: 14, color: "var(--warm-gray)" }}>Six apps, beautifully yours. Pick one to get started.</div>
        </div>

        <div className="home-board-grid">
          {TEMPLATES.map((t, i) => (
            <div key={t.id} style={{ breakInside: "avoid", marginBottom: 14 }}>
              <button
                onClick={() => onSelect(t.id)}
                style={{ width: "100%", height: HEIGHTS[i], background: t.bg, border: "1px solid var(--border)", borderRadius: 20, cursor: "pointer", fontFamily: "'Nunito',sans-serif", textAlign: "left", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform .22s ease,box-shadow .22s ease", animation: `fadeUp .4s ease ${i * 0.07}s both`, position: "relative", overflow: "hidden", touchAction: "manipulation" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(44,31,26,.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ position: "absolute", bottom: -18, right: -18, width: 80, height: 80, borderRadius: "50%", background: t.accent + "22" }} />
                <div style={{ fontSize: 30 }}>{t.emoji}</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "var(--warm-gray)", lineHeight: 1.4, marginBottom: 10 }}>{t.desc}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, background: t.accent + "18", borderRadius: 999, padding: "4px 11px" }}>Open →</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
