import { useGetStats } from "@workspace/api-client-react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function formatReset(resetAt: string | undefined): string {
  if (!resetAt) return "tomorrow";
  const reset = new Date(resetAt);
  if (Number.isNaN(reset.getTime())) return "tomorrow";
  const diffMs = reset.getTime() - Date.now();
  if (diffMs <= 0) return "soon";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `in ${hours}h`;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return `in ${minutes}m`;
}

export function GenerationAllowance({ className }: { className?: string }) {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading || !stats) return null;

  const remaining = stats.generationsRemaining;
  const limit = stats.generationsLimit;
  const isExhausted = remaining <= 0;
  const isLow = !isExhausted && remaining <= Math.max(1, Math.ceil(limit * 0.2));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        isExhausted
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : isLow
            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
            : "border-border bg-accent/50 text-muted-foreground",
        className
      )}
      data-testid="generation-allowance"
    >
      <Zap className={cn("w-3.5 h-3.5", isExhausted ? "text-destructive" : "text-primary")} />
      {isExhausted ? (
        <span data-testid="text-generations-remaining">
          No free generations left — resets {formatReset(stats.generationsResetAt)}
        </span>
      ) : (
        <span data-testid="text-generations-remaining">
          <span className="font-bold text-foreground">{remaining}</span> of {limit} free generation
          {limit !== 1 ? "s" : ""} left today
          <span className="text-muted-foreground"> · resets {formatReset(stats.generationsResetAt)}</span>
        </span>
      )}
    </div>
  );
}
