import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { ApiKeyWarning } from "@/components/ApiKeyWarning";
import { FileProvider } from "@/contexts/FileContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

import MergePdf from "@/pages/tools/MergePdf";
import SplitPdf from "@/pages/tools/SplitPdf";
import CompressPdf from "@/pages/tools/CompressPdf";
import ProtectPdf from "@/pages/tools/ProtectPdf";
import UnlockPdf from "@/pages/tools/UnlockPdf";
import PdfToJpg from "@/pages/tools/PdfToJpg";
import JpgToPdf from "@/pages/tools/JpgToPdf";
import WordToPdf from "@/pages/tools/WordToPdf";
import PdfToWord from "@/pages/tools/PdfToWord";
import ExtractPages from "@/pages/tools/ExtractPages";
import DeletePages from "@/pages/tools/DeletePages";
import RotatePdf from "@/pages/tools/RotatePdf";
import RearrangePages from "@/pages/tools/RearrangePages";
import PageNumbers from "@/pages/tools/PageNumbers";
import WatermarkPdf from "@/pages/tools/WatermarkPdf";
import ResizeImage from "@/pages/tools/ResizeImage";
import CompressImage from "@/pages/tools/CompressImage";
import ConvertImage from "@/pages/tools/ConvertImage";
import ZipFiles from "@/pages/tools/ZipFiles";
import UnzipFiles from "@/pages/tools/UnzipFiles";

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

        <Route path="/tools/merge-pdf">
          <Layout><MergePdf /></Layout>
        </Route>
        <Route path="/tools/split-pdf">
          <Layout><SplitPdf /></Layout>
        </Route>
        <Route path="/tools/compress-pdf">
          <Layout><CompressPdf /></Layout>
        </Route>
        <Route path="/tools/protect-pdf">
          <Layout><ProtectPdf /></Layout>
        </Route>
        <Route path="/tools/unlock-pdf">
          <Layout><UnlockPdf /></Layout>
        </Route>
        <Route path="/tools/pdf-to-jpg">
          <Layout><PdfToJpg /></Layout>
        </Route>
        <Route path="/tools/jpg-to-pdf">
          <Layout><JpgToPdf /></Layout>
        </Route>
        <Route path="/tools/word-to-pdf">
          <Layout><WordToPdf /></Layout>
        </Route>
        <Route path="/tools/pdf-to-word">
          <Layout><PdfToWord /></Layout>
        </Route>
        <Route path="/tools/extract-pages">
          <Layout><ExtractPages /></Layout>
        </Route>
        <Route path="/tools/delete-pages">
          <Layout><DeletePages /></Layout>
        </Route>
        <Route path="/tools/rotate-pdf">
          <Layout><RotatePdf /></Layout>
        </Route>
        <Route path="/tools/rearrange-pages">
          <Layout><RearrangePages /></Layout>
        </Route>
        <Route path="/tools/page-numbers">
          <Layout><PageNumbers /></Layout>
        </Route>
        <Route path="/tools/watermark-pdf">
          <Layout><WatermarkPdf /></Layout>
        </Route>
        <Route path="/tools/resize-image">
          <Layout><ResizeImage /></Layout>
        </Route>
        <Route path="/tools/compress-image">
          <Layout><CompressImage /></Layout>
        </Route>
        <Route path="/tools/convert-image">
          <Layout><ConvertImage /></Layout>
        </Route>
        <Route path="/tools/zip-files">
          <Layout><ZipFiles /></Layout>
        </Route>
        <Route path="/tools/unzip-files">
          <Layout><UnzipFiles /></Layout>
        </Route>

        <Route>
          <Layout><NotFound /></Layout>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FileProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
            <ApiKeyWarning />
          </TooltipProvider>
        </FileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
