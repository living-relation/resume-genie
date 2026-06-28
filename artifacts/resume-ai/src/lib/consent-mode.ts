/**
 * Google Consent Mode v2 wiring for EEA/UK ads compliance.
 *
 * Personalized advertising in the EEA and the UK requires a Google-certified
 * Consent Management Platform (CMP) plus Consent Mode v2. We use Google's own
 * "Privacy & messaging" CMP, which is enabled in the AdSense dashboard and
 * delivered automatically by the AdSense loader (`adsbygoogle.js`).
 *
 * This module sets the Consent Mode *defaults* to "denied" for EEA/UK regions
 * before the AdSense loader runs, so no personalized ad cookies / signals are
 * stored until a visitor makes a choice in the certified CMP. The CMP then
 * issues the `consent` `update` automatically. Regions not in the list are left
 * unset, so consent mode does not restrict them and ads serve normally for
 * non-EEA visitors.
 *
 * Dashboard setup required to actually serve the certified CMP:
 *   AdSense → Privacy & messaging → GDPR → create/publish an EU consent message
 *   with "Consent Mode" enabled. Without that, EEA/UK visitors will not see a
 *   consent dialog and personalized ads will stay limited there.
 */

/** EU-27 + EEA (IS, LI, NO) + UK + Switzerland — regions that require consent. */
const EEA_UK_REGIONS = [
  // EU-27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA (non-EU)
  "IS", "LI", "NO",
  // UK + Switzerland
  "GB", "CH",
];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    googlefc?: {
      callbackQueue?: { push: (cb: () => void) => void };
      showRevocationMessage?: () => void;
    };
  }
}

let initialized = false;

/**
 * Initialise the dataLayer and register Consent Mode v2 defaults. Idempotent and
 * safe to call before ads are configured — it only seeds the consent queue and
 * never loads any network resource. Must run before the AdSense loader.
 */
export function initConsentMode(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  const gtag = (...args: unknown[]) => {
    // gtag.js reads each positional command entry off the dataLayer queue.
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;

  // Deny personalized-ad storage/signals for EEA + UK until the certified CMP
  // records a choice. The CMP issues `gtag("consent", "update", …)` itself.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    region: EEA_UK_REGIONS,
    wait_for_update: 500,
  });
}

/**
 * Re-open the certified CMP so a visitor can change or withdraw consent. Google
 * requires a persistent way to do this; surface it from the site footer. No-op
 * when the CMP is not present (ads unconfigured, or a non-EEA/UK visitor who
 * never saw a consent dialog).
 */
export function openAdConsentSettings(): void {
  if (typeof window === "undefined") return;
  const fc = window.googlefc;
  if (!fc) return;
  if (fc.showRevocationMessage) {
    fc.showRevocationMessage();
  } else if (fc.callbackQueue) {
    fc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.());
  }
}
