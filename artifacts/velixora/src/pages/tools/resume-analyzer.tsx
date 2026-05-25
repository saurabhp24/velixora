import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { ScoreRing } from "@/components/ScoreRing";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";

export default function ResumeAnalyzer() {
  const { key, hasKey } = useApiKey();
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleProcess = async (f: File) => {
    if (!hasKey) return;
    setStatus("analyzing");
    try {
      const text = await extractPdfText(f);
      const res = await openaiChat(
        key,
        [
          { role: "system", content: "Analyze this resume. Return a JSON object ONLY with exactly these keys: 'score' (number 0-100), 'strengths' (array of strings), 'weaknesses' (array of strings), 'keywords' (array of strings)." },
          { role: "user", content: text.substring(0, 15000) }
        ]
      );
      // clean backticks if present
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '');
      setAnalysis(JSON.parse(cleanJson));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Resume <span className="bg-clip-text text-transparent gradient-violet-cyan">Analyzer</span></h1>
      </header>

      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" />}
      {status === "analyzing" && <AIProcessing status="Analyzing ATS compatibility..." />}
      {status === "done" && analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="col-span-1 flex flex-col items-center justify-center glass p-8 rounded-xl border border-border/50">
              <h3 className="mb-6 font-medium">ATS Score</h3>
              <ScoreRing score={analysis.score} />
           </div>
           <div className="col-span-2 space-y-6">
              <div className="glass p-6 rounded-xl border border-border/50">
                 <h3 className="font-semibold text-primary mb-3">Strengths</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm">{analysis.strengths?.map((s:string, i:number) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="glass p-6 rounded-xl border border-border/50">
                 <h3 className="font-semibold text-destructive mb-3">Areas to Improve</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm">{analysis.weaknesses?.map((s:string, i:number) => <li key={i}>{s}</li>)}</ul>
              </div>
              <div className="glass p-6 rounded-xl border border-border/50">
                 <h3 className="font-semibold text-cyan-400 mb-3">Suggested Keywords</h3>
                 <div className="flex flex-wrap gap-2">
                   {analysis.keywords?.map((k:string, i:number) => (
                     <span key={i} className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs">{k}</span>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
