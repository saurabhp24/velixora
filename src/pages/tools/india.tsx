import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  CreditCard, FileText, Camera, FileCheck, MessageSquare,
  BookOpen, Receipt, GraduationCap, Upload, Download, Loader2, CheckCircle2, ChevronRight
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

async function compressPdfToTarget(file: File, targetKB = 200): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const ab = await file.arrayBuffer();
  const pdf = await PDFDocument.load(ab);
  const bytes = await pdf.save({ useObjectStreams: true });
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

async function compressImageCanvas(file: File, maxW: number, maxH: number, quality: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });
  URL.revokeObjectURL(url);
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/jpeg", quality));
}

// ─── Tool definitions ─────────────────────────────────────────────────────────
const TOOLS = [
  { id: "aadhaar",   icon: CreditCard,    label: "Aadhaar Optimizer",      color: "#f59e0b", desc: "Compress Aadhaar PDF under 200 KB for government portals" },
  { id: "pan",       icon: FileText,      label: "PAN Card Compressor",     color: "#3b82f6", desc: "Compress PAN card image for online forms" },
  { id: "passport",  icon: Camera,        label: "Passport Photo Formatter", color: "#8b5cf6", desc: "Resize photos to 35×45 mm passport standard" },
  { id: "govt",      icon: FileCheck,     label: "Govt Form Enhancer",      color: "#10b981", desc: "Optimize government PDFs for upload portals" },
  { id: "whatsapp",  icon: MessageSquare, label: "WhatsApp PDF Optimizer",  color: "#22c55e", desc: "Compress PDF for easy WhatsApp sharing" },
  { id: "exam",      icon: BookOpen,      label: "Exam Document Scanner",   color: "#ec4899", desc: "Compress scanned exam documents for submission" },
  { id: "invoice",   icon: Receipt,       label: "Invoice Extractor",       color: "#f97316", desc: "Extract key data from invoice PDFs using AI" },
  { id: "college",   icon: GraduationCap, label: "Assignment Formatter",    color: "#06b6d4", desc: "Format college assignments, compress and export" },
];

// ─── Individual Tool Panels ───────────────────────────────────────────────────

function PdfCompressorTool({ toolId, targetKB, label }: { toolId: string; targetKB: number; label: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressPdfToTarget(file, targetKB);
      setResult({ blob, name: file.name.replace(".pdf", `-${toolId}-optimized.pdf`) });
      toast({ title: "Done!", description: `Optimized for ${label}.` });
    } catch { toast({ title: "Error", description: "Failed to optimize.", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); } }} />
      {!file ? (
        <button onClick={() => inputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 p-8 text-center transition-all hover:bg-white/3">
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Click to upload a PDF</p>
        </button>
      ) : result ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-400">Optimized successfully</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)} → {formatBytes(result.blob.size)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => saveAs(result.blob, result.name)}><Download className="w-4 h-4" /> Download</Button>
            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>Reset</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Change</button>
          </div>
          <Button className="w-full gap-2" onClick={process} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : `Optimize for ${label}`}
          </Button>
        </div>
      )}
    </div>
  );
}

function PassportPhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (!file) return;
    setBusy(true);
    try {
      // 35×45mm at 300dpi = 413×531px
      const blob = await compressImageCanvas(file, 413, 531, 0.95);
      setResult({ blob, url: URL.createObjectURL(blob) });
      toast({ title: "Done!", description: "Passport photo formatted to 35×45 mm." });
    } catch { toast({ title: "Error", description: "Failed to format.", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); } }} />
      {!file ? (
        <button onClick={() => inputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 p-8 text-center transition-all hover:bg-white/3">
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Upload your photo (JPG/PNG)</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Will be resized to 35×45 mm passport standard</p>
        </button>
      ) : result ? (
        <div className="space-y-3">
          <div className="flex gap-4 items-start">
            <img src={result.url} alt="passport" className="w-24 h-32 object-cover rounded-lg border-2 border-white/10" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle2 className="w-4 h-4" /> 35×45 mm formatted</div>
              <p className="text-xs text-muted-foreground">{formatBytes(result.blob.size)} • JPEG</p>
              <Button size="sm" onClick={() => saveAs(result.blob, "passport-photo.jpg")} className="gap-2 w-full"><Download className="w-3.5 h-3.5" /> Download</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => { setFile(null); setResult(null); if (result.url) URL.revokeObjectURL(result.url); }}>New Photo</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
          </div>
          <Button className="w-full gap-2" onClick={process} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Format Passport Photo"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PanCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(85);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressImageCanvas(file, 800, 600, quality / 100);
      setResult({ blob, url: URL.createObjectURL(blob) });
      toast({ title: "Done!", description: `PAN compressed to ${formatBytes(blob.size)}.` });
    } catch { toast({ title: "Error", description: "Failed.", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); } }} />
      {!file ? (
        <button onClick={() => inputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 p-8 text-center transition-all hover:bg-white/3">
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Upload PAN card image or PDF</p>
        </button>
      ) : result ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-400">Compressed successfully</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)} → {formatBytes(result.blob.size)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => saveAs(result.blob, `pan-compressed.${file.type.includes("pdf") ? "pdf" : "jpg"}`)}><Download className="w-4 h-4" /> Download</Button>
            <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>Reset</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quality</span><span className="font-bold text-primary">{quality}%</span></div>
            <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={40} max={100} step={5} />
          </div>
          <Button className="w-full" onClick={process} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Compressing...</> : "Compress PAN Card"}
          </Button>
        </div>
      )}
    </div>
  );
}

