import { AnimatePresence, motion } from "framer-motion";
import { getToolsByCategory, getTrendingTools, tools } from "../lib/tools";
import { ToolCard } from "../components/ToolCard";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { useFileContext } from "../contexts/FileContext";
import { useLocation } from "wouter";
import { Shield, Zap, Gift, ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState, type MouseEvent, type DragEvent } from "react";

export default function Home() {
  const { setPendingFiles, totalFilesProcessed, toolUsage } = useFileContext();
  const [, setLocation] = useLocation();
  const [faqIndex, setFaqIndex] = useState(0);
  const [orbOffset, setOrbOffset] = useState({ x: 0, y: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<File[] | null>(null);
  const [availableTools, setAvailableTools] = useState<typeof tools>([] as any);

  const handleGlobalUpload = (files: File[]) => {
    // stop automatic routing — ask user what to do
    setPendingFiles(files);
    setPickedFiles(files);
    // compute available tools by matching file types; if none, offer all tools
    const fileTypes = Array.from(new Set(files.map((f) => f.type)));
    const matched = tools.filter((t) => {
      try {
        if (!t.accept) return false;
        const accepts = t.accept.split(",").map((s) => s.trim());
        return accepts.some((a) => fileTypes.some((ft) => ft.includes(a.split("/")[1] || a) || ft === a || a === "*/*"));
      } catch (e) {
        return false;
      }
    });
    setAvailableTools(matched.length > 0 ? matched : tools.slice(0, 12));
    setShowPicker(true);
  };

  const trendingTools = getTrendingTools();
  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");
  const archiveTools = getToolsByCategory("archive");

  const totalUses = useMemo(
    () => Object.values(toolUsage).reduce((sum, value) => sum + value, 0),
    [toolUsage]
  );

  const [topToolId, topToolCount] = useMemo(() => {
    const ordered = Object.entries(toolUsage).sort((a, b) => b[1] - a[1]);
    return ordered[0] ?? [null, 0];
  }, [toolUsage]);

  const topTool = topToolId ? tools.find((tool) => tool.id === topToolId) : undefined;
  const topFeatureLabel = topTool ? topTool.name : "Live PDF Editing";
  const topFeaturePercent = totalUses ? Math.max(14, Math.round((topToolCount / totalUses) * 100)) : 22;

  const faqs = [
    {
      q: "Is Velixora really free?",
      a: "Yes. Velixora remains free to use, with no hidden charges for conversions or archive work.",
    },
    {
      q: "Can I edit PDFs directly in the browser?",
      a: "Yes. Velixora is designed as a browser-first AI workspace so you can open, adjust, and export PDFs without leaving the page.",
    },
    {
      q: "What makes this different from other converters?",
      a: "Velixora combines in-browser processing, AI workflow guidance, and a clean, minimal interface for non-technical users.",
    },
    {
      q: "Do my files leave my device?",
      a: "No. All file transformations happen locally in your browser, so your documents never go to external servers.",
    },
    {
      q: "Which file types are supported?",
      a: "PDFs, Word documents, JPG, PNG, WEBP, ZIP archives, and key conversion workflows are all supported.",
    },
    {
      q: "Is there a limit to how many tools I can use?",
      a: "No limits. Use any tool, any time, in the same session without restrictions.",
    },
    {
      q: "How do I start quickly?",
      a: "Drag a file into the upload zone, choose your workflow, and the AI workspace guides you through the rest.",
    },
  ];

  const activeFaq = faqs[faqIndex];
  const nextFaq = () => setFaqIndex((current) => (current + 1) % faqs.length);
  const prevFaq = () => setFaqIndex((current) => (current - 1 + faqs.length) % faqs.length);

  const moveOrb = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    setOrbOffset({ x: x * 0.05, y: y * 0.05 });
  };

  const handleNativeDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length > 0) handleGlobalUpload(list);
  };

  return (
    <div className="flex flex-col min-h-screen" onDragOver={(e) => e.preventDefault()} onDrop={handleNativeDrop}>
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.12),transparent_20%),radial-gradient(circle_at_right,_rgba(139,92,246,0.12),transparent_18%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                Convert, organize, and manage files with simple and Faster Workspace for everyday file.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                Transform PDFs, images, and archives with a premium glassmorphism interface that feels elegant, intuitive, and built for everyone.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                <div className="glass-panel rounded-3xl border border-border/50 p-5 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-3">Files processed</p>
                  <AnimatedCounter value={totalFilesProcessed} className="text-3xl font-bold text-foreground" />
                </div>
                <div className="glass-panel rounded-3xl border border-border/50 p-5 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-3">Tools online</p>
                  <AnimatedCounter value={tools.length} className="text-3xl font-bold text-foreground" />
                </div>
                <div className="glass-panel rounded-3xl border border-border/50 p-5 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-3">Top feature</p>
                  <p className="text-3xl font-bold text-foreground">{topFeaturePercent}%</p>
                  <p className="text-sm text-muted-foreground mt-1">{topFeatureLabel}</p>
                </div>
              </div>
            </motion.div>

            
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20" id="trending">
          <div className="grid gap-10 xl:grid-cols-[0.9fr_0.9fr] items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">AI-powered upload zone</p>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Upload, scan, and transform files in one fluid workspace.</h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">The upload zone responds to drag gestures and begins intelligent routing automatically. It’s designed to be obvious, fast, and cinematic.</p>
          </div>
          <div>
            <div className="relative h-80 rounded-2xl glass-panel flex items-center justify-center">
              <div className="text-center text-muted-foreground">Drop files anywhere on this page to begin — you'll be asked what to do next.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4">
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
      
      <section className="py-24 border-t border-border/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Why Velixora?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
            <div className="glass-panel rounded-3xl border border-border/50 p-8">
              <h3 className="text-xl font-bold mb-3">Live PDF Editing</h3>
              <p className="text-muted-foreground">Edit pages, annotate text, and preview changes instantly in the browser. No installs, no waiting.</p>
            </div>
            <div className="glass-panel rounded-3xl border border-border/50 p-8">
              <h3 className="text-xl font-bold mb-3">Instant AI Workflows</h3>
              <p className="text-muted-foreground">The AI workspace surfaces the right tool for the file type, so you can move from upload to export without friction.</p>
            </div>
            <div className="glass-panel rounded-3xl border border-border/50 p-8">
              <h3 className="text-xl font-bold mb-3">Local Browser Processing</h3>
              <p className="text-muted-foreground">Files stay on your device. Processing happens in the tab, preserving privacy while keeping performance snappy.</p>
            </div>
            <div className="glass-panel rounded-3xl border border-border/50 p-8">
              <h3 className="text-xl font-bold mb-3">One workspace for all files</h3>
              <p className="text-muted-foreground">PDFs, images, archives, and conversions live together in a clean, elegant interface designed for non-technical users.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4" id="how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Upload → Analyze → Transform → Export</h2>
          <p className="text-muted-foreground text-lg">A streamlined AI process tailored for fast file transformation and clear next steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 -z-10" />

          {[
            { label: "Upload", description: "Drop files into the workspace and let AI route them instantly.", color: "bg-primary/20 text-primary" },
            { label: "Analyze", description: "The system scans structure, content, and format to recommend the best workflow.", color: "bg-cyan-500/20 text-cyan-400" },
            { label: "Transform", description: "Apply compression, conversion, editing, or extraction with a single click.", color: "bg-accent/20 text-accent" },
            { label: "Export", description: "Download polished files immediately with no extra steps.", color: "bg-[#FF6B35]/20 text-[#FF6B35]" },
          ].map((step, index) => (
            <div key={index} className="glass-panel rounded-3xl border border-border/50 p-8 text-center">
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}>
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.label}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-background/30" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Swipe through the most important questions about Velixora.</p>
          </div>

          <div className="glass-panel rounded-[2rem] border border-border/50 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.35em] text-primary/80">AI FAQ</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={faqIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-semibold text-foreground">{activeFaq.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{activeFaq.a}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={prevFaq}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary transition hover:bg-primary/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {faqs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFaqIndex(index)}
                      className={`h-2.5 w-10 rounded-full transition ${index === faqIndex ? "bg-primary" : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextFaq}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary transition hover:bg-primary/10"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool picker modal shown after a drop */}
      {showPicker && pickedFiles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPicker(false)} />
          <div className="relative z-10 w-full max-w-2xl p-6">
            <div className="glass-panel p-6 rounded-2xl border border-border/50">
              <h3 className="text-xl font-semibold mb-4">Choose an action for the dropped file(s)</h3>
              <p className="text-sm text-muted-foreground mb-4">Select a tool to apply to your files.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableTools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setShowPicker(false); setLocation(t.href); }}
                    className="text-left p-3 rounded-lg border border-border/30 hover:bg-white/3 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">Go</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowPicker(false)} className="px-4 py-2 rounded-md border border-white/10">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
