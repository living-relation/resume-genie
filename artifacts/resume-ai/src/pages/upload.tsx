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
import { Upload, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/documents">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="btn-back">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Documents
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Upload Document</h1>
        <p className="text-muted-foreground mt-1 text-sm">Paste the content of your resume, cover letter, or other career document.</p>
      </div>

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        placeholder="Paste the full text content of your document here..."
                        className="min-h-64 font-mono text-xs resize-y"
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
                  {createDocument.isPending ? "Uploading..." : "Upload Document"}
                </Button>
                <Link href="/documents">
                  <Button type="button" variant="outline" data-testid="btn-cancel">Cancel</Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Copy and paste the plain text from your existing resume or cover letter. The more complete and detailed your documents, the better the AI can tailor your applications.
        </p>
      </div>
    </div>
  );
}
