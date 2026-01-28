import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system" | "auto";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
  switchable: boolean;
  // Auto-switch settings
  autoSwitchEnabled: boolean;
  autoSwitchTimes: { lightStart: number; darkStart: number };
  setAutoSwitchTimes: (times: { lightStart: number; darkStart: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getAutoTheme(lightStart: number, darkStart: number): ResolvedTheme {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Default: light 6h-18h, dark 18h-6h
  if (lightStart < darkStart) {
    // Normal case: light during day, dark during night
    return currentHour >= lightStart && currentHour < darkStart ? "light" : "dark";
  } else {
    // Inverted case: dark during day, light during night
    return currentHour >= darkStart && currentHour < lightStart ? "dark" : "light";
  }
}

function resolveTheme(
  theme: Theme,
  autoSwitchTimes: { lightStart: number; darkStart: number }
): ResolvedTheme {
  if (theme === "system") return getSystemTheme();
  if (theme === "auto") return getAutoTheme(autoSwitchTimes.lightStart, autoSwitchTimes.darkStart);
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [autoSwitchTimes, setAutoSwitchTimesState] = useState<{
    lightStart: number;
    darkStart: number;
  }>(() => {
    if (switchable && typeof window !== "undefined") {
      const stored = localStorage.getItem("autoSwitchTimes");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return { lightStart: 6, darkStart: 18 }; // Default: 6h-18h light, 18h-6h dark
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme, autoSwitchTimes)
  );

  useEffect(() => {
    const newResolvedTheme = resolveTheme(theme, autoSwitchTimes);
    setResolvedTheme(newResolvedTheme);

    const root = document.documentElement;
    if (newResolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, autoSwitchTimes, switchable]);

  // Listen for system theme changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newResolvedTheme = getSystemTheme();
      setResolvedTheme(newResolvedTheme);

      const root = document.documentElement;
      if (newResolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Auto-switch timer when theme is "auto"
  useEffect(() => {
    if (theme !== "auto") return;

    // Check every minute if theme should change
    const interval = setInterval(() => {
      const newResolvedTheme = getAutoTheme(autoSwitchTimes.lightStart, autoSwitchTimes.darkStart);
      if (newResolvedTheme !== resolvedTheme) {
        setResolvedTheme(newResolvedTheme);

        const root = document.documentElement;
        if (newResolvedTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme, autoSwitchTimes, resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setAutoSwitchTimes = (times: { lightStart: number; darkStart: number }) => {
    setAutoSwitchTimesState(times);
    if (switchable) {
      localStorage.setItem("autoSwitchTimes", JSON.stringify(times));
    }
    // Force re-evaluation if in auto mode
    if (theme === "auto") {
      const newResolvedTheme = getAutoTheme(times.lightStart, times.darkStart);
      setResolvedTheme(newResolvedTheme);

      const root = document.documentElement;
      if (newResolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const toggleTheme = switchable
    ? () => {
        setThemeState(prev => {
          // Cycle through: light -> dark -> system -> auto -> light
          if (prev === "light") return "dark";
          if (prev === "dark") return "system";
          if (prev === "system") return "auto";
          return "light";
        });
      }
    : undefined;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        switchable,
        autoSwitchEnabled: theme === "auto",
        autoSwitchTimes,
        setAutoSwitchTimes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
