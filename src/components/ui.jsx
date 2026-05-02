import { clamp, pct } from "../lib/utils";

// ─── Loader ───────────────────────────────────────────────────────────────────
export function Loader({ text = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 font-[Nunito] text-[var(--warm-gray)]">
      <div className="w-9 h-9 border-[3px] border-[var(--border)] border-t-[var(--rose)] rounded-full animate-spin" />
      <div className="text-sm">{text}</div>
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = "var(--rose)", height = 6 }) {
  const p = clamp(pct(value, max), 0, 100);
  return (
    <div style={{ background: "rgba(0,0,0,.06)", borderRadius: 999, height, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 999, transition: "width .5s ease" }} />
    </div>
  );
}

// ─── Ring (SVG donut) ─────────────────────────────────────────────────────────
export function Ring({ value, max, size = 80, stroke = 7, color = "var(--rose)", trackColor = "rgba(0,0,0,.06)" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = clamp(pct(value, max), 0, 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(p / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .6s ease" }}
      />
    </svg>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header-wrap">
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{title}</div>
        {subtitle && <div className="text-xs mt-1 font-[Nunito]" style={{ color: "var(--warm-gray)" }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────
export function StatPill({ label, value, color = "var(--rose)" }) {
  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 14, padding: "9px 13px", textAlign: "center", minWidth: 72 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--warm-gray)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>{label}</div>
    </div>
  );
}
