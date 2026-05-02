import { useState, useEffect } from "react";

// ── Global styles & fonts (injected into <head>) ──────────────────────────────
import "./lib/globalStyles";

// ── Supabase auth ─────────────────────────────────────────────────────────────
import {
  _userEmail,
  _token,
  supaRefreshToken,
  supaSignOut,
} from "./lib/supabase";

// ── Pages & layout ────────────────────────────────────────────────────────────
import LoginPage              from "./components/LoginPage";
import HomePage               from "./components/HomePage";
import WithNav                from "./components/WithNav";

// ── Template boards ───────────────────────────────────────────────────────────
import HabitsTemplate  from "./templates/HabitsTemplate";
import TaskTemplate    from "./templates/TaskTemplate";
import BudgetTemplate  from "./templates/BudgetTemplate";
import JournalTemplate from "./templates/JournalTemplate";
import FitnessTemplate from "./templates/FitnessTemplate";
import StudyTemplate   from "./templates/StudyTemplate";

// ── Loader (inline — needed before auth resolves) ─────────────────────────────
function Loader({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, fontFamily: "'Nunito',sans-serif", color: "#6B5E56" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #EAD9CC", borderTopColor: "#D4756A", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}

// ── Board map ─────────────────────────────────────────────────────────────────
const BOARDS = {
  habits:  <HabitsTemplate  />,
  tasks:   <TaskTemplate    />,
  budget:  <BudgetTemplate  />,
  journal: <JournalTemplate />,
  fitness: <FitnessTemplate />,
  study:   <StudyTemplate   />,
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [userEmail, setUserEmail] = useState(() => _userEmail);
  const [active,    setActive]    = useState(null);
  const [checking,  setChecking]  = useState(_token ? true : false);

  // Restore session on mount
  useEffect(() => {
    if (!_token) return;
    supaRefreshToken().then(ok => {
      if (!ok) {
        localStorage.removeItem("sb_token");
        setUserEmail(null);
      }
      setChecking(false);
    });
  }, []);

  const login  = (email) => { setUserEmail(email); setActive(null); };
  const logout = async () => { await supaSignOut(); setUserEmail(null); setActive(null); };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (checking)   return <Loader text="Restoring your session…" />;
  if (!userEmail) return <LoginPage onLogin={login} />;
  if (!active)    return <HomePage userEmail={userEmail} onLogout={logout} onSelect={setActive} />;

  return (
    <WithNav active={active} setActive={setActive}>
      {BOARDS[active] ?? null}
    </WithNav>
  );
}
