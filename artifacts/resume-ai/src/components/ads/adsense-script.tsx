import { useEffect } from "react";
import { ADSENSE_CLIENT, isAdsConfigured } from "@/lib/ads-config";
import { initConsentMode } from "@/lib/consent-mode";

/**
 * Injects the Google AdSense loader. That loader also delivers Google's
 * certified Consent Management Platform (the GDPR "Privacy & messaging" message
 * configured in the AdSense dashboard) to EEA/UK visitors.
 *
 * Consent Mode v2 defaults are set to "denied" for EEA/UK before this runs (see
 * `initConsentMode`), so loading the script does not set personalized ad cookies
 * for those visitors until they accept in the certified CMP. Renders nothing.
 */
export function AdSenseScript() {
  useEffect(() => {
    if (!isAdsConfigured) return;
    initConsentMode();
    if (document.getElementById("adsbygoogle-js")) return;

    const script = document.createElement("script");
    script.id = "adsbygoogle-js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
