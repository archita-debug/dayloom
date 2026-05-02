import { useState, useMemo } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid, pct } from "../lib/utils";
import { Loader, Ring, SectionHeader, StatPill } from "../components/ui";

const TASK_CATS = {
  work:     { label: "Work",     color: "#60A5FA" },
  personal: { label: "Personal", color: "#F87171" },
  urgent:   { label: "Urgent",   color: "#FB923C" },
  later:    { label: "Later",    color: "#A78BFA" },
};
const PRI = { high: "#EF4444", medium: "#F59E0B", low: "#34D399" };

// Empty by default — users add their own tasks
const DEF_TASKS = [];

export default function TaskTemplate() {
  const [tasks, setTasks, loaded] = useSupaPersist("tasks_v1", DEF_TASKS);

  const [adding,      setAdding]      = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState({ title: "", cat: "work", pri: "medium", due: "", note: "" });
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const filtered = useMemo(() => {
    let l = [...tasks];
    if (filter !== "all") l = l.filter(t => filter === "done" ? t.done : !t.done && t.cat === filter);
    if (search.trim()) l = l.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    l.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.pri === "high" ? -1 : 1) - (b.pri === "high" ? -1 : 1));
    return l;
  }, [tasks, filter, search]);

  const submit = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setTasks(p => p.map(t => t.id === editId ? { ...t, ...form } : t));
      setEditId(null);
    } else {
      setTasks(p => [...p, { id: uid(), done: false, ...form }]);
    }
    setForm({ title: "", cat: "work", pri: "medium", due: "", note: "" });
    setAdding(false);
  };

  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;

  const filterOptions = [
    { k: "all",  label: "All tasks",  cnt: total },
    { k: "done", label: "Completed",  cnt: done   },
    ...Object.entries(TASK_CATS).map(([k, v]) => ({ k, label: v.label, cnt: tasks.filter(t => t.cat === k).length })),
  ];

  if (!loaded) return <Loader text="Loading tasks…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg,#F0F7F0,#E4F0E4)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "var(--sage)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Task Board</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>What's on your plate?</div>
          <div className="stat-pills">
            <StatPill label="Total" value={total}        color="var(--ink)" />
            <StatPill label="Done"  value={done}         color="var(--sage)" />
            <StatPill label="Left"  value={total - done} color="var(--terracotta)" />
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-3 gap-2">
          <button className="pill-btn" onClick={() => setShowSidebar(p => !p)} style={{ fontSize: 12 }}>{showSidebar ? "Hide filters" : "Filter ↓"}</button>
          <button className="pill-btn red" onClick={() => { setAdding(true); setEditId(null); setForm({ title: "", cat: "work", pri: "medium", due: "", note: "" }); setShowSidebar(false); }} style={{ fontSize: 12 }}>+ New task</button>
        </div>

        <div className="tasks-layout">
          {/* Sidebar */}
          <div className={`tasks-sidebar${showSidebar ? " open" : ""}`}>
            <input className="pin-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search…" style={{ fontSize: 14, marginBottom: 12 }} />
            <div className="task-filter-list">
              {filterOptions.map(f => (
                <button key={f.k} onClick={() => { setFilter(f.k); setShowSidebar(false); }} style={{ padding: "8px 12px", borderRadius: 12, background: filter === f.k ? "var(--ink)" : "var(--card)", border: `1px solid ${filter === f.k ? "var(--ink)" : "var(--border)"}`, cursor: "pointer", color: filter === f.k ? "#fff" : "var(--warm-gray)", fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: filter === f.k ? 700 : 500, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .15s", flexShrink: 0, touchAction: "manipulation", whiteSpace: "nowrap" }}>
                  <span className="flex items-center gap-1">
                    {TASK_CATS[f.k] && <span style={{ width: 7, height: 7, borderRadius: "50%", background: TASK_CATS[f.k].color, flexShrink: 0 }} />}
                    {f.label}
                  </span>
                  <span style={{ fontSize: 11, background: filter === f.k ? "rgba(255,255,255,.2)" : "var(--sand)", color: filter === f.k ? "#fff" : "var(--warm-gray)", borderRadius: 999, padding: "1px 7px", marginLeft: 6 }}>{f.cnt}</span>
                </button>
              ))}
            </div>
            {/* Progress ring */}
            <div className="pin-card" style={{ marginTop: 14, padding: 14, textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Ring value={done} max={total || 1} size={60} stroke={6} color="var(--sage)" />
                <div style={{ position: "absolute", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 600, color: "var(--sage)" }}>{pct(done, total || 1)}%</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 5 }}>Progress</div>
            </div>
          </div>

          {/* Main list */}
          <div>
            {/* Add / Edit form */}
            {(adding || editId) && (
              <div className="pin-card" style={{ padding: "14px", marginBottom: 12, animation: "popIn .2s ease" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-gray)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>{editId ? "Edit task" : "New task"}</div>
                <input className="pin-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title…" style={{ marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && submit()} />
                <div className="form-grid-3" style={{ marginBottom: 10 }}>
                  <select className="pin-input" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}>
                    {Object.entries(TASK_CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select className="pin-input" value={form.pri} onChange={e => setForm(p => ({ ...p, pri: e.target.value }))}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input type="date" className="pin-input" value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))} />
                </div>
                <input className="pin-input" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Note…" style={{ marginBottom: 12 }} />
                <div className="flex gap-2">
                  <button className="pill-btn red" onClick={submit}                                      style={{ fontSize: 12 }}>Save</button>
                  <button className="pill-btn"     onClick={() => { setAdding(false); setEditId(null); }} style={{ fontSize: 12 }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic" }}>
                {tasks.length === 0 ? "Add your first task above ✨" : "Nothing here yet ✨"}
              </div>
            )}

            {/* Task rows */}
            <div className="flex flex-col gap-2">
              {filtered.map((t, i) => {
                const cat = TASK_CATS[t.cat];
                return (
                  <div key={t.id} className="pin-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 9, borderLeft: `3px solid ${cat.color}`, opacity: t.done ? 0.55 : 1, animationDelay: `${i * 0.04}s` }}>
                    <button onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${cat.color}`, background: t.done ? cat.color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, flexShrink: 0, transition: "all .15s", touchAction: "manipulation" }}>
                      {t.done && "✓"}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.done ? "var(--warm-gray)" : "var(--ink)", textDecoration: t.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                      {t.note && <div style={{ fontSize: 11, color: "var(--warm-gray)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</div>}
                    </div>
                    <div className="flex gap-1 items-center flex-shrink-0">
                      {t.due && <span style={{ fontSize: 10, color: "var(--warm-gray)", background: "var(--sand)", borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" }}>📅 {t.due}</span>}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: PRI[t.pri] + "18", color: PRI[t.pri] }}>{t.pri}</span>
                    </div>
                    <button onClick={() => { setEditId(t.id); setAdding(false); setForm({ title: t.title, cat: t.cat, pri: t.pri, due: t.due, note: t.note }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 14, padding: 3, flexShrink: 0 }}>✎</button>
                    <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 17, padding: 3, flexShrink: 0 }}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
