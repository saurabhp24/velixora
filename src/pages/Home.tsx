import { motion } from "framer-motion";
import { getToolsByCategory, getTrendingTools } from "../lib/tools";
import { ToolCard } from "../components/ToolCard";
import { UploadZone } from "../components/tools/UploadZone";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { useFileContext } from "../contexts/FileContext";
import { useLocation } from "wouter";
import { Shield, Zap, Gift, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../components/ui/input";

export default function Home() {
  const { setPendingFiles } = useFileContext();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGlobalUpload = (files: File[]) => {
    setPendingFiles(files);
    
    // Simple routing logic based on file type
    const file = files[0];
    if (files.length > 1) {
      if (files.every(f => f.type === 'application/pdf')) setLocation('/tools/merge-pdf');
      else if (files.every(f => f.type.startsWith('image/'))) setLocation('/tools/jpg-to-pdf');
      else setLocation('/tools/zip-files');
    } else {
      if (file.type === 'application/pdf') setLocation('/tools/split-pdf'); // default pdf action
      else if (file.type.startsWith('image/')) setLocation('/tools/compress-image');
      else if (file.type.includes('zip') || file.type.includes('compressed')) setLocation('/tools/unzip-files');
      else if (file.type.includes('word')) setLocation('/tools/word-to-pdf');
    }
  };

  const trendingTools = getTrendingTools();
  const pdfTools = getToolsByCategory('pdf');
  const imageTools = getToolsByCategory('image');
  const archiveTools = getToolsByCategory('archive');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              100% Free & Client-Side Processing
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
              <span className="text-gradient">Velixora</span>
            </h1>

            <p className="text-2xl md:text-3xl font-semibold text-foreground/70 mb-6 tracking-wide">
              Smart Conversion Universe
            </p>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              Process PDFs, images, and archives entirely in your browser. Zero server uploads. Absolute privacy. Infinite speed.
            </p>

            <div className="relative max-w-3xl mx-auto h-24 mb-16">
              <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pl-4 pointer-events-none z-10 text-muted-foreground">
                <Search className="w-6 h-6" />
              </div>
              <Input 
                className="w-full h-16 pl-14 pr-6 text-lg rounded-2xl bg-background/50 backdrop-blur-xl border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 shadow-2xl transition-all"
                placeholder="Search tools (e.g., 'merge pdf', 'compress image')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <UploadZone onFilesAccepted={handleGlobalUpload} className="h-64 shadow-[0_0_50px_rgba(79,110,247,0.1)]" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-background/50 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/40">
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <AnimatedCounter value={10} suffix="M+" className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight" />
              <p className="text-muted-foreground font-medium mt-2">Files Processed</p>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <AnimatedCounter value={50} suffix="+" className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight" />
              <p className="text-muted-foreground font-medium mt-2">Tools Available</p>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">100%</div>
              <p className="text-muted-foreground font-medium mt-2">Free & Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grids */}
      <section className="py-24 container mx-auto px-4" id="trending">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Trending Tools</h2>
          <p className="text-muted-foreground">The most popular tools used by our community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      <section className="py-24 container mx-auto px-4" id="pdf-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">PDF Tools</h2>
            <p className="text-muted-foreground">Everything you need to manipulate PDFs.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pdfTools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      <section className="py-24 container mx-auto px-4 bg-background/30" id="image-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Image Tools</h2>
            <p className="text-muted-foreground">Compress, resize, and convert images instantly.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {imageTools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      <section className="py-24 container mx-auto px-4" id="archive-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Archive Tools</h2>
            <p className="text-muted-foreground">Zip and unzip files without leaving the browser.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archiveTools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>
      
      {/* Features */}
      <section className="py-24 border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Why Velixora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 text-left">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Absolute Privacy</h3>
              <p className="text-muted-foreground">Files never leave your device. All processing happens right inside your browser memory using WebAssembly.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Blazing Fast</h3>
              <p className="text-muted-foreground">No upload or download wait times. Processing begins instantly utilizing your local hardware power.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Forever</h3>
              <p className="text-muted-foreground">No hidden fees, no paywalls, no file size limits. A premium toolkit made accessible to everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 container mx-auto px-4" id="how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Process your files in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/50 border-t border-dashed border-primary/30 -z-10" />
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold mb-6 glow-primary">1</div>
            <h3 className="text-xl font-bold mb-3">Upload</h3>
            <p className="text-muted-foreground">Drag and drop your files into any tool. We support PDFs, images, and archives.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold mb-6 glow-primary">2</div>
            <h3 className="text-xl font-bold mb-3">Process</h3>
            <p className="text-muted-foreground">Configure your settings and hit process. Everything happens instantly in your browser.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold mb-6 glow-primary">3</div>
            <h3 className="text-xl font-bold mb-3">Download</h3>
            <p className="text-muted-foreground">Get your processed files immediately. No wait times, no email required.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background/30" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about Velixora.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Is Velixora really free?", a: "Yes, 100% free. No hidden fees, no subscriptions, and no limits on file sizes or processing counts." },
              { q: "Are my files secure?", a: "Absolutely. We use WebAssembly to process all your files directly in your web browser. Your files are never uploaded to any server. When you close the tab, everything is gone." },
              { q: "What formats are supported?", a: "We support PDF manipulation, Word to PDF conversion, image formatting (JPG, PNG, WEBP), and ZIP archive creation/extraction." },
              { q: "Do I need to create an account?", a: "No account required. You can start using all tools immediately." }
            ].map((faq, i) => (
              <div key={i} className="glass-panel p-6 rounded-xl border border-border/50">
                <h3 className="text-lg font-bold mb-2 text-foreground">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
