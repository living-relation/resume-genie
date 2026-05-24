import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, FileText, Loader2, Linkedin, X } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function UploadDocument() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createDocument = useCreateDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "", content: "" },
  });

  const onSubmit = (values: FormValues) => {
    createDocument.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        toast({ title: "Document uploaded successfully" });
        setLocation("/documents");
      },
      onError: () => {
        toast({ title: "Failed to upload document", variant: "destructive" });
      },
    });
  };

  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  const handlePdfUpload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Please select a PDF, DOCX, or TXT file", variant: "destructive" });
      return;
    }
    setPdfLoading(true);
    setPdfFile(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/extract-pdf", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to extract text");
      }
      const data = await res.json() as { text: string; suggestedName: string };
      form.setValue("content", data.text, { shouldValidate: true });
      if (!form.getValues("name")) {
        form.setValue("name", data.suggestedName, { shouldValidate: true });
      }
      if (!form.getValues("type")) {
        form.setValue("type", "resume", { shouldValidate: true });
      }
      toast({ title: "PDF imported — review and save below" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to parse PDF", variant: "destructive" });
      setPdfFile(null);
    } finally {
      setPdfLoading(false);
    }
  };

  const clearPdf = () => {
    setPdfFile(null);
    form.setValue("content", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <Link href="/documents">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="btn-back">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Documents
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Upload Document</h1>
        <p className="text-muted-foreground mt-1 text-sm">Add your resume, cover letter, or other career document.</p>
      </div>

      {/* LinkedIn / PDF import banner */}
      <Card className="border-border mb-5 bg-accent/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0077b5]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Import from file</p>
              <p className="text-sm text-foreground mt-1">
                Accepts <strong className="text-primary">PDF</strong>, <strong className="text-primary">DOCX</strong>, and <strong className="text-primary">TXT</strong>
                <span className="text-muted-foreground"> — including LinkedIn's "Save to PDF" export.</span>
              </p>
              {pdfFile ? (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-400">
                    <FileText className="w-3 h-3" />{pdfFile}
                  </div>
                  <button onClick={clearPdf} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={pdfLoading}
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="btn-import-pdf"
                  >
                    {pdfLoading
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Extracting...</>
                      : <><FileText className="w-3 h-3 mr-1.5" />Upload</>
                    }
                  </Button>
                  <span className="text-xs text-muted-foreground">or paste text below</span>
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
            data-testid="input-pdf-file"
          />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Document Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Resume 2024, Software Engineer Cover Letter" {...field} data-testid="input-doc-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-doc-type">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="resume">Resume</SelectItem>
                        <SelectItem value="cover_letter">Cover Letter</SelectItem>
                        <SelectItem value="portfolio">Portfolio Item</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your document text here, or use the PDF import above..."
                        className={cn("min-h-64 font-mono text-xs resize-y", pdfFile && "border-green-500/40 bg-green-500/5")}
                        {...field}
                        data-testid="textarea-doc-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={createDocument.isPending}
                  className="flex-1"
                  data-testid="btn-submit-upload"
                >
                  {createDocument.isPending ? "Saving..." : "Save Document"}
                </Button>
                <Link href="/documents">
                  <Button type="button" variant="outline" data-testid="btn-cancel">Cancel</Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
