import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { useApiKey } from "@/hooks/useApiKey";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";

export default function PdfSummarizer() {
  const { key, hasKey } = useApiKey();
  const { addFile } = useRecentFiles();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "extracting" | "summarizing" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleProcess = async (f: File) => {
    if (!hasKey) { setErrorMsg("Please connect your OpenAI API key in Settings first."); setStatus("error"); return; }
    setFile(f);
    setStatus("extracting");
    setResult("");
    addFile({ name: f.name, size: f.size, type: f.type, tool: "pdf-summarizer" });
    try {
      const text = await extractPdfText(f);
      setStatus("summarizing");
      await openaiChat(key, [
        { role: "system", content: "You are a professional document summarizer. Provide a concise summary, key points, and a chapter/section breakdown if applicable. Use markdown." },
        { role: "user", content: `Summarize this document:\n\n${text.substring(0, 30000)}` }
      ], (chunk) => { setResult(prev => prev + chunk); });
      setStatus("done");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to process PDF");
      setStatus("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">PDF <span className="text-gradient">Summarizer</span></h1>
        <p className="text-muted-foreground">Extract key insights from lengthy documents in seconds.</p>
      </header>
      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" title="Drop a PDF to summarize" />}
      {(status === "extracting" || status === "summarizing") && <AIProcessing status={status === "extracting" ? "Extracting text from PDF..." : "AI is writing the summary..."} streamingText={result} />}
      {status === "done" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Summary for {file?.name}</h2>
            <Button variant="outline" onClick={() => setStatus("idle")}>Summarize Another</Button>
          </div>
          <div className="glass rounded-xl p-8 border border-border/50">
            {result.split('\n').map((line, i) => line ? <p key={i} className="text-muted-foreground/90 mb-2">{line}</p> : <br key={i} />)}
          </div>
        </motion.div>
      )}
      {status === "error" && (
        <div className="text-center p-8 glass rounded-xl border border-destructive/50">
          <p className="text-destructive mb-4">{errorMsg}</p>
          <Button onClick={() => setStatus("idle")}>Try Again</Button>
        </div>
      )}
    </motion.div>
  );
}
