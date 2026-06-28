import { Link } from "wouter";
import { useGetStats } from "@workspace/api-client-react";
import { FileText, Briefcase, FileCheck, Upload, PlusCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_SLOTS } from "@/lib/ads-config";
import { GenerationAllowance } from "@/components/generation-allowance";

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
              { step: "3", label: "Generate tailored applications for each job", href: "/applications", icon: FileCheck, action: "View Applications" },
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
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/upload">
          <Card className="border-border hover:border-primary/40 transition-colors cursor-pointer group" data-testid="quick-upload">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Upload Document</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add a resume, cover letter, or portfolio item</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/add-job">
          <Card className="border-border hover:border-primary/40 transition-colors cursor-pointer group" data-testid="quick-add-job">
            <CardContent className="pt-5 pb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <PlusCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Add Job Listing</p>
                <p className="text-xs text-muted-foreground mt-0.5">Paste a job URL to get started</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

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