function InvoiceExtractorTool() {
  const { key, hasKey } = useApiKey();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const process = async () => {
    if (!file || !hasKey) return;
    setStatus("processing");
    try {
      const text = await extractPdfText(file);
      const raw = await openaiChat(key, [
        { role: "system", content: "Extract invoice data from this document. Return a JSON object with: 'invoiceNumber', 'date', 'vendor', 'totalAmount', 'currency', 'items' (array of {description, quantity, unitPrice, amount}), 'taxAmount', 'subtotal'. Return ONLY valid JSON." },
        { role: "user", content: text.substring(0, 10000) }
      ]);
      const data = JSON.parse(raw.replace(/```json/g, "").replace(/```/g, "").trim());
      setResult(data);
      setStatus("done");
    } catch {
      toast({ title: "Error", description: "Could not extract invoice data.", variant: "destructive" });
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setStatus("idle"); setResult(null); } }} />
      {status === "idle" && !file && (
        <button onClick={() => inputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 p-8 text-center transition-all hover:bg-white/3">
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Upload invoice PDF</p>
          {!hasKey && <p className="text-xs text-amber-400/70 mt-2">⚠ Requires OpenAI API key in Settings</p>}
        </button>
      )}
      {status === "idle" && file && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <button onClick={() => { setFile(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
          </div>
          <Button className="w-full" onClick={process} disabled={!hasKey}>
            {!hasKey ? "Connect OpenAI key first" : "Extract Invoice Data"}
          </Button>
        </div>
      )}
      {status === "processing" && (
        <div className="flex items-center gap-3 p-6 rounded-xl bg-white/5 border border-white/10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Extracting invoice data with AI...</span>
        </div>
      )}
      {status === "done" && result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Invoice #", result.invoiceNumber], ["Date", result.date], ["Vendor", result.vendor], ["Total", `${result.currency || "₹"} ${result.totalAmount}`]].map(([k, v]) => (
              <div key={k} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">{k}</p>
                <p className="font-medium truncate">{v || "—"}</p>
              </div>
            ))}
          </div>
          {result.items?.length > 0 && (
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <p className="text-xs text-muted-foreground px-3 py-2 border-b border-white/10">Line Items</p>
              {result.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 text-xs border-b border-white/5 last:border-0">
                  <span className="truncate flex-1 text-muted-foreground">{item.description}</span>
                  <span className="ml-3 font-medium">{item.amount}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => saveAs(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), "invoice-data.json")}><Download className="w-4 h-4" /> Export JSON</Button>
            <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); setResult(null); }}>New</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IndiaTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const active = TOOLS.find(t => t.id === activeTool);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-xs text-orange-400">
          🇮🇳 Made for India
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">India <span className="text-gradient">Micro Tools</span></h1>
        <p className="text-muted-foreground">Specialized tools built for Indian documents, government portals, and everyday use cases.</p>
      </header>

      {!activeTool ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.button key={tool.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTool(tool.id)}
                className="text-left p-5 rounded-2xl border border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-foreground transition-colors">{tool.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: tool.color }}>
                  Open tool <ChevronRight className="w-3 h-3" />
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTool} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to India Tools
            </button>
            <div className="flex items-center gap-4">
              {active && (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${active.color}15`, color: active.color }}>
                  {<active.icon className="w-6 h-6" />}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{active?.label}</h2>
                <p className="text-sm text-muted-foreground">{active?.desc}</p>
              </div>
            </div>
            <div className="glass rounded-2xl border border-border/50 p-6">
              {activeTool === "aadhaar" && <PdfCompressorTool toolId="aadhaar" targetKB={200} label="government portals" />}
              {activeTool === "pan" && <PanCompressorTool />}
              {activeTool === "passport" && <PassportPhotoTool />}
              {activeTool === "govt" && <PdfCompressorTool toolId="govt" targetKB={500} label="government upload" />}
              {activeTool === "whatsapp" && <PdfCompressorTool toolId="whatsapp" targetKB={5000} label="WhatsApp sharing" />}
              {activeTool === "exam" && <PdfCompressorTool toolId="exam" targetKB={300} label="exam submission" />}
              {activeTool === "invoice" && <InvoiceExtractorTool />}
              {activeTool === "college" && <PdfCompressorTool toolId="college" targetKB={1000} label="college submission" />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
