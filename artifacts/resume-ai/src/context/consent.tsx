import { createContext, useContext, useState, type ReactNode } from "react";
import { isAdsConfigured } from "@/lib/ads-config";

type Consent = "granted" | "denied";

const STORAGE_KEY = "rg_ads_consent";

interface ConsentContextValue {
  consent: Consent | null;
  /** True when ads are configured and the visitor hasn't chosen yet. */
  needsChoice: boolean;
  setConsent: (c: Consent) => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function readStored(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<Consent | null>(readStored);

  const setConsent = (c: Consent) => {
    setConsentState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  };

  const needsChoice = isAdsConfigured && consent === null;

  return (
    <ConsentContext.Provider value={{ consent, needsChoice, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
