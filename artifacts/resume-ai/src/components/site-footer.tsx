import { Link } from "wouter";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-6 py-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>© {year} Resume AI</span>
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
          data-testid="link-privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
