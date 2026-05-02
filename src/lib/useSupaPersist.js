import { useState, useEffect } from "react";
import { dbGet, dbSet } from "./supabase";

// ── useSupaPersist ─────────────────────────────────────────────────────────────
// Loads from Supabase on mount, saves back whenever state changes.
// Returns [state, setState, isLoaded].
export function useSupaPersist(key, init) {
  const [state, setState] = useState(init);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useState(null); // ref-like mutable slot

  // Load once on mount
  useEffect(() => {
    let cancelled = false;
    dbGet(key).then((v) => {
      if (!cancelled) {
        if (v !== null) setState(v);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [key]);

  // Debounced save (600 ms) whenever state changes after load
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer[0]);
    saveTimer[0] = setTimeout(() => { dbSet(key, state); }, 600);
    return () => clearTimeout(saveTimer[0]);
  }, [state, loaded, key]);

  return [state, setState, loaded];
}
