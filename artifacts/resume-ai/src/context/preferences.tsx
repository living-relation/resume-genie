import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "steampunk" | "unicorn";
export type Tone = "professional" | "casual" | "executive" | "creative" | "technical";
export type WritingStyle = "standard" | "concise" | "detailed" | "storytelling";
export type Truthfulness = 0 | 1 | 2 | 3 | 4;

export interface Preferences {
  theme: Theme;
  tone: Tone;
  style: WritingStyle;
  truthfulness: Truthfulness;
}

interface PreferencesContextValue extends Preferences {
  setTheme: (t: Theme) => void;
  setTone: (t: Tone) => void;
  setStyle: (s: WritingStyle) => void;
  setTruthfulness: (v: Truthfulness) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark");
  root.removeAttribute("data-theme");
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "steampunk" || theme === "unicorn") {
    root.setAttribute("data-theme", theme);
  }
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => load("pref:theme", "light"));
  const [tone, setToneState] = useState<Tone>(() => load("pref:tone", "professional"));
  const [style, setStyleState] = useState<WritingStyle>(() => load("pref:style", "standard"));
  const [truthfulness, setTruthfulnessState] = useState<Truthfulness>(() => load("pref:truthfulness", 1));

  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = (t: Theme) => { save("pref:theme", t); setThemeState(t); };
  const setTone = (t: Tone) => { save("pref:tone", t); setToneState(t); };
  const setStyle = (s: WritingStyle) => { save("pref:style", s); setStyleState(s); };
  const setTruthfulness = (v: Truthfulness) => { save("pref:truthfulness", v); setTruthfulnessState(v); };

  return (
    <PreferencesContext.Provider value={{ theme, tone, style, truthfulness, setTheme, setTone, setStyle, setTruthfulness }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

export const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Formal, polished, corporate" },
  { value: "casual", label: "Casual", description: "Friendly, conversational, approachable" },
  { value: "executive", label: "Executive", description: "Strategic, leadership-focused" },
  { value: "creative", label: "Creative", description: "Bold, distinctive, personality-forward" },
  { value: "technical", label: "Technical", description: "Precise, expert, detail-rich" },
];

export const STYLE_OPTIONS: { value: WritingStyle; label: string; description: string }[] = [
  { value: "standard", label: "Standard", description: "Balanced, comprehensive" },
  { value: "concise", label: "Concise", description: "Punchy, one-page focused" },
  { value: "detailed", label: "Detailed", description: "Thorough, context-rich" },
  { value: "storytelling", label: "Storytelling", description: "Narrative, career-journey style" },
];

export const TRUTHFULNESS_LEVELS: { label: string; description: string; color: string }[] = [
  { label: "Modest", description: "Understated — let facts speak quietly", color: "text-blue-500" },
  { label: "Accurate", description: "Honest and exact — no embellishment", color: "text-green-500" },
  { label: "Polished", description: "Best light — strong verbs, rounded up", color: "text-yellow-500" },
  { label: "Amplified", description: "Impressive metrics added where plausible", color: "text-orange-500" },
  { label: "Maximized", description: "Perfect-candidate mode — believable numbers fabricated (no fake degrees/certs)", color: "text-red-500" },
];
