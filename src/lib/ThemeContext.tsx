import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "dark" | "light";
export type ThemeColor = "green" | "blue" | "purple" | "orange" | "red";

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  color: "green",
  setMode: () => {},
  setColor: () => {},
});

const COLOR_MAP: Record<ThemeColor, { primary: string; accent: string; ring: string }> = {
  green:  { primary: "145 63% 42%", accent: "145 63% 42%", ring: "145 63% 42%" },
  blue:   { primary: "217 91% 60%", accent: "217 91% 60%", ring: "217 91% 60%" },
  purple: { primary: "271 76% 53%", accent: "271 76% 53%", ring: "271 76% 53%" },
  orange: { primary: "25 95% 53%",  accent: "25 95% 53%",  ring: "25 95% 53%" },
  red:    { primary: "0 72% 51%",   accent: "0 72% 51%",   ring: "0 72% 51%" },
};

const LIGHT_THEME = {
  background: "0 0% 98%",
  foreground: "0 0% 12%",
  card: "0 0% 100%",
  "card-foreground": "0 0% 12%",
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 12%",
  muted: "0 0% 93%",
  "muted-foreground": "0 0% 45%",
  border: "0 0% 88%",
  input: "0 0% 88%",
};

const DARK_THEME = {
  background: "0 0% 7%",
  foreground: "40 20% 90%",
  card: "0 0% 11%",
  "card-foreground": "40 20% 90%",
  popover: "0 0% 11%",
  "popover-foreground": "40 20% 90%",
  muted: "0 0% 15%",
  "muted-foreground": "0 0% 55%",
  border: "0 0% 18%",
  input: "0 0% 18%",
};

function applyTheme(mode: ThemeMode, color: ThemeColor) {
  const root = document.documentElement;
  const base = mode === "light" ? LIGHT_THEME : DARK_THEME;
  const colors = COLOR_MAP[color];

  Object.entries(base).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--primary-foreground", "0 0% 100%");
  root.style.setProperty("--accent-foreground", "0 0% 100%");
  root.style.setProperty("--sidebar-primary", colors.primary);
  root.style.setProperty("--sidebar-ring", colors.ring);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    (localStorage.getItem("theme-mode") as ThemeMode) || "dark"
  );
  const [color, setColorState] = useState<ThemeColor>(() =>
    (localStorage.getItem("theme-color") as ThemeColor) || "green"
  );

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("theme-mode", m);
  };

  const setColor = (c: ThemeColor) => {
    setColorState(c);
    localStorage.setItem("theme-color", c);
  };

  useEffect(() => {
    applyTheme(mode, color);
  }, [mode, color]);

  return (
    <ThemeContext.Provider value={{ mode, color, setMode, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
