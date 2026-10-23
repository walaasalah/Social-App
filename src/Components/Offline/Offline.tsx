import { useSyncExternalStore, type ReactNode } from "react";

function subscribe(onConnectionChange: () => void) {
  window.addEventListener("online", onConnectionChange);
  window.addEventListener("offline", onConnectionChange);

  return () => {
    window.removeEventListener("online", onConnectionChange);
    window.removeEventListener("offline", onConnectionChange);
  };
}

function getIsOnline() {
  return navigator.onLine;
}

export default function Offline({ children }: { children: ReactNode }) {
  const isOnline = useSyncExternalStore(subscribe, getIsOnline);
  return isOnline ? null : children;
}
