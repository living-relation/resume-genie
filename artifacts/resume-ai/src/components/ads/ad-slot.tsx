import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, isAdsConfigured } from "@/lib/ads-config";
import { useConsent } from "@/context/consent";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  /** AdSense ad unit/slot id. */
  slot: string;
  className?: string;
}

/**
 * A single responsive display ad.
 * - Unconfigured (dev): renders a clearly-labeled placeholder so layouts stay intact.
 * - Configured but no consent: renders nothing (no ad cookies before consent).
 * - Configured + consent granted: renders a real responsive AdSense unit.
 */
export function AdSlot({ slot, className }: AdSlotProps) {
  const { consent } = useConsent();
  const pushed = useRef(false);
  const active = isAdsConfigured && consent === "granted" && slot.length > 0;

  useEffect(() => {
    if (!active || pushed.current) return;

    const tryPush = (): boolean => {
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({});
        return true;
      } catch {
        return false;
      }
    };

    // The AdSense loader script is injected asynchronously only after consent,
    // so it may not be ready on the first attempt. Retry briefly until the push
    // succeeds rather than waiting for an unrelated remount.
    if (tryPush()) {
      pushed.current = true;
      return;
    }
    const interval = setInterval(() => {
      if (tryPush()) {
        pushed.current = true;
        clearInterval(interval);
      }
    }, 400);
    const stop = setTimeout(() => clearInterval(interval), 10000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [active]);

  if (!isAdsConfigured) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center",
          className,
        )}
        data-testid="ad-placeholder"
      >
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Ad placeholder
        </span>
      </div>
    );
  }

  if (consent !== "granted" || slot.length === 0) return null;

  return (
    <div className={className} data-testid="ad-slot">
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
