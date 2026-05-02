import { useState } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid, days7 } from "../lib/utils";
import { Loader, ProgressBar, SectionHeader } from "../components/ui";

const WT = {
  cardio:   { color: "#F87171", icon: "🏃", label: "Cardio"   },
  strength: { color: "#60A5FA", icon: "💪", label: "Strength" },
  yoga:     { color: "#A78BFA", icon: "🧘", label: "Yoga"     },
  sports:   { color: "#FBBF24", icon: "⚽", label: "Sports"   },
};

// Empty defaults — users log their own workouts
const DEF_WO = [];
const DEF_GL = { weeklyWorkouts: 5, dailyCalories: 500, weeklyDuration: 200 };

export default function FitnessTemplate() {
  const [workouts, setWorkouts, w1] = useSupaPersist("fitness_v1",      DEF_WO);
  const [goals,    setGoals,    w2] = useSupaPersist("fitness_goals_v1", DEF_GL);

  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ date: todayISO(), type: "cardio", name: "", duration: "", calories: "", notes: "" });
  const [tab,    setTab]    = useState("log");

  const week  = days7();
  const tw    = workouts.filter(w => week.includes(w.date));
  const tdW   = workouts.filter(w => w.date === todayISO());
  const wCals = tw.reduce((a, w) => a + (w.calories || 0), 0);
  const wMins = tw.reduce((a, w) => a + (w.duration || 0), 0);

  const submit = () => {
    if (!form.name.trim()) return;
    setWorkouts(p => [{ id: uid(), ...form, duration: +form.duration, calories: +form.calories }, ...p]);
    setForm({ date: todayISO(), type: "cardio", name: "", duration: "", calories: "", notes: "" });
    setAdding(false);
  };

  if (!w1 || !w2) return <Loader text="Loading fitness…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg,#F5F0FF,#EAE4F8)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#A78BFA", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Fitness</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>Your Workout Board</div>
          <div className="fitness-stats">
            {[
              { label: "This week",  value: `${tw.length}/${goals.weeklyWorkouts}`, color: "#A78BFA" },
              { label: "Calories",   value: wCals,                                  color: "#F87171" },
              { label: "Active mins",value: `${wMins}m`,                            color: "#60A5FA" },
              { label: "Today",      value: `${tdW.length} sessions`,               color: "#34D399" },
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
        {/* Tabs + add button */}
        <div className="budget-actions">
          <div className="tab-bar">
            {["log", "stats", "goals"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`pill-btn${tab === t ? " active" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button className="pill-btn red" onClick={() => setAdding(p => !p)} style={{ fontSize: 12 }}>+ Log workout</button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="pin-card" style={{ padding: "14px", marginBottom: 16, animation: "popIn .2s ease" }}>
            <div className="form-grid-4" style={{ marginBottom: 10 }}>
              <input className="pin-input" value={form.name}     onChange={e => setForm(p => ({ ...p, name: e.target.value }))}     placeholder="Workout name" />
              <select className="pin-input" value={form.type}    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {Object.entries(WT).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <input type="number" className="pin-input" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Mins" />
              <input type="number" className="pin-input" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))} placeholder="Calories" />
            </div>
            <div className="form-row-add">
              <input className="pin-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes…" onKeyDown={e => e.key === "Enter" && submit()} />
              <button className="pill-btn red" onClick={submit}          style={{ fontSize: 12 }}>Save</button>
              <button className="pill-btn"     onClick={() => setAdding(false)} style={{ fontSize: 12 }}>×</button>
            </div>
          </div>
        )}

        {/* Log tab */}
        {tab === "log" && (
          <div className="masonry">
            {workouts.length === 0 && (
              <div style={{ padding: "36px", textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic" }}>
                Log your first workout above 💪
              </div>
            )}
            {workouts.map((w, i) => {
              const wt = WT[w.type];
              return (
                <div key={w.id} className="pin-card" style={{ padding: "14px", borderLeft: `3px solid ${wt.color}`, animationDelay: `${i * 0.04}s` }}>
                  <div className="flex gap-3 items-start">
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: wt.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{wt.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 2 }}>{w.date}</div>
                      {w.notes && <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 3 }}>{w.notes}</div>}
                    </div>
                    <button onClick={() => setWorkouts(p => p.filter(x => x.id !== w.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 17, flexShrink: 0 }}>×</button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span style={{ fontSize: 11, fontWeight: 700, color: wt.color,   background: wt.color   + "12", borderRadius: 999, padding: "3px 9px" }}>{w.duration}m</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#F87171", background: "#FEF2F2",           borderRadius: 999, padding: "3px 9px" }}>{w.calories} kcal</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="fitness-stat-grid">
            <div className="pin-card" style={{ padding: "16px", gridColumn: "span 2" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "var(--ink)", marginBottom: 12 }}>Workouts This Week</div>
              <div className="week-bar">
                {week.map(d => {
                  const wks  = workouts.filter(w => w.date === d).length;
                  const maxW = Math.max(...week.map(d2 => workouts.filter(w => w.date === d2).length), 1);
                  const h    = Math.max((wks / maxW) * 70, wks > 0 ? 12 : 4);
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1">
                      <div style={{ width: "100%", height: h, background: wks ? "var(--rose)" : "var(--sand)", borderRadius: 5, transition: "height .4s" }} />
                      <div style={{ fontSize: 9, color: "var(--warm-gray)", fontWeight: 700 }}>{new Date(d + "T00:00").toLocaleDateString("en-US", { weekday: "short" })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {Object.entries(WT).map(([type, wt]) => {
              const cnt  = tw.filter(w => w.type === type).length;
              const cals = tw.filter(w => w.type === type).reduce((a, w) => a + (w.calories || 0), 0);
              return (
                <div key={type} className="pin-card" style={{ padding: "13px 15px", borderLeft: `3px solid ${wt.color}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 17 }}>{wt.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{wt.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: wt.color }}>
                    {cnt} <span style={{ fontSize: 11, color: "var(--warm-gray)", fontFamily: "'Nunito',sans-serif" }}>sessions</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 3 }}>{cals} kcal this week</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Goals tab */}
        {tab === "goals" && (
          <div className="pin-card" style={{ padding: "18px", maxWidth: 460 }}>
            <SectionHeader title="Weekly Goals" />
            {[
              { key: "weeklyWorkouts",  label: "Workouts per week",    unit: "sessions",  current: tw.length },
              { key: "weeklyDuration",  label: "Active minutes/week",  unit: "minutes",   current: wMins     },
              { key: "dailyCalories",   label: "Daily calorie burn",   unit: "kcal/day",  current: Math.round(wCals / 7) },
            ].map(g => (
              <div key={g.key} style={{ marginBottom: 18 }}>
                <div className="flex justify-between items-center mb-2">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{g.label}</label>
                  <input type="number" className="pin-input" value={goals[g.key]} onChange={e => setGoals(p => ({ ...p, [g.key]: +e.target.value }))} style={{ width: 76, textAlign: "center" }} />
                </div>
                <ProgressBar value={g.current} max={goals[g.key] || 1} color="var(--rose)" height={6} />
                <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 4 }}>{g.current} / {goals[g.key]} {g.unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
