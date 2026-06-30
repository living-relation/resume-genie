import { Link } from "wouter";
import { useGetStats } from "@workspace/api-client-react";
import { FileText, Briefcase, FileCheck, Upload, PlusCircle, ArrowRight, SlidersHorizontal, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads-config";
import { GenerationAllowance } from "@/components/generation-allowance";
import { useSettingsActions } from "@/components/layout";

function NavTile({
  href, label, value, icon: Icon, isLoading, testId,
}: {
  href: string;
  label: string;
  value: number;
  icon: React.ElementType;
  isLoading: boolean;
  testId: string;
}) {
  return (
    <Link href={href}>
      <Card
        className="border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full"
        data-testid={testId}
      >
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            <span>Open</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();
  const { openSettings, pokeSettingsCog } = useSettingsActions();

  const isEmpty = !isLoading && stats && stats.documentCount === 0 && stats.jobCount === 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your job application workspace at a glance.</p>
        </div>
        <GenerationAllowance className="mt-1" />
      </div>

      {/* Nav tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <NavTile
          href="/documents"
          label="Uploaded"
          value={stats?.documentCount ?? 0}
          icon={FileText}
          isLoading={isLoading}
          testId="tile-uploaded"
        />
        <NavTile
          href="/jobs"
          label="Job Listings"
          value={stats?.jobCount ?? 0}
          icon={Briefcase}
          isLoading={isLoading}
          testId="tile-jobs"
        />
        <NavTile
          href="/applications"
          label="Generated Assets"
          value={stats?.applicationCount ?? 0}
          icon={FileCheck}
          isLoading={isLoading}
          testId="tile-assets"
        />
      </div>

      {/* Getting started */}
      {isEmpty && (
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-base">Get started in 3 steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { step: "1", label: "Upload your resume or cover letter", href: "/upload", icon: Upload, action: "Upload Document" },
              { step: "2", label: "Add job listings you want to apply to", href: "/add-job", icon: PlusCircle, action: "Add Job" },
            ].map(({ step, label, href, icon: Icon, action }) => (
              <Link key={step} href={href}>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group" data-testid={`step-${step}`}>
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}

            {/* Optional: Customize output */}
            <div
              role="button"
              tabIndex={0}
              onClick={openSettings}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSettings(); } }}
              className="flex flex-col gap-2 p-3 rounded-lg border border-dashed border-primary/40 bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer group"
              data-testid="step-customize"
            >
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-accent text-primary flex items-center justify-center flex-shrink-0 border border-primary/30">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Optional: customize your output
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set the language, writing style, and truthfulness of generated resumes &amp; cover letters
                  </p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-medium">Open Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); pokeSettingsCog(); }}
                className="self-start ml-11 text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
                data-testid="link-show-settings-cog"
              >
                Same as the settings ⚙ — show me
              </button>
            </div>

            <Link href="/applications">
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group" data-testid="step-3">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Generate tailored applications for each job</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">View Applications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Generate CTA when there are jobs */}
      {!isLoading && stats && stats.jobCount > 0 && stats.documentCount > 0 && (
        <div className="mt-6">
          <Link href="/applications">
            <Button className="w-full" data-testid="btn-go-generate">
              <FileCheck className="w-4 h-4 mr-2" />
              Generate Applications
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      <AdSlot slot={AD_SLOTS.dashboard} className="mt-10" />
    </div>
  );
}
