import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { ShieldAlert, ShieldCheck, FileText } from "lucide-react";

export default function ContractAnalyzer() {
  const { key, hasKey } = useApiKey();
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleProcess = async (f: File) => {
    if (!hasKey) return;
    setStatus("analyzing");
    try {
      const text = await extractPdfText(f);
      const res = await openaiChat(key, [
        { role: "system", content: "Analyze this legal contract. Return a JSON object with strictly these keys: 'summary' (string), 'risks' (array of strings), 'keyClauses' (array of strings)." },
        { role: "user", content: text.substring(0, 15000) }
      ]);
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '');
      setAnalysis(JSON.parse(cleanJson));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Contract <span className="text-gradient">Analyzer</span></h1>
        <p className="text-muted-foreground">Instantly flag risks and extract key clauses from legal documents.</p>
      </header>
      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" />}
      {status === "analyzing" && <AIProcessing status="Analyzing legal text..." />}
      {status === "done" && analysis && (
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border border-border/50">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><FileText className="text-primary w-5 h-5" /> Summary</h2>
            <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-xl border border-destructive/20 bg-destructive/5">
              <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Potential Risks</h3>
              <ul className="space-y-3">{analysis.risks?.map((r: string, i: number) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-destructive mt-0.5">•</span>{r}</li>)}</ul>
            </div>
            <div className="glass p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Key Clauses</h3>
              <ul className="space-y-3">{analysis.keyClauses?.map((c: string, i: number) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{c}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
