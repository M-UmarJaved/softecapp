"use client";

import { useState } from "react";

/**
 * Tracks which opportunity IDs have been marked as applied.
 * Persists to localStorage so it survives page refresh within the session.
 */
const STORAGE_KEY = "oic-applied";

function readApplied(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeApplied(set: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export function useApplied() {
  const [applied, setApplied] = useState<Set<string>>(readApplied);

  const markApplied = (id: string) => {
    setApplied((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeApplied(next);
      return next;
    });
  };

  const unmarkApplied = (id: string) => {
    setApplied((prev) => {
      const next = new Set(prev);
      next.delete(id);
      writeApplied(next);
      return next;
    });
  };

  return { applied, markApplied, unmarkApplied };
}
