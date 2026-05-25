import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LANGUAGES = ["Hindi", "Marathi", "Tamil", "Kannada", "French", "Spanish", "German", "Japanese"];

export default function Translate() {
  const { key, hasKey } = useApiKey();
  const [status, setStatus] = useState<"idle" | "translating" | "done" | "error">("idle");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [result, setResult] = useState("");

  const handleProcess = async (f: File) => {
    if (!hasKey) return;
    setStatus("translating");
    setResult("");
    try {
      const text = await extractPdfText(f);
      await openaiChat(
        key,
        [
          { role: "system", content: `You are a professional translator. Translate the text to ${targetLang}. Preserve formatting and paragraphs. Do not add conversational filler.` },
          { role: "user", content: text.substring(0, 15000) }
        ],
        (chunk) => setResult(prev => prev + chunk)
      );
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `translated_${targetLang}.txt`;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">AI <span className="bg-clip-text text-transparent gradient-violet-cyan">Translation</span></h1>
          <p className="text-muted-foreground">Translate documents accurately preserving context.</p>
        </div>
        <div className="w-48">
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger><SelectValue placeholder="Target Language" /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" />}
      {(status === "translating" || status === "done") && (
        <div className="space-y-6">
          <AIProcessing status={status === "translating" ? `Translating to ${targetLang}...` : "Translation Complete"} streamingText={result} />
          {status === "done" && (
            <div className="flex justify-center gap-4">
               <Button onClick={() => setStatus("idle")} variant="outline">Translate Another</Button>
               <Button onClick={downloadTxt}>Download .txt</Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
