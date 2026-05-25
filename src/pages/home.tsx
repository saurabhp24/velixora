import { AnimatePresence, motion } from "framer-motion";
import { getToolsByCategory, getTrendingTools, tools } from "../lib/tools";
import { ToolCard } from "../components/ToolCard";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { ParticleBackground } from "../components/ParticleBackground";
import { useFileContext } from "../contexts/FileContext";
import { useLocation } from "wouter";
import { Shield, Zap, Gift, ArrowLeft, ArrowRight, Brain, Upload, ChevronRight, Lock } from "lucide-react";
import { useMemo, useState, type DragEvent, useRef } from "react";

export default function Home() {
  const { setPendingFiles, totalFilesProcessed, toolUsage } = useFileContext();
  const [, setLocation] = useLocation();
  const [faqIndex, setFaqIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<File[] | null>(null);
  const [availableTools, setAvailableTools] = useState<typeof tools>([] as any);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGlobalUpload = (files: File[]) => {
    setPendingFiles(files);
    setPickedFiles(files);
    const fileTypes = Array.from(new Set(files.map((f) => f.type)));
    const matched = tools.filter((t) => {
      try {
        if (!t.accept) return false;
        const accepts = t.accept.split(",").map((s) => s.trim());
        return accepts.some((a) => fileTypes.some((ft) => ft.includes(a.split("/")[1] || a) || ft === a || a === "*/*"));
      } catch { return false; }
    });
    setAvailableTools(matched.length > 0 ? matched : tools.slice(0, 12));
    setShowPicker(true);
  };

  const trendingTools = getTrendingTools();
  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");
  const archiveTools = getToolsByCategory("archive");
  const aiTools = getToolsByCategory("ai");

  const totalUses = useMemo(() => Object.values(toolUsage).reduce((sum, value) => sum + value, 0), [toolUsage]);
  const [topToolId, topToolCount] = useMemo(() => {
    const ordered = Object.entries(toolUsage).sort((a, b) => b[1] - a[1]);
    return ordered[0] ?? [null, 0];
  }, [toolUsage]);

  const topTool = topToolId ? tools.find((tool) => tool.id === topToolId) : undefined;
  const topFeatureLabel = topTool ? topTool.name : "Live PDF Editing";
  const topFeaturePercent = totalUses ? Math.max(14, Math.round((topToolCount / totalUses) * 100)) : 22;

  const faqs = [
    { q: "Is Velixora really free?", a: "Yes. Velixora remains free to use, with no hidden charges for conversions or archive work." },
    { q: "Can I edit PDFs directly in the browser?", a: "Yes. Velixora is designed as a browser-first AI workspace so you can open, adjust, and export PDFs without leaving the page." },
    { q: "What makes this different from other converters?", a: "Velixora combines in-browser processing, AI workflow guidance, and a clean, minimal interface for non-technical users." },
    { q: "Do my files leave my device?", a: "No. All file transformations happen locally in your browser, so your documents never go to external servers." },
    { q: "Which file types are supported?", a: "PDFs, Word documents, JPG, PNG, WEBP, ZIP archives, and key conversion workflows are all supported." },
    { q: "Is there a limit to how many tools I can use?", a: "No limits. Use any tool, any time, in the same session without restrictions." },
    { q: "How do I start quickly?", a: "Drag a file into the upload zone, choose your workflow, and the AI workspace guides you through the rest." },
  ];

  const activeFaq = faqs[faqIndex];
  const nextFaq = () => setFaqIndex((c) => (c + 1) % faqs.length);
  const prevFaq = () => setFaqIndex((c) => (c - 1 + faqs.length) % faqs.length);

  const handleNativeDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length > 0) handleGlobalUpload(list);
  };

  return (
    <div className="flex flex-col min-h-screen" onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }} onDragLeave={() => setIsDraggingOver(false)} onDrop={handleNativeDrop}>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <ParticleBackground />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.18),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.10),transparent_40%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Native Document Intelligence Platform
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.02]">
              <span className="text-gradient">AI-Native</span>
              <br />
              <span className="text-foreground">Document</span>
              <br />
              <span className="text-foreground/70">Workspace</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Convert, analyze, summarize, and automate documents at lightning speed. Your files never leave your device.
            </motion.p>

            {/* Upload Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div
                className={`relative rounded-2xl border-2 border-dashed p-8 md:p-10 text-center cursor-pointer transition-all duration-300 mb-4 ${isDraggingOver ? "border-primary bg-primary/10 scale-[1.01]" : "border-white/15 hover:border-primary/50 bg-white/3 hover:bg-white/5"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleGlobalUpload(Array.from(e.target.files)); }} />
                {isDraggingOver ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-bounce">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-primary">Drop to analyze</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white/40" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground/70 mb-1">Drop any file to get started</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, JPG, PNG, ZIP — AI routes you to the right tool</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Upload className="w-4 h-4" /> Choose Files
                      </button>
                      <span className="text-xs text-muted-foreground">or drag & drop</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400/80">Your files never leave your device</span>
                <span className="text-muted-foreground/30">•</span>
                <span>100% browser-based processing</span>
                <span className="text-muted-foreground/30">•</span>
                <span>No upload to servers</span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="grid grid-cols-3 gap-4 mt-12 max-w-lg">
              <div className="glass-panel rounded-2xl border border-border/50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Processed</p>
                <AnimatedCounter value={totalFilesProcessed} className="text-2xl font-bold text-foreground" />
              </div>
              <div className="glass-panel rounded-2xl border border-border/50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Tools</p>
                <AnimatedCounter value={tools.length} className="text-2xl font-bold text-foreground" />
              </div>
              <div className="glass-panel rounded-2xl border border-border/50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Top tool</p>
                <p className="text-2xl font-bold text-foreground">{topFeaturePercent}%</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* AI Tools section */}
      <section className="py-24 container mx-auto px-4" id="ai-tools">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-400">
            <Brain className="w-3.5 h-3.5" /> Powered by OpenAI
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AI Intelligence Tools</h2>
          <p className="text-muted-foreground max-w-xl">Connect your OpenAI API key to unlock AI-powered document analysis, summarization, and more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {aiTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </section>

      {/* Trending */}
      <section className="py-24 container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Trending Tools</h2>
          <p className="text-muted-foreground">The most popular tools used by our community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </section>

      {/* PDF Tools */}
      <section className="py-24 container mx-auto px-4" id="pdf-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Shield className="w-6 h-6" /></div>
          <div><h2 className="text-3xl font-bold text-foreground">PDF Tools</h2><p className="text-muted-foreground">Everything you need to manipulate PDFs.</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pdfTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </section>

      {/* Image Tools */}
      <section className="py-24 container mx-auto px-4" id="image-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center"><Zap className="w-6 h-6" /></div>
          <div><h2 className="text-3xl font-bold text-foreground">Image Tools</h2><p className="text-muted-foreground">Compress, resize, and convert images instantly.</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {imageTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </section>

      {/* Archive Tools */}
      <section className="py-24 container mx-auto px-4" id="archive-tools">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center"><Gift className="w-6 h-6" /></div>
          <div><h2 className="text-3xl font-bold text-foreground">Archive Tools</h2><p className="text-muted-foreground">Zip and unzip files without leaving the browser.</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archiveTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 container mx-auto px-4" id="how-it-works">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Upload → Analyze → Transform → Export</h2>
          <p className="text-muted-foreground text-lg">A streamlined AI process tailored for fast file transformation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

      {/* Privacy Banner */}
      <section className="py-16 container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-transparent p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Privacy-First by Design</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Every file transformation happens entirely in your browser. No servers. No uploads. No data collection. Your documents stay on your device, always.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {["Zero server uploads", "Local processing only", "No data collection", "Offline capable", "Open source friendly"].map((item) => (
                <span key={item} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />{item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background/30" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="glass-panel rounded-[2rem] border border-border/50 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div key={faqIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                    <h3 className="text-2xl font-semibold text-foreground">{activeFaq.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{activeFaq.a}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between gap-4">
                <button onClick={prevFaq} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary transition hover:bg-primary/10">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {faqs.map((_, index) => (
                    <button key={index} onClick={() => setFaqIndex(index)} className={`h-2.5 w-10 rounded-full transition ${index === faqIndex ? "bg-primary" : "bg-white/10"}`} />
                  ))}
                </div>
                <button onClick={nextFaq} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary transition hover:bg-primary/10">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool picker modal */}
      {showPicker && pickedFiles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-2xl">
            <div className="glass-panel p-6 rounded-2xl border border-border/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Brain className="w-4 h-4 text-primary" /></div>
                <h3 className="text-xl font-semibold">Choose what to do with your file</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{pickedFiles.length} file{pickedFiles.length !== 1 ? "s" : ""} selected — {pickedFiles.map(f => f.name).join(", ").slice(0, 60)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {availableTools.map((t) => (
                  <button key={t.id} onClick={() => { setShowPicker(false); setLocation(t.href); }}
                    className="text-left p-4 rounded-xl border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{t.name}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowPicker(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
