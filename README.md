# 🌿 Dayloom

> *Weaving your day together, one habit at a time.*

Dayloom is a personal productivity app with six beautifully designed boards — all synced to your account via Supabase so your data is available on any device.

---

## ✨ Boards

| Board | Description |
|-------|-------------|
| 🌿 Daily Habits | Track streaks, log daily check-ins, and view a month-at-a-glance calendar |
| ✅ Task Manager | Organized task board with categories, priorities, due dates, and search |
| 💰 Money Budget | Log income & expenses, set monthly limits per category, track balance |
| 📔 Daily Journal | Mood tracking, free writing, and tagging — with a sidebar entry list |
| 💪 Fitness Tracker | Log workouts, track calories & duration, weekly stats and goal setting |
| 📚 Study Tracker | Log study sessions by subject, built-in Pomodoro timer, focus stats |

All boards start **empty** — no pre-filled data — so every user can personalize from scratch.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Installation

```bash
# 1. Unzip the project
unzip dayloom-final.zip -d dayloom
cd dayloom

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Other commands

```bash
npm run build      # Production build → output in /dist
npm run preview    # Preview the production build locally
```

---

## 🗂️ Project Structure

```
src/
├── App.jsx                        # Root — auth gate + board router (65 lines)
├── main.jsx                       # React entry point
├── index.css                      # Tailwind import
│
├── lib/
│   ├── supabase.js                # Auth (sign up, sign in, token refresh) + DB (GET/PATCH/POST)
│   ├── useSupaPersist.js          # Custom hook — localStorage cache + Supabase sync
│   ├── utils.js                   # Shared helpers (todayISO, uid, fmt, days7…)
│   └── globalStyles.js            # CSS variables, animations, layout classes (injected into <head>)
│
├── components/
│   ├── LoginPage.jsx              # Sign in / Sign up form
│   ├── HomePage.jsx               # Board picker grid
│   ├── WithNav.jsx                # Bottom navigation bar
│   └── ui.jsx                     # Shared UI — Loader, ProgressBar, Ring, StatPill, SectionHeader
│
└── templates/
    ├── HabitsTemplate.jsx         # Daily Habits board
    ├── TaskTemplate.jsx           # Task Manager board
    ├── BudgetTemplate.jsx         # Money Budget board
    ├── JournalTemplate.jsx        # Daily Journal board
    ├── FitnessTemplate.jsx        # Fitness Tracker board
    └── StudyTemplate.jsx          # Study Tracker board
```

---

## 🔧 How Data Persistence Works

Data is persisted in two layers:

1. **localStorage** (instant) — data is written here immediately on every change so the UI is always snappy, even offline.
2. **Supabase** (source of truth) — data is synced to Supabase after an 800ms debounce. On page load, Supabase is fetched and overwrites localStorage if different (handles multi-device sync).

The `useSupaPersist(key, defaultValue)` hook handles this automatically in every template. It uses a `PATCH` request to update existing rows and a `POST` to insert new ones, avoiding the duplicate key conflict that a plain `POST` with upsert would cause.

---

## 🗄️ Supabase Setup

The project connects to a pre-configured Supabase project. If you want to use your own:

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL editor to create the required table:

```sql
create table user_data (
  user_id uuid references auth.users not null,
  key text not null,
  value jsonb,
  unique (user_id, key)
);

-- Enable Row Level Security
alter table user_data enable row level security;

-- Allow users to read and write only their own data
create policy "Users can manage their own data"
  on user_data for all
  using (auth.uid() = user_id);
```

3. Replace `SUPA_URL` and `SUPA_KEY` at the top of `src/lib/supabase.js` with your project's URL and anon key.

---

## 🛠️ Tech Stack

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **Tailwind CSS** — utility classes via `@tailwindcss/vite`
- **Supabase** — authentication and database (REST API, no SDK)
- **Google Fonts** — Playfair Display, Cormorant Garamond, Nunito

No other dependencies.

---

## 📱 Responsive

Dayloom is fully responsive — all boards, the login page, journal sidebar, task filters, and navigation work on mobile, tablet, and desktop.
