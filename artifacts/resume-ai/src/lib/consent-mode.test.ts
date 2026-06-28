import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Compliance guard tests for Google Consent Mode v2.
 *
 * The whole EEA/UK ad-cookie compliance story hinges on `initConsentMode()`
 * registering "denied" defaults BEFORE the AdSense loader runs. If that ever
 * regresses, EEA/UK visitors could receive personalized ad cookies without
 * consent. These tests fail loudly if the defaults, region scope, idempotency,
 * or ordering break.
 */

/** Must stay in sync with EEA_UK_REGIONS in consent-mode.ts. Intentionally
 * duplicated (not imported) so an accidental edit to the source list is caught. */
const EXPECTED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB", "CH",
];

type ConsentDefaultArgs = [
  "consent",
  "default",
  Record<string, unknown>,
];

function consentDefaults(): ConsentDefaultArgs[] {
  const layer = (window.dataLayer ?? []) as unknown[];
  return layer.filter(
    (entry): entry is ConsentDefaultArgs =>
      Array.isArray(entry) && entry[0] === "consent" && entry[1] === "default",
  );
}

beforeEach(() => {
  vi.resetModules();
  delete (window as { dataLayer?: unknown[] }).dataLayer;
  delete (window as { gtag?: unknown }).gtag;
});

afterEach(() => {
  document.getElementById("adsbygoogle-js")?.remove();
  document.getElementById("root")?.remove();
  // Unmock anything individual tests doMock'd, so failures can't leak into the
  // next test.
  vi.doUnmock("@/lib/ads-config");
  vi.doUnmock("./consent-mode");
  vi.doUnmock("../App");
  vi.doUnmock("react-dom/client");
  vi.restoreAllMocks();
});

describe("initConsentMode", () => {
  it("registers Consent Mode v2 defaults with every ad signal denied", async () => {
    const { initConsentMode } = await import("./consent-mode");
    initConsentMode();

    const defaults = consentDefaults();
    expect(defaults).toHaveLength(1);

    const params = defaults[0][2];
    expect(params.ad_storage).toBe("denied");
    expect(params.ad_user_data).toBe("denied");
    expect(params.ad_personalization).toBe("denied");
    expect(params.analytics_storage).toBe("denied");
    // wait_for_update must be present and positive so the CMP's update is
    // honored before any default-allowed signal could fire.
    expect(typeof params.wait_for_update).toBe("number");
    expect(params.wait_for_update as number).toBeGreaterThan(0);
  });

  it("scopes the denied defaults to the EEA/UK/CH region list", async () => {
    const { initConsentMode } = await import("./consent-mode");
    initConsentMode();

    const params = consentDefaults()[0][2];
    expect(params.region).toEqual(EXPECTED_REGIONS);
    // Switzerland + UK must be covered; a non-EEA region must NOT be.
    expect(params.region).toContain("CH");
    expect(params.region).toContain("GB");
    expect(params.region).not.toContain("US");
  });

  it("is idempotent — calling twice does not duplicate the defaults", async () => {
    const { initConsentMode } = await import("./consent-mode");
    initConsentMode();
    initConsentMode();
    initConsentMode();

    expect(consentDefaults()).toHaveLength(1);
  });
});

describe("startup ordering", () => {
  it("main.tsx registers consent defaults before mounting the app", async () => {
    const calls: string[] = [];
    vi.doMock("./consent-mode", () => ({
      initConsentMode: vi.fn(() => calls.push("consent")),
      openAdConsentSettings: vi.fn(),
    }));
    vi.doMock("../App", () => ({ default: () => null }));
    const renderSpy = vi.fn(() => calls.push("render"));
    vi.doMock("react-dom/client", () => ({
      createRoot: vi.fn(() => ({ render: renderSpy, unmount: vi.fn() })),
    }));

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    await import("../main");

    // initConsentMode() must run before the app is rendered, otherwise an
    // ad-related effect could fire before the denied defaults exist.
    expect(calls).toEqual(["consent", "render"]);
  });

  it("queues the denied consent defaults before the AdSense loader script is appended", async () => {
    vi.doMock("@/lib/ads-config", () => ({
      ADSENSE_CLIENT: "ca-pub-0000000000000000",
      isAdsConfigured: true,
    }));

    // Capture the consent state at the exact moment the loader script is added.
    let defaultsPresentAtAppend: boolean | null = null;
    const realAppend = document.head.appendChild.bind(document.head);
    const appendSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node: Node) => {
        if ((node as HTMLElement).id === "adsbygoogle-js") {
          defaultsPresentAtAppend = consentDefaults().length === 1;
        }
        return realAppend(node as never);
      });

    const { render, cleanup } = await import("@testing-library/react");
    const { createElement } = await import("react");
    const { AdSenseScript } = await import("@/components/ads/adsense-script");

    render(createElement(AdSenseScript));

    expect(appendSpy).toHaveBeenCalled();
    expect(document.getElementById("adsbygoogle-js")).not.toBeNull();
    expect(defaultsPresentAtAppend).toBe(true);

    cleanup();
  });
});
