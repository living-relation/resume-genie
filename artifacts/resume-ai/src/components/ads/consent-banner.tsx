import { Link } from "wouter";
import { useConsent } from "@/context/consent";
import { Button } from "@/components/ui/button";

/**
 * Lightweight cookie/ads consent banner. Shown only when ads are configured and
 * the visitor hasn't decided yet. Declining keeps AdSense (and its cookies) from
 * loading at all. For full personalized-ads compliance in the EEA, Google
 * recommends a certified CMP — see replit.md.
 */
export function ConsentBanner() {
  const { needsChoice, setConsent } = useConsent();
  if (!needsChoice) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      data-testid="consent-banner"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          We use cookies to show ads that keep Resume AI free. You can accept ad
          cookies or decline — declining means no ad cookies are set. See our{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsent("denied")}
            data-testid="btn-consent-decline"
          >
            Decline
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")} data-testid="btn-consent-accept">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
