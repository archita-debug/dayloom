// ─── General Utilities ────────────────────────────────────────────────────────
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid      = () => Math.random().toString(36).slice(2, 9);
export const clamp    = (v, a, b) => Math.min(b, Math.max(a, v));
export const pct      = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const fmt      = (n) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const days7    = () => {
  const o = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    o.push(d.toISOString().slice(0, 10));
  }
  return o;
};
