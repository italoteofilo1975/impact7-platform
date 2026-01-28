import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system" | "auto" | "sunset";
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
  // Sunset/Sunrise settings
  sunsetSunriseEnabled: boolean;
  sunTimes: { sunrise: string; sunset: string } | null;
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

async function fetchSunTimes(latitude: number, longitude: number): Promise<{ sunrise: string; sunset: string } | null> {
  try {
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
    );
    const data = await response.json();
    if (data.status === "OK") {
      return {
        sunrise: data.results.sunrise,
        sunset: data.results.sunset,
      };
    }
  } catch (error) {
    console.error("Failed to fetch sun times:", error);
  }
  return null;
}

function getSunsetTheme(sunTimes: { sunrise: string; sunset: string } | null): ResolvedTheme {
  if (!sunTimes) return "light"; // Fallback to light if no sun times available
  
  const now = new Date();
  const sunrise = new Date(sunTimes.sunrise);
  const sunset = new Date(sunTimes.sunset);
  
  // Light during day (sunrise to sunset), dark during night
  return now >= sunrise && now < sunset ? "light" : "dark";
}

function resolveTheme(
  theme: Theme,
  autoSwitchTimes: { lightStart: number; darkStart: number },
  sunTimes: { sunrise: string; sunset: string } | null
): ResolvedTheme {
  switch (theme) {
    case "light":
      return "light";
    case "dark":
      return "dark";
    case "system":
      return getSystemTheme();
    case "auto":
      return getAutoTheme(autoSwitchTimes.lightStart, autoSwitchTimes.darkStart);
    case "sunset":
      return getSunsetTheme(sunTimes);
    default:
      return "light";
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem("theme") as Theme) || defaultTheme;
  });

  const [autoSwitchTimes, setAutoSwitchTimesState] = useState<{
    lightStart: number;
    darkStart: number;
  }>(() => {
    if (typeof window === "undefined") return { lightStart: 6, darkStart: 18 };
    const saved = localStorage.getItem("autoSwitchTimes");
    return saved ? JSON.parse(saved) : { lightStart: 6, darkStart: 18 };
  });

  const [sunTimes, setSunTimes] = useState<{ sunrise: string; sunset: string } | null>(null);

  const resolvedTheme = resolveTheme(theme, autoSwitchTimes, sunTimes);

  // Fetch sun times when sunset mode is enabled
  useEffect(() => {
    if (theme === "sunset" && !sunTimes) {
      // Get user's geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const times = await fetchSunTimes(latitude, longitude);
            if (times) {
              setSunTimes(times);
              localStorage.setItem("sunTimes", JSON.stringify(times));
              localStorage.setItem("sunTimesExpiry", String(Date.now() + 24 * 60 * 60 * 1000)); // 24h expiry
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Fallback to default times (approximate for UTC)
            setSunTimes({
              sunrise: new Date().toISOString().replace(/T.*/, "T06:00:00Z"),
              sunset: new Date().toISOString().replace(/T.*/, "T18:00:00Z"),
            });
          }
        );
      }
    }

    // Load cached sun times if available and not expired
    if (theme === "sunset" && !sunTimes) {
      const cached = localStorage.getItem("sunTimes");
      const expiry = localStorage.getItem("sunTimesExpiry");
      if (cached && expiry && Date.now() < parseInt(expiry)) {
        setSunTimes(JSON.parse(cached));
      }
    }
  }, [theme, sunTimes]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Auto-switch timer (check every minute)
  useEffect(() => {
    if (theme !== "auto" && theme !== "sunset") return;

    const interval = setInterval(() => {
      const newResolved = resolveTheme(theme, autoSwitchTimes, sunTimes);
      if (newResolved !== resolvedTheme) {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newResolved);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme, autoSwitchTimes, resolvedTheme, sunTimes]);

  // Observe <html> class changes for dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Force re-render when theme class changes
          setThemeState((prev) => prev);
        }
      });
    });

    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setAutoSwitchTimes = (times: { lightStart: number; darkStart: number }) => {
    setAutoSwitchTimesState(times);
    localStorage.setItem("autoSwitchTimes", JSON.stringify(times));
  };

  const toggleTheme = () => {
    if (!switchable) return;
    const themes: Theme[] = ["light", "dark", "system", "auto", "sunset"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme: switchable ? toggleTheme : undefined,
        switchable,
        autoSwitchEnabled: theme === "auto",
        autoSwitchTimes,
        setAutoSwitchTimes,
        sunsetSunriseEnabled: theme === "sunset",
        sunTimes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
