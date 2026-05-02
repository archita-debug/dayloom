import { useState, useEffect } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid } from "../lib/utils";
import { Loader } from "../components/ui";

const MOODS = ["😊", "😐", "😔", "😤", "🤩", "😴", "😰", "🥰"];

// Empty by default — users write their own entries
const DEF_ENTRIES = [];

export default function JournalTemplate() {
  const [entries, setEntries, loaded] = useSupaPersist("journal_v1", DEF_ENTRIES);

  const [selected,  setSelected]  = useState(null);
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({ date: todayISO(), mood: "😊", title: "", body: "", tags: [] });
  const [tagInput,  setTagInput]  = useState("");

  useEffect(() => {
    if (loaded && entries.length > 0 && !selected) setSelected(entries[0].id);
  }, [loaded]);

  const entry = entries.find(e => e.id === selected);

  const save = () => {
    if (!form.title.trim() && !form.body.trim()) return;
    const id = uid();
    setEntries(p => [{ id, ...form }, ...p]);
    setSelected(id);
    setEditing(false);
    setForm({ date: todayISO(), mood: "😊", title: "", body: "", tags: [] });
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim()))
      setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
    setTagInput("");
  };

  if (!loaded) return <Loader text="Loading journal…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif", paddingBottom: 90 }}>
      <div className="journal-layout">
        {/* Sidebar list */}
        <div className="journal-sidebar" style={{ background: "#F9F2E8", borderRight: "1px solid var(--border)", padding: "18px 0", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "0 14px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontStyle: "italic", fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>My Journal</div>
            <div style={{ fontSize: 12, color: "var(--warm-gray)", marginBottom: 10 }}>{entries.length} {entries.length === 1 ? "entry" : "entries"}</div>
            <button className="pill-btn red" onClick={() => { setEditing(true); setSelected(null); }} style={{ width: "100%", padding: "9px 18px", fontSize: 13 }}>+ New Entry</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "5px 0" }}>
            {entries.length === 0 && (
              <div style={{ padding: "20px 14px", fontSize: 12, color: "var(--warm-gray)", fontStyle: "italic" }}>No entries yet — start writing!</div>
            )}
            {entries.map(e => (
              <button key={e.id} onClick={() => { setSelected(e.id); setEditing(false); }} style={{ width: "100%", padding: "10px 14px", background: selected === e.id ? "var(--sand)" : "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Nunito',sans-serif", borderLeft: selected === e.id ? "3px solid var(--terracotta)" : "3px solid transparent", transition: "all .15s", touchAction: "manipulation" }}>
                <div className="flex items-center gap-1 mb-1">
                  <span style={{ fontSize: 13 }}>{e.mood}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{e.title || "Untitled"}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--warm-gray)" }}>{e.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="journal-main" style={{ padding: "28px 36px", overflowY: "auto" }}>
          {editing ? (
            <div style={{ maxWidth: 600, animation: "fadeUp .3s ease" }}>
              {/* Mood picker */}
              <div className="mood-picker">
                {MOODS.map(m => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, mood: m }))} style={{ width: 40, height: 40, borderRadius: 11, border: `2px solid ${form.mood === m ? "var(--terracotta)" : "var(--border)"}`, background: form.mood === m ? "var(--blush)" : "var(--card)", fontSize: 18, cursor: "pointer", transition: "all .15s", touchAction: "manipulation" }}>{m}</button>
                ))}
                <input type="date" className="pin-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ width: 150 }} />
              </div>

              <input
                className="pin-input"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Entry title…"
                style={{ fontSize: 17, fontFamily: "'Cormorant Garamond',serif", marginBottom: 12 }}
              />
              <textarea
                className="pin-input"
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                placeholder="Write freely…"
                rows={8}
                style={{ resize: "vertical", lineHeight: 1.7, fontSize: 14, marginBottom: 12 }}
              />

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-3 items-center">
                {form.tags.map(tg => (
                  <span key={tg} style={{ background: "var(--sand)", color: "var(--ink)", fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                    #{tg}
                    <button onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== tg) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                <input className="pin-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="+ add tag" style={{ width: 110 }} />
              </div>

              <div className="flex gap-2">
                <button className="pill-btn red" onClick={save}>Save entry</button>
                <button className="pill-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : entry ? (
            <div style={{ maxWidth: 600, animation: "fadeUp .3s ease" }}>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: 28 }}>{entry.mood}</span>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{entry.title || "Untitled"}</div>
                  <div style={{ fontSize: 12, color: "var(--warm-gray)" }}>{entry.date}</div>
                </div>
              </div>
              {entry.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {entry.tags.map(t => (
                    <span key={t} style={{ background: "var(--sand)", color: "var(--ink)", fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 12px" }}>#{t}</span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 14, color: "var(--warm-gray)", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 22 }}>{entry.body}</div>
              <button className="pill-btn" onClick={() => setEntries(p => p.filter(e => e.id !== entry.id))}>Delete</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontStyle: "italic", color: "var(--blush)" }}>Begin writing</div>
              <div style={{ fontSize: 14, color: "var(--warm-gray)", marginTop: 8 }}>Select an entry or create a new one</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
