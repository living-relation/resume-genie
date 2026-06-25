import { useEffect } from "react";
import { ADSENSE_CLIENT, isAdsConfigured } from "@/lib/ads-config";
import { useConsent } from "@/context/consent";

/**
 * Injects the Google AdSense loader script — but only once ads are configured
 * AND the visitor has granted consent. Gating the script load (rather than just
 * the ad render) means no ad cookies are set before consent, which keeps us on
 * the right side of EU/UK ePrivacy rules. Renders nothing.
 */
export function AdSenseScript() {
  const { consent } = useConsent();

  useEffect(() => {
    if (!isAdsConfigured || consent !== "granted") return;
    if (document.getElementById("adsbygoogle-js")) return;

    const script = document.createElement("script");
    script.id = "adsbygoogle-js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }, [consent]);

  return null;
}
