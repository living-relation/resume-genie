import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { PreferencesProvider } from "@/context/preferences";
import { ConsentProvider } from "@/context/consent";
import { ConsentBanner } from "@/components/ads/consent-banner";
import { AdSenseScript } from "@/components/ads/adsense-script";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import UploadDocument from "@/pages/upload";
import Jobs from "@/pages/jobs";
import AddJob from "@/pages/add-job";
import Applications from "@/pages/applications";
import Privacy from "@/pages/privacy";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/documents" component={Documents} />
        <Route path="/upload" component={UploadDocument} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/add-job" component={AddJob} />
        <Route path="/applications" component={Applications} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ConsentProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <ConsentBanner />
            <AdSenseScript />
            <Toaster />
          </ConsentProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PreferencesProvider>
  );
}

export default App;
