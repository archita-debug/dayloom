import { useState, useEffect, useRef } from "react";
import { dbGet, dbSet, getUserId } from "./supabase";

/**
 * useSupaPersist(key, init)
 *
 * Cache key is namespaced by userId → "dl_{userId}_{key}"
 * This means two users on the same browser NEVER share cache entries.
 *
 * 1. Seed from localStorage immediately (instant, no flash).
 * 2. Fetch from Supabase (source of truth) and update if different.
 * 3. On user change: write localStorage immediately + debounce Supabase save.
 * 4. Never write back from the initial load — only from user actions.
 */
export function useSupaPersist(key, init) {
  // Build a user-scoped cache key so two accounts on the same browser
  // never read each other's cached data.
  const cacheKey = () => `dl_${getUserId() || "anon"}_${key}`;

  const [state, setState] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey());
      if (cached) return JSON.parse(cached);
    } catch {}
    return init;
  });

  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);
  const dirtyRef = useRef(-1);

  // ── Load from Supabase once on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    dirtyRef.current = -1;
    setLoaded(false);

    dbGet(key).then((v) => {
      if (cancelled) return;
      if (v !== null) {
        setState(v);
        try { localStorage.setItem(cacheKey(), JSON.stringify(v)); } catch {}
      }
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ── Save on user changes only (not on initial load) ───────────────────────
  useEffect(() => {
    if (!loaded) return;

    dirtyRef.current += 1;
    if (dirtyRef.current === 0) return; // skip the load-triggered run

    // Write to user-scoped localStorage key immediately
    try { localStorage.setItem(cacheKey(), JSON.stringify(state)); } catch {}

    // Debounce the Supabase write
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dbSet(key, state);
    }, 800);

    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded]);

  return [state, setState, loaded];
}