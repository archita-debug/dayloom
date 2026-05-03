import { useState, useEffect } from "react";

import "./lib/globalStyles";

import {
  getToken,
  getUserEmail,
  supaRefreshToken,
  supaSignOut,
} from "./lib/supabase";

import LoginPage  from "./components/LoginPage";
import HomePage   from "./components/HomePage";
import WithNav    from "./components/WithNav";

import HabitsTemplate  from "./templates/HabitsTemplate";
import TaskTemplate    from "./templates/TaskTemplate";
import BudgetTemplate  from "./templates/BudgetTemplate";
import JournalTemplate from "./templates/JournalTemplate";
import FitnessTemplate from "./templates/FitnessTemplate";
import StudyTemplate   from "./templates/StudyTemplate";

function Loader({ text = "Loading…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, fontFamily: "'Nunito',sans-serif", color: "#6B5E56" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #EAD9CC", borderTopColor: "#D4756A", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}

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

export default function App() {
  const [userEmail, setUserEmail] = useState(() => getUserEmail());
  const [active,    setActive]    = useState(null);
  const [checking,  setChecking]  = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    supaRefreshToken().then(ok => {
      if (ok) {
        setUserEmail(getUserEmail());
      } else {
        // 400 / expired token — supaRefreshToken already called clearAllAuth()
        setUserEmail(null);
      }
      setChecking(false);
    });
  }, []);

  const login  = (email) => { setUserEmail(email); setActive(null); };
  const logout = async () => { await supaSignOut(); setUserEmail(null); setActive(null); };

  if (checking)   return <Loader text="Restoring your session…" />;
  if (!userEmail) return <LoginPage onLogin={login} />;
  if (!active)    return <HomePage userEmail={userEmail} onLogout={logout} onSelect={setActive} />;

  return (
    <WithNav active={active} setActive={setActive}>
      <ActiveBoard id={active} />
    </WithNav>
  );
}
