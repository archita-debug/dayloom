// Inject Google Fonts
const fontLink = document.createElement("link");
fontLink.rel   = "stylesheet";
fontLink.href  =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,500&family=Nunito:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap";
document.head.appendChild(fontLink);

// Inject global CSS (CSS variables, animations, shared classes)
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; }

  :root {
    --cream:         #FDF8F3;
    --blush:         #F2C4B8;
    --rose:          #D4756A;
    --terracotta:    #C05E4A;
    --sage:          #8FAF8A;
    --sand:          #E8DACB;
    --warm-gray:     #6B5E56;
    --ink:           #2C1F1A;
    --white:         #FFFFFF;
    --card:          #FFFAF7;
    --border:        #EAD9CC;
    --pinterest-red: #E60023;
  }

  html { font-size: 16px; }
  body { margin: 0; background: var(--cream); -webkit-text-size-adjust: 100%; }

  /* ── Animations ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn  { from { opacity:0; transform:scale(.93); }       to { opacity:1; transform:scale(1); } }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes drift1 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(15px,-20px) rotate(5deg);} 66%{transform:translate(-10px,10px) rotate(-3deg);} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0) rotate(0deg);} 33%{transform:translate(-18px,12px) rotate(-6deg);} 66%{transform:translate(8px,-15px) rotate(4deg);} }
  @keyframes drift3 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(12px,18px) rotate(-5deg);} }
  .blob1 { animation: drift1 8s  ease-in-out infinite; }
  .blob2 { animation: drift2 10s ease-in-out infinite; }
  .blob3 { animation: drift3 7s  ease-in-out infinite; }

  /* ── Cards ── */
  .pin-card {
    background: var(--card);
    border-radius: 20px;
    border: 1px solid var(--border);
    transition: transform .22s ease, box-shadow .22s ease;
    animation: fadeUp .4s ease both;
  }
  .pin-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 16px 40px rgba(44,31,26,.12); }

  /* ── Buttons ── */
  .pill-btn {
    border-radius: 999px;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--warm-gray);
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 7px 18px;
    transition: all .15s;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  .pill-btn:hover, .pill-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pill-btn.red  { background: var(--pinterest-red); color: #fff; border-color: var(--pinterest-red); }
  .pill-btn.red:hover { background: #c0001e; border-color: #c0001e; }
  .pill-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Inputs ── */
  .pin-input {
    background: #FFF8F4;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 10px 14px;
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    color: var(--ink);
    outline: none;
    width: 100%;
    transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .pin-input:focus { border-color: var(--rose); box-shadow: 0 0 0 3px rgba(212,117,106,.12); }

  /* ── Masonry grid ── */
  .masonry { columns: 2; column-gap: 14px; }
  .masonry > * { break-inside: avoid; margin-bottom: 14px; }

  /* ── Spinner ── */
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    display: inline-block;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 10px; }

  /* ── Login ── */
  .login-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }

  /* ── Home ── */
  .home-board-grid { columns: 2; column-gap: 16px; }
  .home-title { font-family: 'Playfair Display', serif; font-size: 46px; font-weight: 700; color: var(--ink); line-height: 1.1; margin-bottom: 14px; }

  /* ── Layout wrappers ── */
  .section-wrap { max-width: 860px; margin: 0 auto; padding: 24px 28px; }
  .page-header  { padding: 26px 28px; }
  .page-body    { padding-bottom: 90px; }
  .stat-pills   { display: flex; gap: 10px; flex-wrap: wrap; }

  /* ── Task layout ── */
  .tasks-layout { display: grid; grid-template-columns: 190px 1fr; gap: 22px; }
  .task-filter-list { display: flex; flex-direction: column; gap: 6px; }

  /* ── Budget ── */
  .budget-summary     { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .budget-limits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .budget-actions     { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }

  /* ── Journal ── */
  .journal-layout  { display: grid; grid-template-columns: 260px 1fr; min-height: calc(100vh - 90px); }
  .mood-picker     { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; align-items: center; }

  /* ── Fitness / Study ── */
  .fitness-stats     { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
  .fitness-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .week-bar          { display: flex; align-items: flex-end; gap: 8px; height: 80px; }

  /* ── Form grids ── */
  .form-grid-3  { display: grid; grid-template-columns: 1fr 1fr 1fr;         gap: 10px; }
  .form-grid-4  { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;     gap: 10px; }
  .form-row-add { display: grid; grid-template-columns: 1fr auto auto;        gap: 10px; }

  /* ── Habit-specific ── */
  .add-habit-row  { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .habit-icon-input { width: 52px !important; text-align: center; font-size: 18px !important; flex-shrink: 0; }

  /* ── Shared ── */
  .section-header-wrap { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 8px; }
  .tab-bar { display: flex; gap: 6px; background: var(--card); border-radius: 14px; padding: 5px; border: 1px solid var(--border); }
  .txn-desc { font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── Bottom nav ── */
  .bottom-nav {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    background: rgba(253,248,243,.94);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-radius: 999px;
    padding: 7px 10px;
    display: flex;
    gap: 4px;
    border: 1px solid var(--border);
    box-shadow: 0 8px 32px rgba(44,31,26,.15);
  }

  /* ════════════════ RESPONSIVE ════════════════ */
  @media (max-width: 600px) {
    .masonry        { columns: 1; }
    .pin-card       { border-radius: 14px; }
    .home-board-grid { columns: 1; }
    .home-title     { font-size: 28px; }
    .section-wrap   { padding: 14px 12px; }
    .page-header    { padding: 18px 14px; }
    .budget-summary     { grid-template-columns: 1fr; gap: 8px; }
    .budget-limits-grid { grid-template-columns: 1fr; }
    .fitness-stats  { grid-template-columns: 1fr 1fr; gap: 8px; }
    .fitness-stat-grid { grid-template-columns: 1fr; }
    .form-grid-3    { grid-template-columns: 1fr; }
    .form-grid-4    { grid-template-columns: 1fr 1fr; }
    .form-row-add > :first-child { grid-column: span 2; }
    .form-row-add   { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 700px) {
    .login-grid           { grid-template-columns: 1fr; }
    .login-deco           { display: none !important; }
    .login-form           { padding: 28px 20px !important; min-height: 100vh; }
    .tasks-layout         { grid-template-columns: 1fr; }
    .tasks-sidebar        { display: none; }
    .tasks-sidebar.open   { display: block; margin-bottom: 14px; }
    .task-filter-list     { flex-direction: row; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
    .task-filter-list button { flex-shrink: 0; }
    .journal-layout       { grid-template-columns: 1fr; min-height: auto; }
    .journal-sidebar      { border-right: none !important; border-bottom: 1px solid var(--border); max-height: 240px; }
    .journal-main         { padding: 20px 14px !important; }
  }
  @media (max-width: 480px) {
    .bottom-nav        { padding: 5px 7px; gap: 2px; bottom: 10px; }
    .bottom-nav button { width: 34px !important; height: 34px !important; font-size: 15px !important; }
  }
`;
document.head.appendChild(style);
