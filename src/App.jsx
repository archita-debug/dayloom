import { useState, useEffect, useMemo } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,500&family=Nunito:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap";
document.head.appendChild(FONT_LINK);

// ─── Global Styles ────────────────────────────────────────────────────────────
const STYLE = document.createElement("style");
STYLE.textContent = `
  * { box-sizing: border-box; }
  :root {
    --cream: #FDF8F3; --blush: #F2C4B8; --rose: #D4756A; --terracotta: #C05E4A;
    --sage: #8FAF8A; --sand: #E8DACB; --warm-gray: #6B5E56; --ink: #2C1F1A;
    --white: #FFFFFF; --card: #FFFAF7; --border: #EAD9CC; --pinterest-red: #E60023;
  }
  html { font-size: 16px; }
  body { margin: 0; background: var(--cream); -webkit-text-size-adjust: 100%; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn  { from { opacity:0; transform:scale(.93); } to { opacity:1; transform:scale(1); } }
  @keyframes drift1 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(15px,-20px) rotate(5deg);} 66%{transform:translate(-10px,10px) rotate(-3deg);} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(-18px,12px) rotate(-6deg);} 66%{transform:translate(8px,-15px) rotate(4deg);} }
  @keyframes drift3 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(12px,18px) rotate(-5deg);} }
  .blob1{animation:drift1 8s ease-in-out infinite;} .blob2{animation:drift2 10s ease-in-out infinite;} .blob3{animation:drift3 7s ease-in-out infinite;}

  .pin-card { background:var(--card); border-radius:20px; border:1px solid var(--border); transition:transform .22s ease,box-shadow .22s ease; animation:fadeUp .4s ease both; }
  .pin-card:hover { transform:translateY(-4px) scale(1.01); box-shadow:0 16px 40px rgba(44,31,26,.12); }

  .pill-btn { border-radius:999px; border:1.5px solid var(--border); background:var(--card); color:var(--warm-gray); font-family:'Nunito',sans-serif; font-size:13px; font-weight:600; cursor:pointer; padding:7px 18px; transition:all .15s; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
  .pill-btn:hover,.pill-btn.active { background:var(--ink); color:#fff; border-color:var(--ink); }
  .pill-btn.red { background:var(--pinterest-red); color:#fff; border-color:var(--pinterest-red); }
  .pill-btn.red:hover { background:#c0001e; border-color:#c0001e; }

  /* font-size:16px prevents iOS zoom on focus */
  .pin-input { background:#FFF8F4; border:1.5px solid var(--border); border-radius:14px; padding:10px 14px; font-family:'Nunito',sans-serif; font-size:16px; color:var(--ink); outline:none; width:100%; transition:border-color .15s,box-shadow .15s; -webkit-appearance:none; appearance:none; }
  .pin-input:focus { border-color:var(--rose); box-shadow:0 0 0 3px rgba(212,117,106,.12); }

  .masonry { columns:2; column-gap:14px; }
  .masonry > * { break-inside:avoid; margin-bottom:14px; }

  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--sand);border-radius:10px;}

  /* ── RESPONSIVE ── */
  @media (max-width: 600px) {
    .masonry { columns:1; }
    .pin-card { border-radius:14px; }
  }

  /* Login */
  .login-grid { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
  @media (max-width: 700px) {
    .login-grid { grid-template-columns:1fr; }
    .login-deco { display:none !important; }
    .login-form { padding:28px 20px !important; min-height:100vh; }
  }

  /* Home board */
  .home-board-grid { columns:2; column-gap:16px; }
  @media (max-width: 600px) { .home-board-grid { columns:1; } }
  .home-title { font-family:'Playfair Display',serif; font-size:46px; font-weight:700; color:var(--ink); line-height:1.1; margin-bottom:14px; }
  @media (max-width: 600px) { .home-title { font-size:28px; } }

  /* Section wrap */
  .section-wrap { max-width:860px; margin:0 auto; padding:24px 28px; }
  @media (max-width: 600px) { .section-wrap { padding:14px 12px; } }

  /* Page header */
  .page-header { padding:26px 28px; }
  @media (max-width: 600px) { .page-header { padding:18px 14px; } }

  /* Stat pills */
  .stat-pills { display:flex; gap:10px; flex-wrap:wrap; }
  @media (max-width: 480px) { .stat-pills { gap:6px; } }

  /* Tasks sidebar+main */
  .tasks-layout { display:grid; grid-template-columns:190px 1fr; gap:22px; }
  @media (max-width: 700px) {
    .tasks-layout { grid-template-columns:1fr; }
    .tasks-sidebar { display:none; }
    .tasks-sidebar.open { display:block; margin-bottom:14px; }
  }
  .task-filter-list { display:flex; flex-direction:column; gap:6px; }
  @media (max-width: 700px) {
    .task-filter-list { flex-direction:row; overflow-x:auto; padding-bottom:4px; gap:6px; -webkit-overflow-scrolling:touch; }
    .task-filter-list button { flex-shrink:0; }
  }

  /* Budget */
  .budget-summary { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  @media (max-width: 600px) { .budget-summary { grid-template-columns:1fr; gap:8px; } }
  .budget-limits-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width: 600px) { .budget-limits-grid { grid-template-columns:1fr; } }
  .budget-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px; }

  /* Journal */
  .journal-layout { display:grid; grid-template-columns:260px 1fr; min-height:100vh; }
  @media (max-width: 700px) {
    .journal-layout { grid-template-columns:1fr; min-height:auto; }
    .journal-sidebar { border-right:none !important; border-bottom:1px solid var(--border); max-height:240px; }
    .journal-main { padding:20px 14px !important; }
  }

  /* Fitness */
  .fitness-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  @media (max-width: 700px) { .fitness-stats { grid-template-columns:1fr 1fr; gap:8px; } }
  .fitness-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width: 600px) { .fitness-stat-grid { grid-template-columns:1fr; } }
  @media (max-width: 600px) { .fitness-stat-grid .span-2 { grid-column:span 1 !important; } }

  /* Form grids */
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  @media (max-width: 600px) { .form-grid-3 { grid-template-columns:1fr; } }
  .form-grid-4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; }
  @media (max-width: 600px) { .form-grid-4 { grid-template-columns:1fr 1fr; } }
  .form-row-add { display:grid; grid-template-columns:1fr auto auto; gap:10px; }
  @media (max-width: 480px) { .form-row-add { grid-template-columns:1fr 1fr; }
    .form-row-add > :first-child { grid-column:span 2; } }

  /* Add habit */
  .add-habit-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .habit-icon-input { width:52px !important; text-align:center; font-size:18px !important; flex-shrink:0; }

  /* Bottom nav */
  .bottom-nav { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); z-index:200; background:rgba(253,248,243,.94); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-radius:999px; padding:7px 10px; display:flex; gap:4px; border:1px solid var(--border); box-shadow:0 8px 32px rgba(44,31,26,.15); }
  @media (max-width: 480px) {
    .bottom-nav { padding:5px 7px; gap:2px; bottom:10px; }
    .bottom-nav button { width:34px !important; height:34px !important; font-size:15px !important; }
  }

  /* Page bottom padding to clear floating nav */
  .page-body { padding-bottom:90px; }

  /* Mood picker */
  .mood-picker { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; align-items:center; }
  @media (max-width:480px) { .mood-picker button { width:38px !important; height:38px !important; } }

  /* Week bar chart */
  .week-bar { display:flex; align-items:flex-end; gap:8px; height:80px; }
  @media (max-width:480px) { .week-bar { gap:4px; } }

  /* Transaction row */
  .txn-desc { font-size:14px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* SectionHeader on small screens */
  .section-header-wrap { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:8px; }

  /* Tab bar */
  .tab-bar { display:flex; gap:6px; background:var(--card); border-radius:14px; padding:5px; border:1px solid var(--border); }
`;
document.head.appendChild(STYLE);

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
function getUsers() { try { return JSON.parse(localStorage.getItem("__users__") || "{}"); } catch { return {}; } }
function saveUsers(u) { try { localStorage.setItem("__users__", JSON.stringify(u)); } catch {} }
function getCurrentSession() { try { return localStorage.getItem("__session__") || null; } catch { return null; } }
function setSession(u) { try { u ? localStorage.setItem("__session__", u) : localStorage.removeItem("__session__"); } catch {} }

