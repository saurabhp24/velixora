import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorker } from "tesseract.js";

export default function Ocr() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const [progress, setProgress] = useState("");

  const handleProcess = async (f: File) => {
    setFile(f);
    setStatus("processing");
    setResult("");

    try {
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgress(`Recognizing: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      const { data: { text } } = await worker.recognize(f);
      setResult(text);
      await worker.terminate();
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Smart <span className="bg-clip-text text-transparent gradient-violet-cyan">OCR</span>
          </h1>
          <p className="text-muted-foreground">Extract text from images locally. Fully private — nothing leaves your device.</p>
        </div>
        <div className="w-48">
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger data-testid="select-language"><SelectValue placeholder="Select Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">English</SelectItem>
              <SelectItem value="hin">Hindi</SelectItem>
              <SelectItem value="mar">Marathi</SelectItem>
              <SelectItem value="tam">Tamil</SelectItem>
              <SelectItem value="kan">Kannada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {status === "idle" && (
        <FileDropZone onFileSelect={handleProcess} accept="image/*" title="Drop an image to extract text" />
      )}

      {status === "processing" && (
        <AIProcessing status={progress || "Initializing OCR Engine..."} />
      )}

      {status === "error" && (
        <div className="glass rounded-xl p-6 border border-destructive/50 text-center">
          <p className="text-destructive mb-4">OCR processing failed. Please try again.</p>
          <Button onClick={() => setStatus("idle")} data-testid="button-retry">Try Again</Button>
        </div>
      )}

      {status === "done" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Extracted Text</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(result)}
                data-testid="button-copy"
              >
                Copy Text
              </Button>
              <Button
                onClick={() => {
                  const blob = new Blob([result], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${file?.name ?? "ocr-result"}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                data-testid="button-download"
              >
                Download .txt
              </Button>
              <Button variant="ghost" onClick={() => { setStatus("idle"); setFile(null); }} data-testid="button-reset">
                Extract Another
              </Button>
            </div>
          </div>
          <div className="glass rounded-xl p-6 border border-border/50 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result}</pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
