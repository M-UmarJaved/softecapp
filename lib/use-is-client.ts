import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {
    // No external store subscription needed.
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function useIsClient() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}