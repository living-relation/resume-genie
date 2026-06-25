/**
 * AdSense configuration, read from build-time Vite env vars. These are public
 * (not secrets) — the publisher ID appears in served ad markup. When the
 * publisher ID is absent (e.g. local development), the app renders labeled ad
 * placeholders instead of calling AdSense, so layouts never break.
 *
 * Required env vars (set before `pnpm --filter @workspace/resume-ai run build`):
 *   VITE_ADSENSE_CLIENT             e.g. "ca-pub-1234567890123456"
 *   VITE_ADSENSE_SLOT_DASHBOARD     numeric ad unit/slot id for the dashboard
 *   VITE_ADSENSE_SLOT_APPLICATIONS  numeric ad unit/slot id for the apps page
 */
export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT ?? "").trim();

export const isAdsConfigured = ADSENSE_CLIENT.startsWith("ca-pub-");

export const AD_SLOTS = {
  dashboard: (import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD ?? "").trim(),
  applications: (import.meta.env.VITE_ADSENSE_SLOT_APPLICATIONS ?? "").trim(),
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}
