"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

const ThemeCtx = createContext({ dark: false, toggle: () => {}, setTheme: () => {} });

// The inline script in app/layout.js sets <html class="dark"> before first paint from the saved choice
// (or the system setting). This provider mirrors that class and changes it.
function subscribe(cb) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

function setTheme(next) {
  document.documentElement.classList.toggle("dark", next);
  try { localStorage.setItem("ev-theme", next ? "dark" : "light"); } catch {}
}

export function ThemeProvider({ children }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Follow the system setting live, unless the visitor picked a theme themselves
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      let saved = null;
      try { saved = localStorage.getItem("ev-theme"); } catch {}
      if (!saved) document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <ThemeCtx.Provider value={{ dark, toggle: () => setTheme(!getSnapshot()), setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
