import { useState, useEffect, useRef } from "react";
import { dbGet, dbSet } from "./supabase";

/**
 * useSupaPersist(key, init)
 *
 * 1. Seed from localStorage immediately (instant, no flash).
 * 2. Fetch from Supabase (source of truth) and update if different.
 * 3. On user change: write localStorage immediately + debounce Supabase PATCH/POST.
 * 4. Never write back from the initial load — only from user actions.
 */
export function useSupaPersist(key, init) {
  const [state, setState] = useState(() => {
    try {
      const cached = localStorage.getItem("dl_" + key);
      if (cached) return JSON.parse(cached);
    } catch {}
    return init;
  });

  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);
  const dirtyRef = useRef(-1);

  // ── Load from Supabase once on mount ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    dirtyRef.current = -1;
    setLoaded(false);

    dbGet(key).then((v) => {
      if (cancelled) return;
      if (v !== null) {
        setState(v);
        try { localStorage.setItem("dl_" + key, JSON.stringify(v)); } catch {}
      }
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ── Save on user changes only (not on initial load) ──────────────────────
  useEffect(() => {
    if (!loaded) return;

    dirtyRef.current += 1;
    if (dirtyRef.current === 0) return; // skip the load-triggered run

    // Write to localStorage immediately
    try { localStorage.setItem("dl_" + key, JSON.stringify(state)); } catch {}

    // Debounce the Supabase write (PATCH if exists, POST if new)
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dbSet(key, state);
    }, 800);

    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded]);

  return [state, setState, loaded];
}
