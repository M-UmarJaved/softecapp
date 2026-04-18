"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudentProfileSpec } from "@/lib/types";

type ProfileState = "idle" | "loading" | "saving" | "saved" | "error";

export function useProfile(defaultProfile: StudentProfileSpec) {
  const [profile,      setProfile]      = useState<StudentProfileSpec>(defaultProfile);
  const [profileState, setProfileState] = useState<ProfileState>("idle");
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);

  // Load profile from server on mount
  useEffect(() => {
    setProfileState("loading");
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { profile?: StudentProfileSpec | null }) => {
        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          setIsLoggedIn(true);
        }
        setProfileState("idle");
      })
      .catch(() => setProfileState("idle"));
  }, []);

  const saveProfile = useCallback(async (p: StudentProfileSpec) => {
    setProfileState("saving");
    try {
      const res = await fetch("/api/profile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ profile: p }),
      });
      if (res.ok) {
        setProfileState("saved");
        setTimeout(() => setProfileState("idle"), 2000);
      } else {
        setProfileState("error");
      }
    } catch {
      setProfileState("error");
    }
  }, []);

  return { profile, setProfile, saveProfile, profileState, isLoggedIn };
}
