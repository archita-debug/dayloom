import { TEMPLATES } from "./HomePage";

export default function WithNav({ active, setActive, children }) {
  return (
    <div>
      <div className="bottom-nav">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            title={t.label}
            style={{ width: 40, height: 40, borderRadius: 999, border: "none", cursor: "pointer", background: active === t.id ? "var(--ink)" : "transparent", fontSize: 18, transition: "all .15s", touchAction: "manipulation" }}
          >
            {t.emoji}
          </button>
        ))}
        <div style={{ width: 1, background: "var(--border)", margin: "5px 3px" }} />
        <button
          onClick={() => setActive(null)}
          title="Home"
          style={{ width: 40, height: 40, borderRadius: 999, border: "none", cursor: "pointer", background: "transparent", fontSize: 17, color: "var(--warm-gray)", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}
        >
          ⌂
        </button>
      </div>
      {children}
    </div>
  );
}
