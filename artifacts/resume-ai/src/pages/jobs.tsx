import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useListJobs, getListJobsQueryKey, useDeleteJob } from "@workspace/api-client-react";
import { Briefcase, Trash2, PlusCircle, ExternalLink, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: { label: "Scraping...", icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  scraped: { label: "Ready", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed: { label: "Failed", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function JobRow({ job }: { job: { id: number; url: string; title: string | null; company: string | null; location: string | null; status: string; createdAt: string } }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteJob = useDeleteJob();

  const status = statusConfig[job.status as keyof typeof statusConfig] ?? statusConfig.pending;
  const StatusIcon = status.icon;

  const handleDelete = () => {
    deleteJob.mutate({ id: job.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        toast({ title: "Job removed" });
      },
      onError: () => {
        toast({ title: "Failed to remove job", variant: "destructive" });
      },
    });
  };

  const domain = (() => {
    try { return new URL(job.url).hostname.replace("www.", ""); } catch { return job.url; }
  })();

  return (
    <Card className="border-border" data-testid={`card-job-${job.id}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground" data-testid={`text-job-title-${job.id}`}>
                {job.title ?? "Fetching job details..."}
              </p>
              <Badge className={`text-xs border ${status.className} flex items-center gap-1`} variant="outline">
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {job.company && (
                <p className="text-xs text-muted-foreground font-medium" data-testid={`text-job-company-${job.id}`}>{job.company}</p>
              )}
              {job.location && (
                <p className="text-xs text-muted-foreground">{job.location}</p>
              )}
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
                data-testid={`link-job-url-${job.id}`}
              >
                {domain}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={handleDelete}
            disabled={deleteJob.isPending}
            data-testid={`btn-delete-job-${job.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Jobs() {
  const { data: jobs, isLoading, refetch } = useListJobs();
  const hasPending = jobs?.some((j) => j.status === "pending");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Job Listings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Jobs you want to apply to. We scrape each listing automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPending && (
            <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="btn-refresh-jobs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          )}
          <Link href="/add-job">
            <Button size="sm" data-testid="btn-add-job">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Job
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && jobs && jobs.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No job listings yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Paste a job URL and we'll scrape the details automatically.</p>
          <Link href="/add-job">
            <Button size="sm" data-testid="btn-add-first-job">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Job Listing
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && jobs && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
