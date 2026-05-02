import { useState } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid, pct } from "../lib/utils";
import { Loader, ProgressBar, SectionHeader, StatPill } from "../components/ui";

// Default habits are empty so users can personalize from scratch
const DEF_HABITS = [];
const PALETTE    = ["#F87171","#FB923C","#FBBF24","#34D399","#60A5FA","#A78BFA","#C084FC","#F472B6"];

export default function HabitsTemplate() {
  const [habits, setHabits, hLoaded] = useSupaPersist("habits_v1",      DEF_HABITS);
  const [logs,   setLogs,   lLoaded] = useSupaPersist("habits_logs_v1", {});

  const [adding,   setAdding]   = useState(false);
  const [newName,  setNewName]  = useState("");
  const [newIcon,  setNewIcon]  = useState("⭐");
  const [newColor, setNewColor] = useState("#F87171");

  const today = todayISO();
  const mo  = new Date().getMonth();
  const yr  = new Date().getFullYear();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const tdn = new Date().getDate();

  const isLogged = (hid, d)  => !!(logs[d] && logs[d][hid]);
  const toggle   = (hid)     => {
    setLogs(p => {
      const day = { ...(p[today] || {}) };
      day[hid] ? delete day[hid] : (day[hid] = true);
      return { ...p, [today]: day };
    });
  };
  const countDone = (hid) => {
    let c = 0;
    for (let d = 1; d <= dim; d++) {
      const dk = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (isLogged(hid, dk)) c++;
    }
    return c;
  };

  const tdDone = habits.filter(h => isLogged(h.id, today)).length;
  const streak = (() => {
    let s = 0; let d = new Date();
    while (true) {
      const dk = d.toISOString().slice(0, 10);
      if (habits.length > 0 && habits.every(h => isLogged(h.id, dk))) s++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  })();

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits(p => [...p, { id: uid(), name: newName.trim(), icon: newIcon, goal: 30, color: newColor }]);
    setNewName(""); setAdding(false);
  };

  if (!hLoaded || !lLoaded) return <Loader text="Loading habits…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg,#FDF0EB 0%,#F9E4DA 50%,#F2D5C8 100%)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(212,117,106,.1)" }} />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "var(--terracotta)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 5 }}>Daily Rituals</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}>Your Habit Board</div>
          <div style={{ fontSize: 12, color: "var(--warm-gray)", marginBottom: 16 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <div className="stat-pills">
            <StatPill label="Today"   value={`${tdDone}/${habits.length}`}                                                                                                               color="var(--terracotta)" />
            <StatPill label="Streak"  value={`${streak}🔥`}                                                                                                                              color="var(--rose)" />
            <StatPill label="Month %" value={`${pct(Object.values(logs).reduce((a, v) => a + Object.keys(v).length, 0), habits.length * tdn)}%`} color="var(--sage)" />
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        <SectionHeader
          title="Today's Habits"
          subtitle={habits.length === 0 ? "Add your first habit below" : `${tdDone} of ${habits.length} complete`}
          action={<button className="pill-btn red" onClick={() => setAdding(p => !p)}>+ Add</button>}
        />

        {/* Add form */}
        {adding && (
          <div className="pin-card" style={{ padding: "14px", marginBottom: 14, animation: "popIn .2s ease" }}>
            <div className="add-habit-row">
              <input className="pin-input habit-icon-input" value={newIcon}  onChange={e => setNewIcon(e.target.value)}  placeholder="🌟" />
              <input className="pin-input"                  value={newName}  onChange={e => setNewName(e.target.value)}  style={{ flex: 1, minWidth: 100 }} placeholder="New habit name…" onKeyDown={e => e.key === "Enter" && addHabit()} />
              <div className="flex gap-1 flex-wrap">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newColor === c ? "3px solid var(--ink)" : "2.5px solid transparent", cursor: "pointer", flexShrink: 0 }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button className="pill-btn red" onClick={addHabit}          style={{ fontSize: 12, padding: "6px 14px" }}>Add</button>
                <button className="pill-btn"     onClick={() => setAdding(false)} style={{ fontSize: 12, padding: "6px 12px" }}>×</button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {habits.length === 0 && !adding && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic" }}>
            No habits yet — add one to start your streak! ✨
          </div>
        )}

        {/* Habit cards */}
        <div className="masonry">
          {habits.map((h, i) => {
            const done = countDone(h.id);
            const chk  = isLogged(h.id, today);
            return (
              <div key={h.id} className="pin-card" style={{ padding: "14px 16px", borderLeft: `3px solid ${h.color}`, animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ fontSize: 22, width: 36, height: 36, borderRadius: 11, background: h.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{h.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 1 }}>{done}/{h.goal} this month</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => toggle(h.id)} style={{ width: 30, height: 30, borderRadius: 9, border: `2px solid ${h.color}`, background: chk ? h.color : "transparent", cursor: "pointer", color: chk ? "#fff" : h.color, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", touchAction: "manipulation" }}>{chk ? "✓" : ""}</button>
                    <button onClick={() => setHabits(p => p.filter(x => x.id !== h.id))} style={{ width: 26, height: 26, borderRadius: 7, background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                </div>
                <ProgressBar value={done} max={h.goal} color={h.color} height={5} />
              </div>
            );
          })}
        </div>

        {/* Month calendar */}
        {habits.length > 0 && (
          <div className="pin-card" style={{ padding: "16px", marginTop: 6 }}>
            <SectionHeader title="Month at a Glance" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--warm-gray)", paddingBottom: 3 }}>{d}</div>
              ))}
              {Array.from({ length: dim }, (_, i) => {
                const d  = i + 1;
                const dk = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const cnt    = habits.filter(h => isLogged(h.id, dk)).length;
                const full   = cnt === habits.length && habits.length > 0;
                const future = d > tdn;
                return (
                  <div key={d} style={{ aspectRatio: "1", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, background: full ? "var(--terracotta)" : cnt > 0 ? "var(--blush)" : future ? "transparent" : "var(--sand)", color: full ? "#fff" : "var(--ink)", opacity: future ? 0.35 : 1 }}>{d}</div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
