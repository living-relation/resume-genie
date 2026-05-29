import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDocuments,
  getListDocumentsQueryKey,
  useDeleteDocument,
} from "@workspace/api-client-react";
import { FileText, Trash2, Upload, Eye, EyeOff, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const typeLabels: Record<string, string> = {
  resume: "Resume",
  cover_letter: "Cover Letter",
  portfolio: "Portfolio",
  other: "Other",
};

const typeColors: Record<string, string> = {
  resume: "bg-primary/10 text-primary border-primary/20",
  cover_letter: "bg-green-500/10 text-green-600 border-green-500/20",
  portfolio: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

function DocumentRow({ doc }: { doc: { id: number; name: string; type: string; content: string; createdAt: string } }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteDoc = useDeleteDocument();

  const handleDelete = async () => {
    setDeleting(true);
    deleteDoc.mutate({ id: doc.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast({ title: "Document deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete", variant: "destructive" });
        setDeleting(false);
      },
    });
  };

  return (
    <Card className="border-border" data-testid={`card-document-${doc.id}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-doc-name-${doc.id}`}>{doc.name}</p>
              <Badge className={`text-xs border ${typeColors[doc.type] ?? typeColors.other}`} variant="outline">
                {typeLabels[doc.type] ?? doc.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <span className="text-muted-foreground/40 mx-1">·</span>
              <p className="text-xs text-muted-foreground">{doc.content.length.toLocaleString()} chars</p>
            </div>
            {expanded && (
              <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">{doc.content}</pre>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              data-testid={`btn-toggle-doc-${doc.id}`}
            >
              {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-testid={`btn-delete-doc-${doc.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteDoc = useDeleteDocument();
  const [clearing, setClearing] = useState(false);

  const hasDocuments = !!documents && documents.length > 0;

  const handleClearAll = async () => {
    if (!documents || clearing) return;
    setClearing(true);
    const results = await Promise.allSettled(
      documents.map((doc) => deleteDoc.mutateAsync({ id: doc.id }))
    );
    await queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast({ title: "All documents cleared" });
    } else {
      toast({
        title: `Couldn't delete ${failed} document${failed === 1 ? "" : "s"}`,
        variant: "destructive",
      });
    }
    setClearing(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">My Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your uploaded resumes, cover letters, and portfolio items.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasDocuments && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={clearing}
                  data-testid="btn-clear-documents"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  {clearing ? "Clearing..." : "Clear All"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all documents?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {documents!.length} uploaded document{documents!.length === 1 ? "" : "s"} (resumes, cover letters, and portfolio items). This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="btn-confirm-clear-documents"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link href="/upload">
            <Button size="sm" data-testid="btn-upload-new">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload New
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && documents && documents.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Upload your resume or cover letter to get started.</p>
          <Link href="/upload">
            <Button size="sm" data-testid="btn-upload-first">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Document
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
