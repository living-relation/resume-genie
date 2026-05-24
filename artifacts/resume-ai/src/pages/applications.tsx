import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListApplications,
  getListApplicationsQueryKey,
  useCreateApplication,
  useDeleteApplication,
  useListJobs,
  useGetApplication,
  getGetApplicationQueryKey,
} from "@workspace/api-client-react";
import {
  FileCheck, Trash2, Wand2, CheckCircle, Clock, XCircle,
  RefreshCw, ChevronLeft, Copy, Download, Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePreferences, TRUTHFULNESS_LEVELS, TONE_OPTIONS, STYLE_OPTIONS } from "@/context/preferences";
import { cn } from "@/lib/utils";

const statusConfig = {
  generating: { label: "Generating...", icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  done: { label: "Ready", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed: { label: "Failed", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function ApplicationDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: app, isLoading, refetch } = useGetApplication(id, {
    query: { queryKey: getGetApplicationQueryKey(id) },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast({ title: `${label} copied to clipboard` }));
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!app) return null;

  const status = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.generating;
  const StatusIcon = status.icon;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="btn-back-to-list"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate" data-testid="detail-title">
              {app.jobTitle ?? "Application"}
            </h1>
            {app.jobCompany && <span className="text-muted-foreground text-sm">— {app.jobCompany}</span>}
            <Badge className={cn("text-xs border flex items-center gap-1", status.className)} variant="outline">
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>
        </div>
        {app.status === "generating" && (
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: getGetApplicationQueryKey(id) });
            refetch();
          }} data-testid="btn-refresh-app">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        )}
      </div>

      {app.status === "generating" && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl mb-6">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Generating your application...</p>
          <p className="text-xs text-muted-foreground mt-1">Usually 20–40 seconds. Hit Refresh when ready.</p>
        </div>
      )}

      {app.status === "failed" && (
        <div className="text-center py-12 border border-dashed border-destructive/30 rounded-xl bg-destructive/5 mb-6">
          <XCircle className="w-10 h-10 text-destructive/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Generation failed</p>
          <p className="text-xs text-muted-foreground mt-1">Try generating again from the list view.</p>
        </div>
      )}

      {app.status === "done" && app.resume && app.coverLetter && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { label: "Resume", content: app.resume, filename: `resume-${app.jobCompany ?? "job"}.txt`, testId: "resume" },
            { label: "Cover Letter", content: app.coverLetter, filename: `cover-letter-${app.jobCompany ?? "job"}.txt`, testId: "cover" },
          ].map(({ label, content, filename, testId }) => (
            <div key={testId} className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">{label}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyToClipboard(content, label)} data-testid={`btn-copy-${testId}`}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => downloadText(content, filename)} data-testid={`btn-download-${testId}`}>
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-border bg-card overflow-auto max-h-[580px]">
                <pre className="p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap" data-testid={`text-${testId}`}>{content}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveSettingsBadges() {
  const { tone, style, truthfulness } = usePreferences();
  const toneLabel = TONE_OPTIONS.find(o => o.value === tone)?.label ?? tone;
  const styleLabel = STYLE_OPTIONS.find(o => o.value === style)?.label ?? style;
  const truthLabel = TRUTHFULNESS_LEVELS[truthfulness].label;
  const truthColor = TRUTHFULNESS_LEVELS[truthfulness].color;

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
      <Settings className="w-3 h-3" />
      <span>Using:</span>
      <Badge variant="outline" className="text-[10px] border px-1.5 py-0">{toneLabel}</Badge>
      <Badge variant="outline" className="text-[10px] border px-1.5 py-0">{styleLabel}</Badge>
      <Badge variant="outline" className={cn("text-[10px] border px-1.5 py-0", truthColor)}>{truthLabel}</Badge>
    </div>
  );
}

function GeneratePanel({ onSuccess }: { onSuccess: () => void }) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tone, style, truthfulness } = usePreferences();
  const { data: jobs } = useListJobs();
  const createApp = useCreateApplication();

  const scrapedJobs = jobs?.filter((j) => j.status === "scraped") ?? [];

  const handleGenerate = () => {
    if (!selectedJobId) return;
    createApp.mutate(
      { data: { jobId: parseInt(selectedJobId, 10), tone, style, truthfulness } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
          toast({ title: "Generation started — this takes 20–40 seconds" });
          setSelectedJobId("");
          onSuccess();
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Failed to start generation";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  };

  if (scrapedJobs.length === 0) return null;

  return (
    <Card className="border-border mb-4 bg-accent/30">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Wand2 className="w-4 h-4 text-primary flex-shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Generate tailored application</p>
            <div className="mt-1">
              <ActiveSettingsBadges />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-52" data-testid="select-job-generate">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {scrapedJobs.map((job) => (
                  <SelectItem key={job.id} value={String(job.id)}>
                    {job.title ?? job.company ?? new URL(job.url).hostname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!selectedJobId || createApp.isPending}
              onClick={handleGenerate}
              data-testid="btn-generate-app"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              {createApp.isPending ? "Starting..." : "Generate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Applications() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: applications, isLoading, refetch } = useListApplications();
  const deleteApp = useDeleteApplication();

  if (selectedId !== null) {
    return <ApplicationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const hasPending = applications?.some((a) => a.status === "generating");

  const handleDelete = (id: number) => {
    deleteApp.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        toast({ title: "Application deleted" });
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated resumes and cover letters for each job.</p>
        </div>
        {hasPending && (
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="btn-refresh-apps">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        )}
      </div>

      <GeneratePanel onSuccess={() => {}} />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && applications && applications.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No applications yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload documents, add jobs, then generate above.
          </p>
        </div>
      )}

      {!isLoading && applications && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => {
            const status = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.generating;
            const StatusIcon = status.icon;
            return (
              <Card
                key={app.id}
                className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                data-testid={`card-app-${app.id}`}
                onClick={() => setSelectedId(app.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground" data-testid={`text-app-title-${app.id}`}>
                          {app.jobTitle ?? "Application"}
                        </p>
                        {app.jobCompany && <span className="text-xs text-muted-foreground">{app.jobCompany}</span>}
                        <Badge className={cn("text-xs border flex items-center gap-1", status.className)} variant="outline">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {app.status === "done" && " · Click to view resume & cover letter"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                      disabled={deleteApp.isPending}
                      data-testid={`btn-delete-app-${app.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