function usePersist(username, key, init) {
  const nsKey = `u:${username}:${key}`;
  const [state, setState] = useState(() => {
    try { const v = localStorage.getItem(nsKey); return v ? JSON.parse(v) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(nsKey, JSON.stringify(state)); } catch {} }, [state, nsKey]);
  return [state, setState];
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const fmt = (n) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const days7 = () => { const o=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);o.push(d.toISOString().slice(0,10));} return o; };

// ─── Shared UI ────────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color="var(--rose)", height=6 }) {
  const p = clamp(pct(value, max), 0, 100);
  return <div style={{background:"rgba(0,0,0,.06)",borderRadius:999,height,overflow:"hidden",width:"100%"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:999,transition:"width .5s ease"}}/></div>;
}
function Ring({ value, max, size=80, stroke=7, color="var(--rose)", trackColor="rgba(0,0,0,.06)" }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, p=clamp(pct(value,max),0,100);
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${(p/100)*circ} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .6s ease"}}/></svg>;
}
function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header-wrap">
      <div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:600,color:"var(--ink)",lineHeight:1}}>{title}</div>
        {subtitle&&<div style={{fontSize:12,color:"var(--warm-gray)",marginTop:4,fontFamily:"'Nunito',sans-serif"}}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
function StatPill({ label, value, color="var(--rose)" }) {
  return <div style={{background:"var(--white)",border:"1px solid var(--border)",borderRadius:14,padding:"9px 13px",textAlign:"center",minWidth:72}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,color}}>{value}</div><div style={{fontSize:9,fontWeight:700,color:"var(--warm-gray)",textTransform:"uppercase",letterSpacing:".08em",marginTop:2}}>{label}</div></div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const u = username.trim().toLowerCase();
    if (!u || !password) { setError("Please fill in all fields."); return; }
    const users = getUsers();
    if (mode === "signup") {
      if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
      if (password !== confirm) { setError("Passwords don't match."); return; }
      if (users[u]) { setError("Username already taken. Try another."); return; }
      users[u] = { password, createdAt: new Date().toISOString() };
      saveUsers(users); setSession(u); onLogin(u);
    } else {
      if (!users[u]) { setError("No account found. Sign up first!"); return; }
      if (users[u].password !== password) { setError("Wrong password. Try again."); return; }
      setSession(u); onLogin(u);
    }
  };

  const BOARDS = [
    { emoji:"🌿", label:"Daily Habits", color:"#34D399", bg:"#F0FDF4" },
    { emoji:"✅", label:"Task Board",   color:"#60A5FA", bg:"#EFF6FF" },
    { emoji:"💰", label:"Budget",       color:"#FBBF24", bg:"#FFFBEB" },
    { emoji:"📔", label:"Journal",      color:"#F472B6", bg:"#FDF2F8" },
    { emoji:"💪", label:"Fitness",      color:"#A78BFA", bg:"#F5F3FF" },
  ];

  return (
    <div className="login-grid" style={{fontFamily:"'Nunito',sans-serif"}}>
      {/* Decorative left panel — hidden on mobile */}
      <div className="login-deco" style={{background:"linear-gradient(155deg,#FDF0EB 0%,#F9E4DA 40%,#F2D0C2 100%)",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",padding:48}}>
        <div className="blob1" style={{position:"absolute",top:"10%",left:"5%",width:180,height:180,borderRadius:"60% 40% 50% 60%",background:"rgba(212,117,106,.15)"}}/>
        <div className="blob2" style={{position:"absolute",bottom:"12%",right:"8%",width:140,height:140,borderRadius:"50% 60% 40% 50%",background:"rgba(143,175,138,.18)"}}/>
        <div className="blob3" style={{position:"absolute",top:"45%",right:"20%",width:90,height:90,borderRadius:"50%",background:"rgba(244,114,182,.13)"}}/>
        <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:320}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"var(--terracotta)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:10}}>Your Boards</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {BOARDS.map((b,i)=>(
              <div key={b.label} style={{background:b.bg,border:"1px solid rgba(0,0,0,.06)",borderRadius:20,padding:"18px 16px",animation:`fadeUp .5s ease ${i*.1}s both`,gridColumn:i===4?"span 2":"auto"}}>
                <div style={{fontSize:30,marginBottom:8}}>{b.emoji}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"var(--ink)"}}>{b.label}</div>
                <div style={{marginTop:8,height:4,borderRadius:999,background:"rgba(0,0,0,.06)",overflow:"hidden"}}><div style={{width:`${40+i*12}%`,height:"100%",background:b.color,borderRadius:999}}/></div>
              </div>
            ))}
          </div>
          <div style={{marginTop:28,fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",fontWeight:300,color:"var(--warm-gray)",lineHeight:1.4}}>
            "Weaving your day together,<br/>one habit at a time."
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="login-form" style={{background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center",padding:48}}>
        <div style={{width:"100%",maxWidth:380,animation:"fadeUp .5s ease .1s both"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"var(--pinterest-red)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700}}>D</div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Dayloom</span>
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700,color:"var(--ink)",lineHeight:1.1,marginBottom:6}}>
            {mode==="login"?"Welcome back":"Create account"}
          </div>
          <div style={{fontSize:14,color:"var(--warm-gray)",marginBottom:26}}>
            {mode==="login"?"Sign in to your personal boards.":"Start tracking your goals today."}
          </div>
          {error&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#DC2626",animation:"popIn .2s ease"}}>⚠️ {error}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:"var(--warm-gray)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Username</label>
              <input className="pin-input" value={username} onChange={e=>{setUsername(e.target.value);setError("");}} placeholder="e.g. sarah_creates" onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete="username"/>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:"var(--warm-gray)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Password</label>
              <input className="pin-input" type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete={mode==="login"?"current-password":"new-password"}/>
            </div>
            {mode==="signup"&&(
              <div style={{animation:"popIn .2s ease"}}>
                <label style={{fontSize:12,fontWeight:700,color:"var(--warm-gray)",textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:6}}>Confirm Password</label>
                <input className="pin-input" type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} autoComplete="new-password"/>
              </div>
            )}
            <button className="pill-btn red" onClick={submit} style={{padding:"13px 24px",fontSize:15,fontWeight:700,marginTop:4,width:"100%",borderRadius:14}}>
              {mode==="login"?"Sign in →":"Create my account →"}
            </button>
          </div>
          <div style={{marginTop:22,textAlign:"center",fontSize:13,color:"var(--warm-gray)"}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setPassword("");setConfirm("");}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--terracotta)",fontWeight:700,fontFamily:"'Nunito',sans-serif",fontSize:13,padding:0}}>
              {mode==="login"?"Sign up":"Sign in"}
            </button>
          </div>
          <div style={{marginTop:26,padding:"14px 16px",background:"var(--sand)",borderRadius:14,fontSize:12,color:"var(--warm-gray)",lineHeight:1.6}}>
            <strong style={{color:"var(--ink)"}}>💡 How it works:</strong> Each account has its own saved data. Create any username — no email needed. Your data is stored in your browser, separate per user.
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HABITS
// ══════════════════════════════════════════════════════════════════════════════
const DEF_HABITS = [
  {id:uid(),name:"Morning meditation",icon:"🧘",goal:30,color:"#C084FC"},
  {id:uid(),name:"Drink 8 glasses water",icon:"💧",goal:31,color:"#60A5FA"},
  {id:uid(),name:"Exercise 30 min",icon:"🏃",goal:25,color:"#F87171"},
  {id:uid(),name:"Read 20 pages",icon:"📚",goal:31,color:"#34D399"},
  {id:uid(),name:"No social media",icon:"📵",goal:20,color:"#FBBF24"},
  {id:uid(),name:"Sleep 8 hours",icon:"🌙",goal:31,color:"#A78BFA"},
];
const PALETTE = ["#F87171","#FB923C","#FBBF24","#34D399","#60A5FA","#A78BFA","#C084FC","#F472B6"];

function HabitsTemplate({ username }) {
  const [habits, setHabits] = usePersist(username,"habits_v1",DEF_HABITS);
  const [logs, setLogs] = usePersist(username,"habits_logs_v1",{});
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState(""); const [newIcon, setNewIcon] = useState("⭐"); const [newColor, setNewColor] = useState("#F87171");
  const today=todayISO(), mo=new Date().getMonth(), yr=new Date().getFullYear();
  const dim=new Date(yr,mo+1,0).getDate(), tdn=new Date().getDate();
  const isL=(hid,d)=>!!(logs[d]&&logs[d][hid]);
  const toggle=hid=>{setLogs(p=>{const day={...(p[today]||{})};day[hid]?delete day[hid]:(day[hid]=true);return{...p,[today]:day};});};
  const cntDone=hid=>{let c=0;for(let d=1;d<=dim;d++){const dk=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;if(isL(hid,dk))c++;}return c;};
  const tdDone=habits.filter(h=>isL(h.id,today)).length;
  const streak=(()=>{let s=0,d=new Date();while(true){const dk=d.toISOString().slice(0,10);if(habits.every(h=>isL(h.id,dk)))s++;else break;d.setDate(d.getDate()-1);}return s;})();
  const addHabit=()=>{if(!newName.trim())return;setHabits(p=>[...p,{id:uid(),name:newName.trim(),icon:newIcon,goal:30,color:newColor}]);setNewName("");setAdding(false);};

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <div className="page-header" style={{background:"linear-gradient(135deg,#FDF0EB 0%,#F9E4DA 50%,#F2D5C8 100%)",borderBottom:"1px solid var(--border)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(212,117,106,.1)"}}/>
        <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"var(--terracotta)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:5}}>Daily Rituals</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"var(--ink)",lineHeight:1.1,marginBottom:4}}>Your Habit Board</div>
          <div style={{fontSize:12,color:"var(--warm-gray)",marginBottom:16}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div className="stat-pills">
            <StatPill label="Today" value={`${tdDone}/${habits.length}`} color="var(--terracotta)"/>
            <StatPill label="Streak" value={`${streak}🔥`} color="var(--rose)"/>
            <StatPill label="Month %" value={`${pct(Object.values(logs).reduce((a,v)=>a+Object.keys(v).length,0),habits.length*tdn)}%`} color="var(--sage)"/>
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        <SectionHeader title="Today's Habits" subtitle={`${tdDone} of ${habits.length} complete`} action={<button className="pill-btn red" onClick={()=>setAdding(p=>!p)}>+ Add</button>}/>
        {adding&&(
          <div className="pin-card" style={{padding:"14px",marginBottom:14,animation:"popIn .2s ease"}}>
            <div className="add-habit-row">
              <input className="pin-input habit-icon-input" value={newIcon} onChange={e=>setNewIcon(e.target.value)} placeholder="🌟"/>
              <input className="pin-input" value={newName} onChange={e=>setNewName(e.target.value)} style={{flex:1,minWidth:100}} placeholder="New habit name…" onKeyDown={e=>e.key==="Enter"&&addHabit()}/>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{PALETTE.map(c=><button key={c} onClick={()=>setNewColor(c)} style={{width:20,height:20,borderRadius:"50%",background:c,border:newColor===c?"3px solid var(--ink)":"2.5px solid transparent",cursor:"pointer",flexShrink:0}}/>)}</div>
              <div style={{display:"flex",gap:6}}>
                <button className="pill-btn red" onClick={addHabit} style={{fontSize:12,padding:"6px 14px"}}>Add</button>
                <button className="pill-btn" onClick={()=>setAdding(false)} style={{fontSize:12,padding:"6px 12px"}}>×</button>
              </div>
            </div>
          </div>
        )}
        <div className="masonry">
          {habits.map((h,i)=>{
            const done=cntDone(h.id), chk=isL(h.id,today);
            return (
              <div key={h.id} className="pin-card" style={{padding:"14px 16px",borderLeft:`3px solid ${h.color}`,animationDelay:`${i*.05}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{fontSize:22,width:36,height:36,borderRadius:11,background:h.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{h.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</div>
                    <div style={{fontSize:11,color:"var(--warm-gray)",marginTop:1}}>{done}/{h.goal} this month</div>
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <button onClick={()=>toggle(h.id)} style={{width:30,height:30,borderRadius:9,border:`2px solid ${h.color}`,background:chk?h.color:"transparent",cursor:"pointer",color:chk?"#fff":h.color,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",touchAction:"manipulation"}}>{chk?"✓":""}</button>
                    <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={{width:26,height:26,borderRadius:7,background:"none",border:"none",cursor:"pointer",color:"var(--sand)",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                  </div>
                </div>
                <ProgressBar value={done} max={h.goal} color={h.color} height={5}/>
              </div>
            );
          })}
        </div>
        {habits.length>0&&(
          <div className="pin-card" style={{padding:"16px",marginTop:6}}>
            <SectionHeader title="Month at a Glance"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--warm-gray)",paddingBottom:3}}>{d}</div>)}
              {Array.from({length:dim},(_,i)=>{
                const d=i+1,dk=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                const cnt=habits.filter(h=>isL(h.id,dk)).length,full=cnt===habits.length&&habits.length>0,future=d>tdn;
                return <div key={d} style={{aspectRatio:"1",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,background:full?"var(--terracotta)":cnt>0?"var(--blush)":future?"transparent":"var(--sand)",color:full?"#fff":"var(--ink)",opacity:future?.35:1}}>{d}</div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TASKS
// ══════════════════════════════════════════════════════════════════════════════
const TASK_CATS={work:{label:"Work",color:"#60A5FA"},personal:{label:"Personal",color:"#F87171"},urgent:{label:"Urgent",color:"#FB923C"},later:{label:"Later",color:"#A78BFA"}};
const DEF_TASKS=[{id:uid(),title:"Prepare project proposal",cat:"work",done:false,pri:"high",due:"",note:""},{id:uid(),title:"Buy groceries",cat:"personal",done:false,pri:"medium",due:"",note:""},{id:uid(),title:"Fix the login bug",cat:"urgent",done:false,pri:"high",due:"",note:"Auth token expiry"},{id:uid(),title:"Read design system docs",cat:"later",done:false,pri:"low",due:"",note:""}];
const PRI={high:"#EF4444",medium:"#F59E0B",low:"#34D399"};

function TaskTemplate({ username }) {
  const [tasks,setTasks]=usePersist(username,"tasks_v1",DEF_TASKS);
  const [adding,setAdding]=useState(false);const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({title:"",cat:"work",pri:"medium",due:"",note:""});
  const [filter,setFilter]=useState("all");const [search,setSearch]=useState("");
  const [showSidebar,setShowSidebar]=useState(false);
  const filtered=useMemo(()=>{let l=[...tasks];if(filter!=="all")l=l.filter(t=>filter==="done"?t.done:!t.done&&t.cat===filter);if(search.trim())l=l.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()));l.sort((a,b)=>(a.done?1:0)-(b.done?1:0)||(a.pri==="high"?-1:1)-(b.pri==="high"?-1:1));return l;},[tasks,filter,search]);
  const submit=()=>{if(!form.title.trim())return;if(editId){setTasks(p=>p.map(t=>t.id===editId?{...t,...form}:t));setEditId(null);}else setTasks(p=>[...p,{id:uid(),done:false,...form}]);setForm({title:"",cat:"work",pri:"medium",due:"",note:""});setAdding(false);};
  const total=tasks.length,done=tasks.filter(t=>t.done).length;
  const filterOptions=[{k:"all",label:"All tasks",cnt:total},{k:"done",label:"Completed",cnt:done},...Object.entries(TASK_CATS).map(([k,v])=>({k,label:v.label,cnt:tasks.filter(t=>t.cat===k).length}))];

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <div className="page-header" style={{background:"linear-gradient(135deg,#F0F7F0,#E4F0E4)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"var(--sage)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Task Board</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"var(--ink)",marginBottom:14}}>What's on your plate?</div>
          <div className="stat-pills"><StatPill label="Total" value={total} color="var(--ink)"/><StatPill label="Done" value={done} color="var(--sage)"/><StatPill label="Left" value={total-done} color="var(--terracotta)"/></div>
        </div>
      </div>

      <div className="section-wrap page-body">
        {/* Mobile: filter toggle + new task row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8}}>
          <button className="pill-btn" onClick={()=>setShowSidebar(p=>!p)} style={{fontSize:12}}>
            {showSidebar?"Hide filters":"Filter ↓"}
          </button>
          <button className="pill-btn red" onClick={()=>{setAdding(true);setEditId(null);setForm({title:"",cat:"work",pri:"medium",due:"",note:""});setShowSidebar(false);}} style={{fontSize:12}}>+ New task</button>
        </div>

        <div className="tasks-layout">
          <div className={`tasks-sidebar${showSidebar?" open":""}`}>
            <input className="pin-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search…" style={{fontSize:14,marginBottom:12}}/>
            <div className="task-filter-list">
              {filterOptions.map(f=>(
                <button key={f.k} onClick={()=>{setFilter(f.k);setShowSidebar(false);}} style={{padding:"8px 12px",borderRadius:12,background:filter===f.k?"var(--ink)":"var(--card)",border:`1px solid ${filter===f.k?"var(--ink)":"var(--border)"}`,cursor:"pointer",color:filter===f.k?"#fff":"var(--warm-gray)",fontSize:13,fontFamily:"'Nunito',sans-serif",fontWeight:filter===f.k?700:500,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s",flexShrink:0,touchAction:"manipulation",whiteSpace:"nowrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:6}}>{TASK_CATS[f.k]&&<span style={{width:7,height:7,borderRadius:"50%",background:TASK_CATS[f.k].color,flexShrink:0}}/>}{f.label}</span>
                  <span style={{fontSize:11,background:filter===f.k?"rgba(255,255,255,.2)":"var(--sand)",color:filter===f.k?"#fff":"var(--warm-gray)",borderRadius:999,padding:"1px 7px",marginLeft:6}}>{f.cnt}</span>
                </button>
              ))}
            </div>
            <div className="pin-card" style={{marginTop:14,padding:14,textAlign:"center"}}>
              <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ring value={done} max={total||1} size={60} stroke={6} color="var(--sage)"/><div style={{position:"absolute",fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:600,color:"var(--sage)"}}>{pct(done,total||1)}%</div></div>
              <div style={{fontSize:11,color:"var(--warm-gray)",marginTop:5}}>Progress</div>
            </div>
          </div>

          <div>
            {(adding||editId)&&(
              <div className="pin-card" style={{padding:"14px",marginBottom:12,animation:"popIn .2s ease"}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--warm-gray)",marginBottom:10,textTransform:"uppercase",letterSpacing:".08em"}}>{editId?"Edit task":"New task"}</div>
                <input className="pin-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Task title…" style={{marginBottom:10}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
                <div className="form-grid-3" style={{marginBottom:10}}>
                  <select className="pin-input" value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))}>{Object.entries(TASK_CATS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
                  <select className="pin-input" value={form.pri} onChange={e=>setForm(p=>({...p,pri:e.target.value}))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
                  <input type="date" className="pin-input" value={form.due} onChange={e=>setForm(p=>({...p,due:e.target.value}))}/>
                </div>
                <input className="pin-input" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Note…" style={{marginBottom:12}}/>
                <div style={{display:"flex",gap:8}}><button className="pill-btn red" onClick={submit} style={{fontSize:12}}>Save</button><button className="pill-btn" onClick={()=>{setAdding(false);setEditId(null);}} style={{fontSize:12}}>Cancel</button></div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:"var(--warm-gray)",fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontStyle:"italic"}}>Nothing here yet ✨</div>}
              {filtered.map((t,i)=>{
                const cat=TASK_CATS[t.cat];
                return (
                  <div key={t.id} className="pin-card" style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:9,borderLeft:`3px solid ${cat.color}`,opacity:t.done?.55:1,animationDelay:`${i*.04}s`}}>
                    <button onClick={()=>setTasks(p=>p.map(x=>x.id===t.id?{...x,done:!x.done}:x))} style={{width:22,height:22,borderRadius:6,border:`2px solid ${cat.color}`,background:t.done?cat.color:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,flexShrink:0,transition:"all .15s",touchAction:"manipulation"}}>{t.done&&"✓"}</button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:t.done?"var(--warm-gray)":"var(--ink)",textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                      {t.note&&<div style={{fontSize:11,color:"var(--warm-gray)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.note}</div>}
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                      {t.due&&<span style={{fontSize:10,color:"var(--warm-gray)",background:"var(--sand)",borderRadius:999,padding:"2px 7px",whiteSpace:"nowrap"}}>📅 {t.due}</span>}
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,background:PRI[t.pri]+"18",color:PRI[t.pri]}}>{t.pri}</span>
                    </div>
                    <button onClick={()=>{setEditId(t.id);setAdding(false);setForm({title:t.title,cat:t.cat,pri:t.pri,due:t.due,note:t.note});}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand)",fontSize:14,padding:3,flexShrink:0}}>✎</button>
                    <button onClick={()=>setTasks(p=>p.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand)",fontSize:17,padding:3,flexShrink:0}}>×</button>
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

// ══════════════════════════════════════════════════════════════════════════════
// BUDGET
// ══════════════════════════════════════════════════════════════════════════════
const ECATS={food:{label:"Food & Dining",icon:"🍽️",color:"#F59E0B"},transport:{label:"Transport",icon:"🚌",color:"#3B82F6"},shopping:{label:"Shopping",icon:"🛍️",color:"#EC4899"},health:{label:"Health",icon:"💊",color:"#10B981"},entertainment:{label:"Entertainment",icon:"🎮",color:"#8B5CF6"},bills:{label:"Bills",icon:"📄",color:"#EF4444"},other:{label:"Other",icon:"📦",color:"#6B7280"}};
const DEF_TXN=[{id:uid(),type:"income",desc:"Salary",amount:50000,cat:"other",date:todayISO()},{id:uid(),type:"expense",desc:"Groceries",amount:2400,cat:"food",date:todayISO()},{id:uid(),type:"expense",desc:"Netflix",amount:649,cat:"entertainment",date:todayISO()},{id:uid(),type:"expense",desc:"Metro card",amount:500,cat:"transport",date:todayISO()}];
const DEF_BUD={food:8000,transport:3000,shopping:5000,health:2000,entertainment:2000,bills:5000,other:3000};

function BudgetTemplate({ username }) {
  const [txns,setTxns]=usePersist(username,"budget_txns_v1",DEF_TXN);
  const [budgets,setBudgets]=usePersist(username,"budget_limits_v1",DEF_BUD);
  const [adding,setAdding]=useState(false);const [form,setForm]=useState({type:"expense",desc:"",amount:"",cat:"food",date:todayISO()});const [tab,setTab]=useState("overview");
  const inc=txns.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
  const exp=txns.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
  const bal=inc-exp;
  const catT=Object.keys(ECATS).reduce((acc,k)=>{acc[k]=txns.filter(t=>t.type==="expense"&&t.cat===k).reduce((a,t)=>a+t.amount,0);return acc;},{});
  const submit=()=>{if(!form.desc.trim()||!form.amount)return;setTxns(p=>[{id:uid(),...form,amount:parseFloat(form.amount)},...p]);setForm({type:"expense",desc:"",amount:"",cat:"food",date:todayISO()});setAdding(false);};

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#2C2018,#4A3728)",padding:"22px 24px 28px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"#C5A899",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Monthly Budget</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:"#FAF5EC",fontWeight:700,marginBottom:16}}>Money Tracker</div>
          <div className="budget-summary">
            {[{label:"Balance",value:bal,color:bal>=0?"#86EFAC":"#FCA5A5"},{label:"Income",value:inc,color:"#86EFAC"},{label:"Expenses",value:exp,color:"#FCA5A5"}].map(c=>(
              <div key={c.label} style={{background:"rgba(255,255,255,.06)",borderRadius:14,padding:"12px 14px",border:"1px solid rgba(255,255,255,.09)"}}>
                <div style={{fontSize:11,color:"#C5A899",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>{c.label}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:c.color,marginTop:4}}>₹{fmt(c.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        <div className="budget-actions">
          <div className="tab-bar">
            {["overview","transactions","budgets"].map(t=><button key={t} onClick={()=>setTab(t)} className={`pill-btn${tab===t?" active":""}`} style={{padding:"6px 12px",fontSize:12}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
          <button className="pill-btn red" onClick={()=>setAdding(p=>!p)} style={{fontSize:12}}>+ Add</button>
        </div>

        {adding&&(
          <div className="pin-card" style={{padding:"14px",marginBottom:16,animation:"popIn .2s ease"}}>
            <div className="form-grid-3" style={{marginBottom:10}}>
              <select className="pin-input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="expense">Expense</option><option value="income">Income</option></select>
              <select className="pin-input" value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))}>{Object.entries(ECATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select>
              <input type="date" className="pin-input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/>
            </div>
            <div className="form-row-add">
              <input className="pin-input" value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="Description…"/>
              <input type="number" className="pin-input" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="₹ Amount" style={{minWidth:90}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button className="pill-btn red" onClick={submit} style={{fontSize:12}}>Add</button>
            </div>
          </div>
        )}

        {tab==="overview"&&<div className="masonry">{Object.entries(ECATS).map(([k,v],i)=>{const sp=catT[k]||0,bu=budgets[k]||0,ov=sp>bu&&bu>0;return(<div key={k} className="pin-card" style={{padding:"14px",animationDelay:`${i*.05}s`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:10,background:v.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{v.icon}</div><span style={{fontSize:12,fontWeight:700,color:"var(--ink)"}}>{v.label}</span></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:ov?"#EF4444":"var(--ink)"}}>₹{fmt(sp)}</div><div style={{fontSize:10,color:"var(--warm-gray)"}}>of ₹{fmt(bu)}</div></div></div><ProgressBar value={sp} max={bu||sp||1} color={ov?"#EF4444":v.color} height={5}/>{ov&&<div style={{fontSize:10,color:"#EF4444",marginTop:4}}>Over by ₹{fmt(sp-bu)}</div>}</div>);})}</div>}

        {tab==="transactions"&&<div className="pin-card" style={{overflow:"hidden",padding:0}}>{txns.length===0&&<div style={{padding:"36px",textAlign:"center",color:"var(--warm-gray)",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic"}}>No transactions yet</div>}{txns.map((t,i)=>{const c=ECATS[t.cat];return(<div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<txns.length-1?"1px solid var(--border)":"none"}}><div style={{width:34,height:34,borderRadius:10,background:c?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c?.icon}</div><div style={{flex:1,minWidth:0}}><div className="txn-desc">{t.desc}</div><div style={{fontSize:11,color:"var(--warm-gray)"}}>{t.date}</div></div><div style={{fontSize:13,fontWeight:700,color:t.type==="income"?"#059669":"#DC2626",flexShrink:0}}>{t.type==="income"?"+":"−"}₹{fmt(t.amount)}</div><button onClick={()=>setTxns(p=>p.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand)",fontSize:18,flexShrink:0,touchAction:"manipulation"}}>×</button></div>);})}</div>}

        {tab==="budgets"&&<div className="pin-card" style={{padding:"18px"}}><SectionHeader title="Set Monthly Limits"/><div className="budget-limits-grid">{Object.entries(ECATS).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:17,flexShrink:0}}>{v.icon}</span><label style={{fontSize:12,color:"var(--ink)",flex:1,fontWeight:600}}>{v.label}</label><input type="number" className="pin-input" value={budgets[k]||""} onChange={e=>setBudgets(p=>({...p,[k]:parseFloat(e.target.value)||0}))} placeholder="₹0" style={{width:85}}/></div>)}</div></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// JOURNAL
// ══════════════════════════════════════════════════════════════════════════════
const MOODS=["😊","😐","😔","😤","🤩","😴","😰","🥰"];
const DEF_ENT=[{id:uid(),date:todayISO(),mood:"🤩",title:"A great start",body:"Today felt really productive. Completed all my morning tasks and had a wonderful breakfast.",tags:["productive","morning"]}];

function JournalTemplate({ username }) {
  const [entries,setEntries]=usePersist(username,"journal_v1",DEF_ENT);
  const [selected,setSelected]=useState(entries[0]?.id||null);
  const [editing,setEditing]=useState(false);const [form,setForm]=useState({date:todayISO(),mood:"😊",title:"",body:"",tags:[]});const [tagInput,setTagInput]=useState("");
  const entry=entries.find(e=>e.id===selected);
  const save=()=>{if(!form.title.trim()&&!form.body.trim())return;const id=uid();setEntries(p=>[{id,...form},...p]);setSelected(id);setEditing(false);setForm({date:todayISO(),mood:"😊",title:"",body:"",tags:[]});};
  const addTag=()=>{if(tagInput.trim()&&!form.tags.includes(tagInput.trim()))setForm(p=>({...p,tags:[...p.tags,tagInput.trim()]}));setTagInput("");};

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif",paddingBottom:90}}>
      <div className="journal-layout">
        {/* Sidebar */}
        <div className="journal-sidebar" style={{background:"#F9F2E8",borderRight:"1px solid var(--border)",padding:"18px 0",display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{padding:"0 14px 14px",borderBottom:"1px solid var(--border)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontStyle:"italic",fontWeight:700,color:"var(--ink)",marginBottom:2}}>My Journal</div>
            <div style={{fontSize:12,color:"var(--warm-gray)",marginBottom:10}}>{entries.length} entries</div>
            <button className="pill-btn red" onClick={()=>{setEditing(true);setSelected(null);}} style={{width:"100%",padding:"9px 18px",fontSize:13}}>+ New Entry</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"5px 0"}}>
            {entries.map(e=>(
              <button key={e.id} onClick={()=>{setSelected(e.id);setEditing(false);}} style={{width:"100%",padding:"10px 14px",background:selected===e.id?"var(--sand)":"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'Nunito',sans-serif",borderLeft:selected===e.id?"3px solid var(--terracotta)":"3px solid transparent",transition:"all .15s",touchAction:"manipulation"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:13}}>{e.mood}</span><span style={{fontSize:12,fontWeight:700,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{e.title||"Untitled"}</span></div>
                <div style={{fontSize:11,color:"var(--warm-gray)"}}>{e.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="journal-main" style={{padding:"28px 36px",overflowY:"auto"}}>
          {editing?(
            <div style={{maxWidth:600,animation:"fadeUp .3s ease"}}>
              <div className="mood-picker">
                {MOODS.map(m=><button key={m} onClick={()=>setForm(p=>({...p,mood:m}))} style={{width:40,height:40,borderRadius:11,border:`2px solid ${form.mood===m?"var(--terracotta)":"var(--border)"}`,background:form.mood===m?"var(--blush)":"var(--card)",fontSize:18,cursor:"pointer",transition:"all .15s",touchAction:"manipulation"}}>{m}</button>)}
                <input type="date" className="pin-input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{width:150}}/>
              </div>
              <input className="pin-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Entry title…" style={{fontSize:17,fontFamily:"'Cormorant Garamond',serif",marginBottom:12}}/>
              <textarea className="pin-input" value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} placeholder="Write freely…" rows={8} style={{resize:"vertical",lineHeight:1.7,fontSize:14,marginBottom:12}}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
                {form.tags.map(tg=><span key={tg} style={{background:"var(--sand)",color:"var(--ink)",fontSize:12,fontWeight:600,borderRadius:999,padding:"4px 12px",display:"flex",alignItems:"center",gap:5}}>#{tg}<button onClick={()=>setForm(p=>({...p,tags:p.tags.filter(x=>x!==tg)}))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--warm-gray)",fontSize:14,padding:0,lineHeight:1}}>×</button></span>)}
                <input className="pin-input" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="+ add tag" style={{width:110}}/>
              </div>
              <div style={{display:"flex",gap:8}}><button className="pill-btn red" onClick={save}>Save entry</button><button className="pill-btn" onClick={()=>setEditing(false)}>Cancel</button></div>
            </div>
          ):entry?(
            <div style={{maxWidth:600,animation:"fadeUp .3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:28}}>{entry.mood}</span><div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>{entry.title||"Untitled"}</div><div style={{fontSize:12,color:"var(--warm-gray)"}}>{entry.date}</div></div></div>
              {entry.tags?.length>0&&<div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>{entry.tags.map(t=><span key={t} style={{background:"var(--sand)",color:"var(--ink)",fontSize:12,fontWeight:600,borderRadius:999,padding:"4px 12px"}}>#{t}</span>)}</div>}
              <div style={{fontSize:14,color:"var(--warm-gray)",lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:22}}>{entry.body}</div>
              <button className="pill-btn" onClick={()=>setEntries(p=>p.filter(e=>e.id!==entry.id))}>Delete</button>
            </div>
          ):(
            <div style={{textAlign:"center",paddingTop:60}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontStyle:"italic",color:"var(--blush)"}}>Begin writing</div><div style={{fontSize:14,color:"var(--warm-gray)",marginTop:8}}>Select an entry or create a new one</div></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FITNESS
// ══════════════════════════════════════════════════════════════════════════════
const WT={cardio:{color:"#F87171",icon:"🏃",label:"Cardio"},strength:{color:"#60A5FA",icon:"💪",label:"Strength"},yoga:{color:"#A78BFA",icon:"🧘",label:"Yoga"},sports:{color:"#FBBF24",icon:"⚽",label:"Sports"}};
const DEF_WO=[{id:uid(),date:todayISO(),type:"strength",name:"Push Day",duration:45,calories:320,notes:"Bench: 3x10 @ 80kg"},{id:uid(),date:todayISO(),type:"cardio",name:"Morning Run",duration:30,calories:280,notes:"5.2km"}];
const DEF_GL={weeklyWorkouts:5,dailyCalories:500,weeklyDuration:200};

function FitnessTemplate({ username }) {
  const [workouts,setWorkouts]=usePersist(username,"fitness_v1",DEF_WO);
  const [goals,setGoals]=usePersist(username,"fitness_goals_v1",DEF_GL);
  const [adding,setAdding]=useState(false);const [form,setForm]=useState({date:todayISO(),type:"cardio",name:"",duration:"",calories:"",notes:""});const [tab,setTab]=useState("log");
  const week=days7();const tw=workouts.filter(w=>week.includes(w.date));const tdW=workouts.filter(w=>w.date===todayISO());
  const wCals=tw.reduce((a,w)=>a+(w.calories||0),0);const wMins=tw.reduce((a,w)=>a+(w.duration||0),0);
  const submit=()=>{if(!form.name.trim())return;setWorkouts(p=>[{id:uid(),...form,duration:+form.duration,calories:+form.calories},...p]);setForm({date:todayISO(),type:"cardio",name:"",duration:"",calories:"",notes:""});setAdding(false);};

  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <div className="page-header" style={{background:"linear-gradient(135deg,#F5F0FF,#EAE4F8)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"#A78BFA",letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>Fitness</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"var(--ink)",marginBottom:14}}>Your Workout Board</div>
          <div className="fitness-stats">
            {[{label:"This week",value:`${tw.length}/${goals.weeklyWorkouts}`,color:"#A78BFA"},{label:"Calories",value:wCals,color:"#F87171"},{label:"Active mins",value:`${wMins}m`,color:"#60A5FA"},{label:"Today",value:`${tdW.length} sessions`,color:"#34D399"}].map(s=>(
              <div key={s.label} className="pin-card" style={{padding:"12px 14px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,color:s.color}}>{s.value}</div><div style={{fontSize:10,fontWeight:700,color:"var(--warm-gray)",textTransform:"uppercase",letterSpacing:".08em",marginTop:2}}>{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrap page-body">
        <div className="budget-actions">
          <div className="tab-bar">
            {["log","stats","goals"].map(t=><button key={t} onClick={()=>setTab(t)} className={`pill-btn${tab===t?" active":""}`} style={{padding:"6px 12px",fontSize:12}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
          <button className="pill-btn red" onClick={()=>setAdding(p=>!p)} style={{fontSize:12}}>+ Log workout</button>
        </div>

        {adding&&(
          <div className="pin-card" style={{padding:"14px",marginBottom:16,animation:"popIn .2s ease"}}>
            <div className="form-grid-4" style={{marginBottom:10}}>
              <input className="pin-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Workout name"/>
              <select className="pin-input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{Object.entries(WT).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}</select>
              <input type="number" className="pin-input" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="Mins"/>
              <input type="number" className="pin-input" value={form.calories} onChange={e=>setForm(p=>({...p,calories:e.target.value}))} placeholder="Calories"/>
            </div>
            <div className="form-row-add">
              <input className="pin-input" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Notes…" onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button className="pill-btn red" onClick={submit} style={{fontSize:12}}>Save</button>
              <button className="pill-btn" onClick={()=>setAdding(false)} style={{fontSize:12}}>×</button>
            </div>
          </div>
        )}

        {tab==="log"&&(
          <div className="masonry">
            {workouts.length===0&&<div style={{padding:"36px",textAlign:"center",color:"var(--warm-gray)",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic"}}>No workouts logged yet</div>}
            {workouts.map((w,i)=>{const wt=WT[w.type];return(
              <div key={w.id} className="pin-card" style={{padding:"14px",borderLeft:`3px solid ${wt.color}`,animationDelay:`${i*.04}s`}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:36,height:36,borderRadius:11,background:wt.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{wt.icon}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{w.name}</div><div style={{fontSize:11,color:"var(--warm-gray)",marginTop:2}}>{w.date}</div>{w.notes&&<div style={{fontSize:11,color:"var(--warm-gray)",marginTop:3}}>{w.notes}</div>}</div><button onClick={()=>setWorkouts(p=>p.filter(x=>x.id!==w.id))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--sand)",fontSize:17,flexShrink:0,touchAction:"manipulation"}}>×</button></div>
                <div style={{display:"flex",gap:7,marginTop:10}}><span style={{fontSize:11,fontWeight:700,color:wt.color,background:wt.color+"12",borderRadius:999,padding:"3px 9px"}}>{w.duration}m</span><span style={{fontSize:11,fontWeight:700,color:"#F87171",background:"#FEF2F2",borderRadius:999,padding:"3px 9px"}}>{w.calories} kcal</span></div>
              </div>
            );})}
          </div>
        )}

        {tab==="stats"&&(
          <div className="fitness-stat-grid">
            <div className="pin-card span-2" style={{padding:"16px",gridColumn:"span 2"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"var(--ink)",marginBottom:12}}>Workouts This Week</div>
              <div className="week-bar">
                {week.map(d=>{const wks=workouts.filter(w=>w.date===d).length;const maxW=Math.max(...week.map(d2=>workouts.filter(w=>w.date===d2).length),1);const h=Math.max((wks/maxW)*70,wks>0?12:4);return(<div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:"100%",height:h,background:wks?"var(--rose)":"var(--sand)",borderRadius:5,transition:"height .4s"}}/><div style={{fontSize:9,color:"var(--warm-gray)",fontWeight:700}}>{new Date(d+"T00:00").toLocaleDateString("en-US",{weekday:"short"})}</div></div>);})}
              </div>
            </div>
            {Object.entries(WT).map(([type,wt])=>{const cnt=tw.filter(w=>w.type===type).length;const cals=tw.filter(w=>w.type===type).reduce((a,w)=>a+(w.calories||0),0);return(<div key={type} className="pin-card" style={{padding:"13px 15px",borderLeft:`3px solid ${wt.color}`}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><span style={{fontSize:17}}>{wt.icon}</span><span style={{fontSize:12,fontWeight:700,color:"var(--ink)"}}>{wt.label}</span></div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:wt.color}}>{cnt} <span style={{fontSize:11,color:"var(--warm-gray)",fontFamily:"'Nunito',sans-serif"}}>sessions</span></div><div style={{fontSize:11,color:"var(--warm-gray)",marginTop:3}}>{cals} kcal this week</div></div>);})}
          </div>
        )}

        {tab==="goals"&&(
          <div className="pin-card" style={{padding:"18px",maxWidth:460}}>
            <SectionHeader title="Weekly Goals"/>
            {[{key:"weeklyWorkouts",label:"Workouts per week",unit:"sessions",current:tw.length},{key:"weeklyDuration",label:"Active minutes/week",unit:"minutes",current:wMins},{key:"dailyCalories",label:"Daily calorie burn",unit:"kcal/day",current:Math.round(wCals/7)}].map(g=>(
              <div key={g.key} style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><label style={{fontSize:13,fontWeight:600,color:"var(--ink)"}}>{g.label}</label><input type="number" className="pin-input" value={goals[g.key]} onChange={e=>setGoals(p=>({...p,[g.key]:+e.target.value}))} style={{width:76,textAlign:"center"}}/></div>
                <ProgressBar value={g.current} max={goals[g.key]||1} color="var(--rose)" height={6}/>
                <div style={{fontSize:11,color:"var(--warm-gray)",marginTop:4}}>{g.current} / {goals[g.key]} {g.unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════════════════════════
const TEMPLATES=[
  {id:"habits", label:"Daily Habits",    emoji:"🌿",desc:"Track streaks & monthly goals",accent:"#34D399",bg:"linear-gradient(135deg,#F0FDF4,#DCFCE7)"},
  {id:"tasks",  label:"Task Manager",    emoji:"✅",desc:"Organized task board",          accent:"#60A5FA",bg:"linear-gradient(135deg,#EFF6FF,#DBEAFE)"},
  {id:"budget", label:"Money Budget",    emoji:"💰",desc:"Income, expenses & limits",     accent:"#FBBF24",bg:"linear-gradient(135deg,#FFFBEB,#FEF3C7)"},
  {id:"journal",label:"Daily Journal",   emoji:"📔",desc:"Mood tracking & free writing",  accent:"#F472B6",bg:"linear-gradient(135deg,#FDF2F8,#FCE7F3)"},
  {id:"fitness",label:"Fitness Tracker", emoji:"💪",desc:"Workouts, calories & goals",    accent:"#A78BFA",bg:"linear-gradient(135deg,#F5F3FF,#EDE9FE)"},
];
const HEIGHTS=[180,210,170,200,185];

function HomePage({ username, onLogout, onSelect }) {
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(253,248,243,.92)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)",padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"var(--ink)",display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:30,height:30,borderRadius:"50%",background:"var(--pinterest-red)",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,flexShrink:0}}>D</span>
          Dayloom
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>👤 {username}</span>
          <button className="pill-btn" onClick={onLogout} style={{fontSize:12,padding:"6px 12px"}}>Sign out</button>
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 18px 100px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,color:"var(--terracotta)",fontWeight:600,letterSpacing:".14em",textTransform:"uppercase",marginBottom:8}}>Weaving your day together</div>
          <div className="home-title">Choose your board</div>
          <div style={{fontSize:14,color:"var(--warm-gray)"}}>Five apps, beautifully yours. Pick one to get started.</div>
        </div>
        <div className="home-board-grid">
          {TEMPLATES.map((t,i)=>(
            <div key={t.id} style={{breakInside:"avoid",marginBottom:14}}>
              <button onClick={()=>onSelect(t.id)} style={{width:"100%",height:HEIGHTS[i],background:t.bg,border:"1px solid var(--border)",borderRadius:20,cursor:"pointer",fontFamily:"'Nunito',sans-serif",textAlign:"left",padding:"18px 20px",display:"flex",flexDirection:"column",justifyContent:"space-between",transition:"transform .22s ease,box-shadow .22s ease",animation:`fadeUp .4s ease ${i*.07}s both`,position:"relative",overflow:"hidden",touchAction:"manipulation"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px) scale(1.02)";e.currentTarget.style.boxShadow="0 20px 50px rgba(44,31,26,.13)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <div style={{position:"absolute",bottom:-18,right:-18,width:80,height:80,borderRadius:"50%",background:t.accent+"22"}}/>
                <div style={{fontSize:30}}>{t.emoji}</div>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"var(--ink)",marginBottom:4}}>{t.label}</div>
                  <div style={{fontSize:12,color:"var(--warm-gray)",lineHeight:1.4,marginBottom:10}}>{t.desc}</div>
                  <span style={{fontSize:11,fontWeight:700,color:t.accent,background:t.accent+"18",borderRadius:999,padding:"4px 11px"}}>Open →</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WithNav({ active, setActive, children }) {
  return (
    <div>
      <div className="bottom-nav">
        {TEMPLATES.map(t=><button key={t.id} onClick={()=>setActive(t.id)} title={t.label} style={{width:40,height:40,borderRadius:999,border:"none",cursor:"pointer",background:active===t.id?"var(--ink)":"transparent",fontSize:18,transition:"all .15s",touchAction:"manipulation"}}>{t.emoji}</button>)}
        <div style={{width:1,background:"var(--border)",margin:"5px 3px"}}/>
        <button onClick={()=>setActive(null)} title="Home" style={{width:40,height:40,borderRadius:999,border:"none",cursor:"pointer",background:"transparent",fontSize:17,color:"var(--warm-gray)",display:"flex",alignItems:"center",justifyContent:"center",touchAction:"manipulation"}}>⌂</button>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState(() => getCurrentSession());
  const [active, setActive] = useState(null);

  const login  = u => { setUsername(u); setActive(null); };
  const logout = () => { setSession(null); setUsername(null); setActive(null); };

  if (!username) return <LoginPage onLogin={login} />;
  if (!active)   return <HomePage username={username} onLogout={logout} onSelect={setActive} />;

  const nav = ch => <WithNav active={active} setActive={setActive}>{ch}</WithNav>;
  if (active==="habits")  return nav(<HabitsTemplate  username={username}/>);
  if (active==="tasks")   return nav(<TaskTemplate    username={username}/>);
  if (active==="budget")  return nav(<BudgetTemplate  username={username}/>);
  if (active==="journal") return nav(<JournalTemplate username={username}/>);
  if (active==="fitness") return nav(<FitnessTemplate username={username}/>);
  return null;
}
