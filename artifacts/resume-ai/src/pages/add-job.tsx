import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ArrowLeft, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const schema = z
  .object({
    url: z.string().trim().optional().or(z.literal("")),
    title: z.string().trim().optional(),
    company: z.string().trim().optional(),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
  })
  .refine((v) => (v.url && v.url.length > 0) || (v.description && v.description.length > 0), {
    message: "Provide a URL or paste the job description below",
    path: ["url"],
  })
  .refine((v) => !v.url || /^https?:\/\/.+/i.test(v.url), {
    message: "Please enter a valid URL (or leave blank and paste below)",
    path: ["url"],
  });

type FormValues = z.infer<typeof schema>;

export default function AddJob() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createJob = useCreateJob();
  const [manualOpen, setManualOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: "", title: "", company: "", location: "", description: "" },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      url: values.url?.trim() || null,
      title: values.title?.trim() || null,
      company: values.company?.trim() || null,
      location: values.location?.trim() || null,
      description: values.description?.trim() || null,
    };
    createJob.mutate({ data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        toast({
          title: payload.description
            ? "Job added"
            : "Job added — scraping details now...",
        });
        setLocation("/jobs");
      },
      onError: () => {
        toast({ title: "Failed to add job. Check the URL or pasted description.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/jobs">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="btn-back">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Jobs
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">Add Job Listing</h1>
        <p className="text-muted-foreground mt-1 text-sm">Paste a URL and we'll fetch the details — or paste the description yourself if scraping fails.</p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Job Listing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL <span className="text-xs text-muted-foreground font-normal">(optional if you paste the description below)</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://jobs.company.com/role/senior-engineer"
                        {...field}
                        data-testid="input-job-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="button"
                onClick={() => setManualOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                data-testid="btn-toggle-manual"
              >
                {manualOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Paste the job description manually
              </button>

              {manualOpen && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground">
                    Use this if scraping fails (e.g. Indeed) or you copied the listing from somewhere else. If you paste a description here, we skip scraping.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Senior Engineer" {...field} data-testid="input-job-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Inc." {...field} data-testid="input-job-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Remote / San Francisco, CA" {...field} data-testid="input-job-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the full job description here..."
                            className="min-h-[200px] font-mono text-xs"
                            {...field}
                            data-testid="input-job-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={createJob.isPending}
                  className="flex-1"
                  data-testid="btn-submit-job"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  {createJob.isPending ? "Adding..." : "Add Job Listing"}
                </Button>
                <Link href="/jobs">
                  <Button type="button" variant="outline" data-testid="btn-cancel">Cancel</Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Auto-scraping works on LinkedIn, Greenhouse, Lever, Workday, and most company career pages. Indeed often blocks scrapers — for those, paste the description manually using the option above.
        </p>
      </div>
    </div>
  );
}
