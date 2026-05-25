import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { ApiKeyWarning } from "@/components/ApiKeyWarning";
import { useApiKey } from "@/hooks/useApiKey";

// Lazy load pages for now, or import directly
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";

import PdfSummarizer from "@/pages/tools/pdf-summarizer";
import ChatPdf from "@/pages/tools/chat-pdf";
import Ocr from "@/pages/tools/ocr";
import TableExtractor from "@/pages/tools/table-extractor";
import ResumeAnalyzer from "@/pages/tools/resume-analyzer";
import ContractAnalyzer from "@/pages/tools/contract-analyzer";
import Compress from "@/pages/tools/compress";
import Convert from "@/pages/tools/convert";
import PptGenerator from "@/pages/tools/ppt-generator";
import Translate from "@/pages/tools/translate";
import IndiaTools from "@/pages/tools/india";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        
        <Route path="/dashboard">
          <Layout><Dashboard /></Layout>
        </Route>
        <Route path="/settings">
          <Layout><Settings /></Layout>
        </Route>
        
        {/* Tools */}
        <Route path="/tools/pdf-summarizer">
          <Layout><PdfSummarizer /></Layout>
        </Route>
        <Route path="/tools/chat-pdf">
          <Layout><ChatPdf /></Layout>
        </Route>
        <Route path="/tools/ocr">
          <Layout><Ocr /></Layout>
        </Route>
        <Route path="/tools/table-extractor">
          <Layout><TableExtractor /></Layout>
        </Route>
        <Route path="/tools/resume-analyzer">
          <Layout><ResumeAnalyzer /></Layout>
        </Route>
        <Route path="/tools/contract-analyzer">
          <Layout><ContractAnalyzer /></Layout>
        </Route>
        <Route path="/tools/compress">
          <Layout><Compress /></Layout>
        </Route>
        <Route path="/tools/convert">
          <Layout><Convert /></Layout>
        </Route>
        <Route path="/tools/ppt-generator">
          <Layout><PptGenerator /></Layout>
        </Route>
        <Route path="/tools/translate">
          <Layout><Translate /></Layout>
        </Route>
        <Route path="/tools/india">
          <Layout><IndiaTools /></Layout>
        </Route>

        <Route>
          <Layout><NotFound /></Layout>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const [warningOpen, setWarningOpen] = useState(false);
  const { hasKey } = useApiKey();

  // Optionally could open warning globally if needed, but usually better handled contextually per page.

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <ApiKeyWarning open={warningOpen} onOpenChange={setWarningOpen} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
