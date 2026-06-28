import { Link } from "wouter";
import { isAdsConfigured } from "@/lib/ads-config";
import { openAdConsentSettings } from "@/lib/consent-mode";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-6 py-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>© {year} Resume AI</span>
        <div className="flex items-center gap-4">
          {isAdsConfigured && (
            <button
              type="button"
              onClick={openAdConsentSettings}
              className="hover:text-foreground transition-colors"
              data-testid="btn-privacy-choices"
            >
              Privacy choices
            </button>
          )}
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
            data-testid="link-privacy"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
