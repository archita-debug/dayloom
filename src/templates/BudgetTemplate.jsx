import { useState } from "react";
import { useSupaPersist } from "../lib/useSupaPersist";
import { todayISO, uid, fmt } from "../lib/utils";
import { Loader, ProgressBar, SectionHeader } from "../components/ui";

const ECATS = {
  food:          { label: "Food & Dining",   icon: "🍽️", color: "#F59E0B" },
  transport:     { label: "Transport",        icon: "🚌", color: "#3B82F6" },
  shopping:      { label: "Shopping",         icon: "🛍️", color: "#EC4899" },
  health:        { label: "Health",           icon: "💊", color: "#10B981" },
  entertainment: { label: "Entertainment",    icon: "🎮", color: "#8B5CF6" },
  bills:         { label: "Bills",            icon: "📄", color: "#EF4444" },
  other:         { label: "Other",            icon: "📦", color: "#6B7280" },
};

// Empty by default — users log their own transactions
const DEF_TXN = [];
const DEF_BUD = { food: 0, transport: 0, shopping: 0, health: 0, entertainment: 0, bills: 0, other: 0 };

export default function BudgetTemplate() {
  const [txns,    setTxns,    t1] = useSupaPersist("budget_txns_v1",   DEF_TXN);
  const [budgets, setBudgets, t2] = useSupaPersist("budget_limits_v1", DEF_BUD);

  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ type: "expense", desc: "", amount: "", cat: "food", date: todayISO() });
  const [tab,    setTab]    = useState("overview");

  const inc  = txns.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const exp  = txns.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const bal  = inc - exp;
  const catT = Object.keys(ECATS).reduce((acc, k) => {
    acc[k] = txns.filter(t => t.type === "expense" && t.cat === k).reduce((a, t) => a + t.amount, 0);
    return acc;
  }, {});

  const submit = () => {
    if (!form.desc.trim() || !form.amount) return;
    setTxns(p => [{ id: uid(), ...form, amount: parseFloat(form.amount) }, ...p]);
    setForm({ type: "expense", desc: "", amount: "", cat: "food", date: todayISO() });
    setAdding(false);
  };

  if (!t1 || !t2) return <Loader text="Loading budget…" />;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* Dark header */}
      <div style={{ background: "linear-gradient(135deg,#2C2018,#4A3728)", padding: "22px 24px 28px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#C5A899", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>Monthly Budget</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: "#FAF5EC", fontWeight: 700, marginBottom: 16 }}>Money Tracker</div>
          <div className="budget-summary">
            {[{ label: "Balance", value: bal, color: bal >= 0 ? "#86EFAC" : "#FCA5A5" }, { label: "Income", value: inc, color: "#86EFAC" }, { label: "Expenses", value: exp, color: "#FCA5A5" }].map(c => (
              <div key={c.label} style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(255,255,255,.09)" }}>
                <div style={{ fontSize: 11, color: "#C5A899", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: c.color, marginTop: 4 }}>₹{fmt(c.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        {/* Tab bar + add button */}
        <div className="budget-actions">
          <div className="tab-bar">
            {["overview", "transactions", "budgets"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`pill-btn${tab === t ? " active" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button className="pill-btn red" onClick={() => setAdding(p => !p)} style={{ fontSize: 12 }}>+ Add</button>
        </div>

        {/* Add transaction form */}
        {adding && (
          <div className="pin-card" style={{ padding: "14px", marginBottom: 16, animation: "popIn .2s ease" }}>
            <div className="form-grid-3" style={{ marginBottom: 10 }}>
              <select className="pin-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <select className="pin-input" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}>
                {Object.entries(ECATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <input type="date" className="pin-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-row-add">
              <input className="pin-input" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Description…" />
              <input type="number" className="pin-input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="₹ Amount" style={{ minWidth: 90 }} onKeyDown={e => e.key === "Enter" && submit()} />
              <button className="pill-btn red" onClick={submit} style={{ fontSize: 12 }}>Add</button>
            </div>
          </div>
        )}

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="masonry">
            {txns.length === 0 && (
              <div style={{ padding: "36px", textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic" }}>
                Add your first transaction above ✨
              </div>
            )}
            {Object.entries(ECATS).map(([k, v], i) => {
              const sp = catT[k] || 0, bu = budgets[k] || 0, ov = sp > bu && bu > 0;
              return (
                <div key={k} className="pin-card" style={{ padding: "14px", animationDelay: `${i * 0.05}s` }}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: v.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{v.icon}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{v.label}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ov ? "#EF4444" : "var(--ink)" }}>₹{fmt(sp)}</div>
                      <div style={{ fontSize: 10, color: "var(--warm-gray)" }}>of ₹{fmt(bu)}</div>
                    </div>
                  </div>
                  <ProgressBar value={sp} max={bu || sp || 1} color={ov ? "#EF4444" : v.color} height={5} />
                  {ov && <div style={{ fontSize: 10, color: "#EF4444", marginTop: 4 }}>Over by ₹{fmt(sp - bu)}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Transactions tab */}
        {tab === "transactions" && (
          <div className="pin-card" style={{ overflow: "hidden", padding: 0 }}>
            {txns.length === 0 && (
              <div style={{ padding: "36px", textAlign: "center", color: "var(--warm-gray)", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic" }}>No transactions yet</div>
            )}
            {txns.map((t, i) => {
              const c = ECATS[t.cat];
              return (
                <div key={t.id} className="flex items-center gap-3" style={{ padding: "11px 14px", borderBottom: i < txns.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: c?.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{c?.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="txn-desc">{t.desc}</div>
                    <div style={{ fontSize: 11, color: "var(--warm-gray)" }}>{t.date}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.type === "income" ? "#059669" : "#DC2626", flexShrink: 0 }}>
                    {t.type === "income" ? "+" : "−"}₹{fmt(t.amount)}
                  </div>
                  <button onClick={() => setTxns(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sand)", fontSize: 18, flexShrink: 0 }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Budgets tab */}
        {tab === "budgets" && (
          <div className="pin-card" style={{ padding: "18px" }}>
            <SectionHeader title="Set Monthly Limits" />
            <div className="budget-limits-grid">
              {Object.entries(ECATS).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{v.icon}</span>
                  <label style={{ fontSize: 12, color: "var(--ink)", flex: 1, fontWeight: 600 }}>{v.label}</label>
                  <input type="number" className="pin-input" value={budgets[k] || ""} onChange={e => setBudgets(p => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))} placeholder="₹0" style={{ width: 85 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
