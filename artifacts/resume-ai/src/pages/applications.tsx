import { useState, useCallback } from "react";
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
  Zap, Square, CheckSquare, Loader2, Briefcase, FileDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { usePreferences, TRUTHFULNESS_LEVELS, TONE_OPTIONS, STYLE_OPTIONS } from "@/context/preferences";
import { cn } from "@/lib/utils";

const statusConfig = {
  generating: { label: "Generating...", icon: Clock, className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  done:       { label: "Ready",         icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed:     { label: "Failed",        icon: XCircle,     className: "bg-destructive/10 text-destructive border-destructive/20" },
};

type ExportLayout = "classic" | "modern" | "minimal";

const LAYOUTS: { value: ExportLayout; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Traditional serif, centered header, ruled sections" },
  { value: "modern",  label: "Modern",  description: "Blue accents, Calibri, bold section bars" },
  { value: "minimal", label: "Minimal", description: "Georgia serif, generous whitespace, subtle headers" },
];

/* ─── APPLICATION DETAIL ─────────────────────────────────────────── */
function ApplicationDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = usePreferences();
  const [exportingDoc, setExportingDoc] = useState<string | null>(null);

  const { data: app, isLoading, refetch } = useGetApplication(id, {
    query: { queryKey: getGetApplicationQueryKey(id) },
  });

  const copyToClipboard = (text: string, label: string) =>
    navigator.clipboard.writeText(text).then(() => toast({ title: `${label} copied to clipboard` }));

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDocx = async (docType: "resume" | "cover_letter", layout: ExportLayout) => {
    const key = `${docType}-${layout}`;
    setExportingDoc(key);
    try {
      const res = await fetch(`/api/applications/${id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout, docType, profile }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(err.error ?? "Export failed");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `${docType}-${layout}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Downloaded ${filename}` });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Export failed", variant: "destructive" });
    } finally {
      setExportingDoc(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-lg" /><Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!app) return null;

  const status = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.generating;
  const StatusIcon = status.icon;
  const safeJobTitle = (app.jobCompany ?? app.jobTitle ?? "job").replace(/[^a-zA-Z0-9\s]/g, "").trim();

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="btn-back-to-list">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate" data-testid="detail-title">{app.jobTitle ?? "Application"}</h1>
            {app.jobCompany && <span className="text-muted-foreground text-sm">— {app.jobCompany}</span>}
            <Badge className={cn("text-xs border flex items-center gap-1", status.className)} variant="outline">
              <StatusIcon className="w-3 h-3" />{status.label}
            </Badge>
          </div>
        </div>
        {app.status === "generating" && (
          <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: getGetApplicationQueryKey(id) }); refetch(); }} data-testid="btn-refresh-app">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
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
          {([
            { label: "Resume",       content: app.resume,      txtFile: `resume-${safeJobTitle}.txt`,       docType: "resume" as const,       testId: "resume" },
            { label: "Cover Letter", content: app.coverLetter, txtFile: `cover-letter-${safeJobTitle}.txt`, docType: "cover_letter" as const,  testId: "cover"  },
          ] as const).map(({ label, content, txtFile, docType, testId }) => (
            <div key={testId} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">{label}</h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyToClipboard(content, label)} data-testid={`btn-copy-${testId}`}>
                    <Copy className="w-3 h-3 mr-1" />Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => downloadText(content, txtFile)} data-testid={`btn-download-${testId}`}>
                    <Download className="w-3 h-3 mr-1" />.txt
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={exportingDoc !== null}
                        data-testid={`btn-export-docx-${testId}`}
                      >
                        {exportingDoc?.startsWith(docType) ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <FileDown className="w-3 h-3 mr-1" />
                        )}
                        .docx
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs font-semibold">Choose Layout</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {LAYOUTS.map(({ value, label: layoutLabel, description }) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => exportDocx(docType, value)}
                          className="flex flex-col items-start gap-0.5 cursor-pointer"
                          data-testid={`btn-export-${testId}-${value}`}
                        >
                          <span className="font-medium text-sm">{layoutLabel}</span>
                          <span className="text-xs text-muted-foreground">{description}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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

/* ─── ACTIVE SETTINGS BADGES ─────────────────────────────────────── */
function ActiveSettingsBadges() {
  const { tone, style, truthfulness } = usePreferences();
  const toneLabel  = TONE_OPTIONS.find(o => o.value === tone)?.label ?? tone;
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

/* ─── BATCH GENERATE PANEL ───────────────────────────────────────── */
type BatchStatus = "idle" | "running" | "done";

interface JobRow {
  id: number;
  title: string | null;
  company: string | null;
  url: string;
}

function BatchGeneratePanel({ onSuccess }: { onSuccess: () => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchStatus, setBatchStatus] = useState<BatchStatus>("idle");
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number }>({ done: 0, total: 0, failed: 0 });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tone, style, truthfulness } = usePreferences();
  const { data: jobs } = useListJobs();
  const { data: applications } = useListApplications();
  const createApp = useCreateApplication();

  const scrapedJobs: JobRow[] = (jobs ?? []).filter(j => j.status === "scraped");

  const activeJobIds = new Set((applications ?? [])
    .filter(a => a.status === "generating" || a.status === "done")
    .map(a => a.jobId));

  const availableJobs = scrapedJobs.filter(j => !activeJobIds.has(j.id));

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === availableJobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availableJobs.map(j => j.id)));
    }
  };

  const handleBatchGenerate = useCallback(async () => {
    const jobIds = Array.from(selected);
    if (jobIds.length === 0) return;

    setBatchStatus("running");
    setProgress({ done: 0, total: jobIds.length, failed: 0 });

    let done = 0;
    let failed = 0;

    await Promise.allSettled(
      jobIds.map(jobId =>
        new Promise<void>((resolve) => {
          createApp.mutate(
            { data: { jobId, tone, style, truthfulness } },
            {
              onSuccess: () => {
                done++;
                setProgress({ done, total: jobIds.length, failed });
                resolve();
              },
              onError: () => {
                failed++;
                done++;
                setProgress({ done, total: jobIds.length, failed });
                resolve();
              },
            }
          );
        })
      )
    );

    queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });

    const started = jobIds.length - failed;
    if (failed === 0) {
      toast({ title: `${started} agent${started !== 1 ? "s" : ""} launched — generating in parallel` });
    } else {
      toast({
        title: `${started} started, ${failed} failed`,
        variant: failed === jobIds.length ? "destructive" : "default",
      });
    }

    setBatchStatus("done");
    setSelected(new Set());
    onSuccess();

    setTimeout(() => setBatchStatus("idle"), 2000);
  }, [selected, tone, style, truthfulness, createApp, queryClient, toast, onSuccess]);

  if (scrapedJobs.length === 0) return null;

  const allSelected = availableJobs.length > 0 && selected.size === availableJobs.length;
  const someSelected = selected.size > 0;
  const isRunning = batchStatus === "running";

  return (
    <Card className="border-border mb-6">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Batch Generate
            {availableJobs.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                — {availableJobs.length} job{availableJobs.length !== 1 ? "s" : ""} ready
              </span>
            )}
          </CardTitle>
          <ActiveSettingsBadges />
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {availableJobs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            All scraped jobs already have applications. Add more jobs to generate additional applications.
          </p>
        ) : (
          <>
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 select-none"
              disabled={isRunning}
              data-testid="btn-select-all"
            >
              {allSelected
                ? <CheckSquare className="w-3.5 h-3.5 text-primary" />
                : <Square className="w-3.5 h-3.5" />
              }
              {allSelected ? "Deselect all" : `Select all (${availableJobs.length})`}
            </button>

            <div className="space-y-1.5 mb-4">
              {availableJobs.map((job) => {
                const isSelected = selected.has(job.id);
                const domain = (() => { try { return new URL(job.url).hostname.replace("www.", ""); } catch { return job.url || "manual"; } })();
                return (
                  <button
                    key={job.id}
                    onClick={() => toggle(job.id)}
                    disabled={isRunning}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all select-none",
                      isSelected
                        ? "border-primary bg-accent/60 text-foreground"
                        : "border-border hover:border-primary/30 text-foreground"
                    )}
                    data-testid={`btn-select-job-${job.id}`}
                  >
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{job.title ?? domain}</span>
                      {job.company && (
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">{job.company}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:inline">{domain}</span>
                  </button>
                );
              })}
            </div>

            {isRunning && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Launching agents...</span>
                  <span>{progress.done} / {progress.total}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(progress.done / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!someSelected || isRunning}
              onClick={handleBatchGenerate}
              data-testid="btn-batch-generate"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Launching {progress.total} agent{progress.total !== 1 ? "s" : ""}...
                </>
              ) : batchStatus === "done" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Launched!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {someSelected
                    ? `Generate ${selected.size} Application${selected.size !== 1 ? "s" : ""} in Parallel`
                    : "Select jobs above"}
                </>
              )}
            </Button>

            {someSelected && !isRunning && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {selected.size} background agent{selected.size !== 1 ? "s" : ""} will run simultaneously — each takes ~30 seconds
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── APPLICATIONS LIST ──────────────────────────────────────────── */
export default function Applications() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: applications, isLoading, refetch } = useListApplications();
  const deleteApp = useDeleteApplication();

  if (selectedId !== null) {
    return <ApplicationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const hasPending = applications?.some(a => a.status === "generating");

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
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
          </Button>
        )}
      </div>

      <BatchGeneratePanel onSuccess={() => queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() })} />

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && applications && applications.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No applications yet</p>
          <p className="text-xs text-muted-foreground mt-1">Select jobs above and hit Generate to get started.</p>
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
                        <p className="text-sm font-semibold text-foreground" data-testid={`text-app-title-${app.id}`}>{app.jobTitle ?? "Application"}</p>
                        {app.jobCompany && <span className="text-xs text-muted-foreground">{app.jobCompany}</span>}
                        <Badge className={cn("text-xs border flex items-center gap-1", status.className)} variant="outline">
                          <StatusIcon className="w-3 h-3" />{status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {app.status === "done" && " · Click to view resume & cover letter"}
                        {app.status === "generating" && " · Generating in background"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={e => { e.stopPropagation(); handleDelete(app.id); }}
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
