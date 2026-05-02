import { useState, useEffect, useRef } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid, pct, days7 } from "../lib/utils";
import { Loader, ProgressBar, SectionHeader, StatPill } from "../components/ui";

// Subject color palette
const PALETTE = ["#06B6D4", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899", "#3B82F6", "#F97316"];

// Study session types
const SESSION_TYPES = {
  reading:   { label: "Reading",     icon: "📖", color: "#06B6D4" },
  practice:  { label: "Practice",    icon: "✏️", color: "#8B5CF6" },
  revision:  { label: "Revision",    icon: "🔄", color: "#F59E0B" },
  lecture:   { label: "Lecture",     icon: "🎧", color: "#10B981" },
  project:   { label: "Project",     icon: "🛠️", color: "#EF4444" },
};

// Empty by default — users add their own subjects & sessions
const DEF_SUBJECTS = [];
const DEF_SESSIONS = [];
const DEF_GOALS    = { dailyMinutes: 60, weeklyMinutes: 300 };

// ── Pomodoro timer ────────────────────────────────────────────────────────────
function PomodoroTimer({ onComplete }) {
  const [running,   setRunning]   = useState(false);
  const [mode,      setMode]      = useState("focus");   // "focus" | "break"
  const [seconds,   setSeconds]   = useState(25 * 60);
  const [pomoDone,  setPomoDone]  = useState(0);
  const intervalRef = useRef(null);

  const DURATIONS = { focus: 25 * 60, break: 5 * 60 };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") {
              setPomoDone(n => n + 1);
              onComplete && onComplete(25); // 25 minutes completed
            }
            // Switch mode
            const next = mode === "focus" ? "break" : "focus";
            setMode(next);
            setSeconds(DURATIONS[next]);
            return DURATIONS[next];
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(DURATIONS[mode]);
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const progress = 1 - seconds / DURATIONS[mode];
  const accent   = mode === "focus" ? "#06B6D4" : "#10B981";
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="pin-card" style={{ padding: "20px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "var(--warm-gray)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
        {mode === "focus" ? "Focus Session" : "Break Time"}
      </div>

      {/* SVG ring timer */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={64} cy={64} r={54} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth={8} />
          <circle cx={64} cy={64} r={54} fill="none" stroke={accent} strokeWidth={8}
            strokeDasharray={`${progress * circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray .5s linear" }}
          />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{mins}:{secs}</div>
          <div style={{ fontSize: 10, color: "var(--warm-gray)", marginTop: 2 }}>🍅 ×{pomoDone}</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-2 mb-4">
        {["focus", "break"].map(m => (
          <button key={m} onClick={() => { if (!running) { setMode(m); setSeconds(DURATIONS[m]); } }}
            style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: "'Nunito',sans-serif", border: `1.5px solid ${mode === m ? accent : "var(--border)"}`, background: mode === m ? accent : "transparent", color: mode === m ? "#fff" : "var(--warm-gray)", cursor: running ? "not-allowed" : "pointer", transition: "all .15s" }}>
            {m === "focus" ? "Focus" : "Break"}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button className="pill-btn" onClick={() => setRunning(p => !p)}
          style={{ background: running ? "var(--ink)" : accent, color: "#fff", border: "none", padding: "8px 22px", fontSize: 13, fontWeight: 700, minWidth: 90 }}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="pill-btn" onClick={reset} style={{ fontSize: 13 }}>Reset</button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StudyTemplate() {
  const [subjects,  setSubjects,  s1] = useSupaPersist("study_subjects_v1", DEF_SUBJECTS);
  const [sessions,  setSessions,  s2] = useSupaPersist("study_sessions_v1", DEF_SESSIONS);
  const [goals,     setGoals,     s3] = useSupaPersist("study_goals_v1",    DEF_GOALS);

  const [tab,         setTab]         = useState("log");
  const [addingSubj,  setAddingSubj]  = useState(false);
  const [addingSess,  setAddingSess]  = useState(false);
  const [subjForm,    setSubjForm]    = useState({ name: "", color: PALETTE[0], target: 60 });
  const [sessForm,    setSessForm]    = useState({ date: todayISO(), subject: "", type: "reading", minutes: "", notes: "" });

  const today  = todayISO();
  const week   = days7();

  // Derived stats
  const todaySessions  = sessions.filter(s => s.date === today);
  const todayMins      = todaySessions.reduce((a, s) => a + (s.minutes || 0), 0);
  const weekSessions   = sessions.filter(s => week.includes(s.date));
  const weekMins       = weekSessions.reduce((a, s) => a + (s.minutes || 0), 0);
  const totalSessions  = sessions.length;

  const minsPerSubject = subjects.reduce((acc, sub) => {
    acc[sub.id] = sessions.filter(s => s.subject === sub.id).reduce((a, s) => a + (s.minutes || 0), 0);
    return acc;
  }, {});

  const addSubject = () => {
    if (!subjForm.name.trim()) return;
    setSubjects(p => [...p, { id: uid(), ...subjForm }]);
    setSubjForm({ name: "", color: PALETTE[subjects.length % PALETTE.length], target: 60 });
    setAddingSubj(false);
  };

  const addSession = () => {
    if (!sessForm.subject || !sessForm.minutes) return;
    setSessions(p => [{ id: uid(), ...sessForm, minutes: +sessForm.minutes }, ...p]);
    setSessForm({ date: todayISO(), subject: "", type: "reading", minutes: "", notes: "" });
    setAddingSess(false);
  };

  // Called when a pomodoro completes — auto-log 25 mins for selected subject
  const handlePomoComplete = (mins) => {
    if (!sessForm.subject) return;
    setSessions(p => [{ id: uid(), date: todayISO(), subject: sessForm.subject, type: "practice", minutes: mins, notes: "🍅 Pomodoro" }, ...p]);
  };

  if (!s1 || !s2 || !s3) return <Loader text="Loading study tracker…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg,#ECFEFF,#CFFAFE,#A5F3FC)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#0891B2", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Study Tracker</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>Your Focus Board</div>
          <div className="fitness-stats">
            {[
              { label: "Today",       value: `${todayMins}m`,     color: "#06B6D4" },
              { label: "This week",   value: `${weekMins}m`,      color: "#8B5CF6" },
              { label: "Sessions",    value: totalSessions,        color: "#F59E0B" },
              { label: "Subjects",    value: subjects.length,      color: "#10B981" },
            ].map(s => (
              <div key={s.label} className="pin-card" style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        {/* Tab bar */}
        <div className="budget-actions">
          <div className="tab-bar">
            {["log", "subjects", "timer", "stats"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`pill-btn${tab === t ? " active" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                {t === "timer" ? "⏱ Timer" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {tab === "log"      && <button className="pill-btn red" onClick={() => setAddingSess(p => !p)} style={{ fontSize: 12 }}>+ Log session</button>}
          {tab === "subjects" && <button className="pill-btn red" onClick={() => setAddingSubj(p => !p)} style={{ fontSize: 12 }}>+ Add subject</button>}
        </div>

        {/* ── LOG TAB ── */}
        {tab === "log" && (
          <>
            {/* Add session form */}
            {addingSess && (
              <div className="pin-card" style={{ padding: "14px", marginBottom: 16, animation: "popIn .2s ease" }}>
                <div className="form-grid-4" style={{ marginBottom: 10 }}>
                  <select className="pin-input" value={sessForm.subject} onChange={e => setSessForm(p => ({ ...p, subject: e.target.value }))}>
                    <option value="">Select subject…</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select className="pin-input" value={sessForm.type} onChange={e => setSessForm(p => ({ ...p, type: e.target.value }))}>
                    {Object.entries(SESSION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                  <input type="number" className="pin-input" value={sessForm.minutes} onChange={e => setSessForm(p => ({ ...p, minutes: e.target.value }))} placeholder="Minutes" />
                  <input type="date"   className="pin-input" value={sessForm.date}    onChange={e => setSessForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-row-add">
                  <input className="pin-input" value={sessForm.notes} onChange={e => setSessForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes…" onKeyDown={e => e.key === "Enter" && addSession()} />
                  <button className="pill-btn red" onClick={addSession}           style={{ fontSize: 12 }}>Save</button>
                  <button className="pill-btn"     onClick={() => setAddingSess(false)} style={{ fontSize: 12 }}>×</button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {sessions.length === 0 && !addingSess && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic" }}>
                Add a subject first, then log your study sessions 📚
              </div>
            )}

            {/* Session cards */}
            <div className="masonry">
              {sessions.map((sess, i) => {
                const sub = subjects.find(s => s.id === sess.subject);
                const st  = SESSION_TYPES[sess.type] || SESSION_TYPES.reading;
                return (
                  <div key={sess.id} className="pin-card" style={{ padding: "14px", borderLeft: `3px solid ${sub?.color || "#06B6D4"}`, animationDelay: `${i * 0.04}s` }}>
                    <div className="flex gap-3 items-start">
                      <div style={{ width: 36, height: 36, borderRadius: 11, background: (sub?.color || "#06B6D4") + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{st.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sub?.name || "Unknown subject"}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 2 }}>{sess.date} · {st.label}</div>
                        {sess.notes && <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 3 }}>{sess.notes}</div>}
                      </div>
                      <button onClick={() => setSessions(p => p.filter(x => x.id !== sess.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 17, flexShrink: 0 }}>×</button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span style={{ fontSize: 11, fontWeight: 700, color: sub?.color || "#06B6D4", background: (sub?.color || "#06B6D4") + "15", borderRadius: 999, padding: "3px 10px" }}>{sess.minutes} min</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.color + "15", borderRadius: 999, padding: "3px 10px" }}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SUBJECTS TAB ── */}
        {tab === "subjects" && (
          <>
            {/* Add subject form */}
            {addingSubj && (
              <div className="pin-card" style={{ padding: "14px", marginBottom: 16, animation: "popIn .2s ease" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                  <input className="pin-input" value={subjForm.name} onChange={e => setSubjForm(p => ({ ...p, name: e.target.value }))} placeholder="Subject name…" style={{ flex: 1, minWidth: 140 }} onKeyDown={e => e.key === "Enter" && addSubject()} />
                  <input type="number" className="pin-input" value={subjForm.target} onChange={e => setSubjForm(p => ({ ...p, target: +e.target.value }))} placeholder="Monthly target (hrs)" style={{ width: 160 }} />
                </div>
                <div className="flex gap-2 flex-wrap mb-3 items-center">
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warm-gray)" }}>Color:</span>
                  {PALETTE.map(c => (
                    <button key={c} onClick={() => setSubjForm(p => ({ ...p, color: c }))} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: subjForm.color === c ? "3px solid var(--ink)" : "2.5px solid transparent", cursor: "pointer", flexShrink: 0 }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="pill-btn red" onClick={addSubject}               style={{ fontSize: 12 }}>Add subject</button>
                  <button className="pill-btn"     onClick={() => setAddingSubj(false)} style={{ fontSize: 12 }}>Cancel</button>
                </div>
              </div>
            )}

            {subjects.length === 0 && !addingSubj && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic" }}>
                Add your first subject to start tracking 📖
              </div>
            )}

            <div className="masonry">
              {subjects.map((sub, i) => {
                const totalMins = minsPerSubject[sub.id] || 0;
                const targetMins = (sub.target || 0) * 60;
                const subSessions = sessions.filter(s => s.subject === sub.id);
                return (
                  <div key={sub.id} className="pin-card" style={{ padding: "16px", borderLeft: `3px solid ${sub.color}`, animationDelay: `${i * 0.05}s` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 2 }}>{subSessions.length} sessions · {Math.round(totalMins / 60 * 10) / 10}h studied</div>
                      </div>
                      <button onClick={() => setSubjects(p => p.filter(x => x.id !== sub.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 17 }}>×</button>
                    </div>
                    {targetMins > 0 && (
                      <>
                        <ProgressBar value={totalMins} max={targetMins} color={sub.color} height={6} />
                        <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 4 }}>
                          {Math.round(totalMins / 60 * 10) / 10}h / {sub.target}h monthly target
                        </div>
                      </>
                    )}
                    {/* Session type breakdown */}
                    <div className="flex gap-1 flex-wrap mt-3">
                      {Object.entries(SESSION_TYPES).map(([k, v]) => {
                        const cnt = subSessions.filter(s => s.type === k).length;
                        if (!cnt) return null;
                        return <span key={k} style={{ fontSize: 10, fontWeight: 700, color: v.color, background: v.color + "15", borderRadius: 999, padding: "2px 8px" }}>{v.icon} {cnt}</span>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TIMER TAB ── */}
        {tab === "timer" && (
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            {/* Subject selector for auto-logging */}
            {subjects.length > 0 && (
              <div className="pin-card" style={{ padding: "14px", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Auto-log pomodoros to:</div>
                <select className="pin-input" value={sessForm.subject} onChange={e => setSessForm(p => ({ ...p, subject: e.target.value }))}>
                  <option value="">Don't auto-log</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <PomodoroTimer onComplete={handlePomoComplete} />
            <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", fontSize: 12, color: "var(--warm-gray)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--ink)" }}>How it works:</strong> Focus for 25 minutes, take a 5-minute break. If you select a subject above, every completed focus session is automatically logged.
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <>
            {/* Daily goal */}
            <div className="pin-card" style={{ padding: "18px", marginBottom: 14 }}>
              <SectionHeader title="Daily & Weekly Goals" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { key: "dailyMinutes",  label: "Daily goal (minutes)",   current: todayMins },
                  { key: "weeklyMinutes", label: "Weekly goal (minutes)",  current: weekMins  },
                ].map(g => (
                  <div key={g.key}>
                    <div className="flex justify-between items-center mb-2">
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{g.label}</label>
                      <input type="number" className="pin-input" value={goals[g.key]} onChange={e => setGoals(p => ({ ...p, [g.key]: +e.target.value }))} style={{ width: 72, textAlign: "center" }} />
                    </div>
                    <ProgressBar value={g.current} max={goals[g.key] || 1} color="#06B6D4" height={6} />
                    <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 4 }}>{g.current} / {goals[g.key]} min</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week bar chart */}
            <div className="pin-card" style={{ padding: "16px", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "var(--ink)", marginBottom: 12 }}>Study Minutes This Week</div>
              <div className="week-bar">
                {week.map(d => {
                  const mins  = sessions.filter(s => s.date === d).reduce((a, s) => a + s.minutes, 0);
                  const maxM  = Math.max(...week.map(d2 => sessions.filter(s => s.date === d2).reduce((a, s) => a + s.minutes, 0)), 1);
                  const h     = Math.max((mins / maxM) * 70, mins > 0 ? 12 : 4);
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1">
                      <div style={{ fontSize: 8, color: "var(--warm-gray)", fontWeight: 700 }}>{mins > 0 ? `${mins}m` : ""}</div>
                      <div style={{ width: "100%", height: h, background: mins ? "#06B6D4" : "var(--sand)", borderRadius: 5, transition: "height .4s" }} />
                      <div style={{ fontSize: 9, color: "var(--warm-gray)", fontWeight: 700 }}>{new Date(d + "T00:00").toLocaleDateString("en-US", { weekday: "short" })}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-subject breakdown */}
            {subjects.length > 0 && (
              <div className="pin-card" style={{ padding: "18px" }}>
                <SectionHeader title="Time per Subject" />
                <div className="flex flex-col gap-4 mt-2">
                  {subjects.map(sub => {
                    const mins = minsPerSubject[sub.id] || 0;
                    const totalAllSubjects = Object.values(minsPerSubject).reduce((a, m) => a + m, 0);
                    return (
                      <div key={sub.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{sub.name}</span>
                          <span style={{ fontSize: 12, color: "var(--warm-gray)", fontWeight: 600 }}>{Math.round(mins / 60 * 10) / 10}h · {pct(mins, totalAllSubjects || 1)}%</span>
                        </div>
                        <ProgressBar value={mins} max={totalAllSubjects || 1} color={sub.color} height={8} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
