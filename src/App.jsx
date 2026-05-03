import { useState, useEffect } from "react";

// ── Global styles & fonts ─────────────────────────────────────────────────────
import "./lib/globalStyles";

// ── Supabase auth ─────────────────────────────────────────────────────────────
import {
  getToken,
  getUserEmail,
  supaRefreshToken,
  supaSignOut,
} from "./lib/supabase";

// ── Pages & layout ────────────────────────────────────────────────────────────
import LoginPage  from "./components/LoginPage";
import HomePage   from "./components/HomePage";
import WithNav    from "./components/WithNav";

// ── Template boards ───────────────────────────────────────────────────────────
import HabitsTemplate  from "./templates/HabitsTemplate";
import TaskTemplate    from "./templates/TaskTemplate";
import BudgetTemplate  from "./templates/BudgetTemplate";
import JournalTemplate from "./templates/JournalTemplate";
import FitnessTemplate from "./templates/FitnessTemplate";
import StudyTemplate   from "./templates/StudyTemplate";

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, fontFamily: "'Nunito',sans-serif", color: "#6B5E56" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #EAD9CC", borderTopColor: "#D4756A", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}

// ── Board renderer — rendered lazily inside the component so auth is ready ────
function ActiveBoard({ id }) {
  switch (id) {
    case "habits":  return <HabitsTemplate  />;
    case "tasks":   return <TaskTemplate    />;
    case "budget":  return <BudgetTemplate  />;
    case "journal": return <JournalTemplate />;
    case "fitness": return <FitnessTemplate />;
    case "study":   return <StudyTemplate   />;
    default:        return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // Read live values via getters — these are correct even after a refresh
  const [userEmail, setUserEmail] = useState(() => getUserEmail());
  const [active,    setActive]    = useState(null);

  // If a token exists in localStorage, verify it before rendering boards
  const [checking, setChecking] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    supaRefreshToken().then(ok => {
      if (ok) {
        // Token refreshed — update email in case it was stale
        setUserEmail(getUserEmail());
      } else {
        // Token invalid — log out cleanly
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_uid");
        localStorage.removeItem("sb_email");
        localStorage.removeItem("sb_refresh");
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

  // Boards only mount AFTER auth is confirmed → useSupaPersist gets a valid userId
  return (
    <WithNav active={active} setActive={setActive}>
      <ActiveBoard id={active} />
    </WithNav>
  );
}
