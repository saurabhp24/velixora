import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAs } from "file-saver";
import { Languages, Download, RotateCcw } from "lucide-react";

const LANGUAGES = [
  { value: "Hindi", label: "Hindi (हिन्दी)" },
  { value: "Marathi", label: "Marathi (मराठी)" },
  { value: "Tamil", label: "Tamil (தமிழ்)" },
  { value: "Telugu", label: "Telugu (తెలుగు)" },
  { value: "Kannada", label: "Kannada (ಕನ್ನಡ)" },
  { value: "Bengali", label: "Bengali (বাংলা)" },
  { value: "Gujarati", label: "Gujarati (ગુજરાતી)" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Japanese", label: "Japanese (日本語)" },
  { value: "Chinese (Simplified)", label: "Chinese Simplified (中文)" },
  { value: "Arabic", label: "Arabic (العربية)" },
  { value: "Portuguese", label: "Portuguese (Português)" },
];

export default function Translate() {
  const { key, hasKey } = useApiKey();
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState("Hindi");
  const [status, setStatus] = useState<"idle" | "extracting" | "translating" | "done" | "error">("idle");
  const [translatedText, setTranslatedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [streamingText, setStreamingText] = useState("");

  const handleProcess = async (f: File) => {
    if (!hasKey) {
      setErrorMsg("Please connect your OpenAI API key in Settings to use translation.");
      setStatus("error"); return;
    }
    setFile(f);
    setStatus("extracting");
    setTranslatedText("");
    setStreamingText("");
    try {
      const text = await extractPdfText(f);
      setStatus("translating");

      let accumulated = "";
      await openaiChat(key, [
        {
          role: "system",
          content: `You are a professional document translator. Translate the following document text to ${targetLang}. Preserve the document structure, headings, and formatting as much as possible. Output ONLY the translated text.`
        },
        { role: "user", content: text.substring(0, 25000) }
      ], (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      });

      setTranslatedText(accumulated);
      setStatus("done");
    } catch (e: any) {
      setErrorMsg(e.message || "Translation failed. Please try again.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!translatedText || !file) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${file.name.replace(".pdf", "")}-translated-${targetLang.toLowerCase()}.txt`);
  };

  const handleReset = () => {
    setFile(null); setStatus("idle"); setTranslatedText(""); setStreamingText(""); setErrorMsg("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI <span className="text-gradient">Translator</span></h1>
            <p className="text-muted-foreground">Translate any PDF document into 14+ languages using AI.</p>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass rounded-xl border border-border/50 p-5 flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Translate to</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FileDropZone onFileSelect={handleProcess} accept="application/pdf" title={`Drop a PDF to translate to ${targetLang}`} />
          </motion.div>
        )}

        {(status === "extracting" || status === "translating") && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AIProcessing
              status={status === "extracting" ? "Extracting text from PDF..." : `Translating to ${targetLang}...`}
              streamingText={streamingText}
            />
          </motion.div>
        )}

        {status === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Translation Complete</h2>
                <p className="text-sm text-muted-foreground">{file?.name} → {targetLang}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(translatedText)} className="gap-2">
                  Copy Text
                </Button>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" /> Download .txt
                </Button>
                <Button variant="ghost" onClick={handleReset} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> New
                </Button>
              </div>
            </div>
            <div className="glass rounded-xl border border-border/50 p-6 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">{translatedText}</pre>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
            <p className="text-destructive mb-6">{errorMsg}</p>
            <Button onClick={handleReset}>Try Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
