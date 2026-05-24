import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FileProvider } from "./contexts/FileContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/not-found";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Lenis from '@studio-freight/lenis';

import MergePdf from "./pages/tools/MergePdf";
import SplitPdf from "./pages/tools/SplitPdf";
import CompressPdf from "./pages/tools/CompressPdf";
import RotatePdf from "./pages/tools/RotatePdf";
import DeletePages from "./pages/tools/DeletePages";
import RearrangePages from "./pages/tools/RearrangePages";
import ExtractPages from "./pages/tools/ExtractPages";
import ProtectPdf from "./pages/tools/ProtectPdf";
import UnlockPdf from "./pages/tools/UnlockPdf";
import WatermarkPdf from "./pages/tools/WatermarkPdf";
import PageNumbers from "./pages/tools/PageNumbers";
import CompressImage from "./pages/tools/CompressImage";
import ConvertImage from "./pages/tools/ConvertImage";
import ResizeImage from "./pages/tools/ResizeImage";
import ZipFiles from "./pages/tools/ZipFiles";
import UnzipFiles from "./pages/tools/UnzipFiles";
import JpgToPdf from "./pages/tools/JpgToPdf";
import PdfToJpg from "./pages/tools/PdfToJpg";
import WordToPdf from "./pages/tools/WordToPdf";
import PdfToWord from "./pages/tools/PdfToWord";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tools/merge-pdf" component={MergePdf} />
        <Route path="/tools/split-pdf" component={SplitPdf} />
        <Route path="/tools/compress-pdf" component={CompressPdf} />
        <Route path="/tools/rotate-pdf" component={RotatePdf} />
        <Route path="/tools/delete-pages" component={DeletePages} />
        <Route path="/tools/rearrange-pages" component={RearrangePages} />
        <Route path="/tools/extract-pages" component={ExtractPages} />
        <Route path="/tools/protect-pdf" component={ProtectPdf} />
        <Route path="/tools/unlock-pdf" component={UnlockPdf} />
        <Route path="/tools/watermark-pdf" component={WatermarkPdf} />
        <Route path="/tools/page-numbers" component={PageNumbers} />
        <Route path="/tools/compress-image" component={CompressImage} />
        <Route path="/tools/convert-image" component={ConvertImage} />
        <Route path="/tools/resize-image" component={ResizeImage} />
        <Route path="/tools/zip-files" component={ZipFiles} />
        <Route path="/tools/unzip-files" component={UnzipFiles} />
        <Route path="/tools/jpg-to-pdf" component={JpgToPdf} />
        <Route path="/tools/pdf-to-jpg" component={PdfToJpg} />
        <Route path="/tools/word-to-pdf" component={WordToPdf} />
        <Route path="/tools/pdf-to-word" component={PdfToWord} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FileProvider>
            <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-primary-foreground">
              {/* Background gradient effects */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-float-1" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-float-2" />
              </div>

              <WouterRouter>
                <Navbar />
                <main className="flex-grow flex flex-col">
                  <Router />
                </main>
                <Footer />
              </WouterRouter>
            </div>
            <Toaster />
          </FileProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
