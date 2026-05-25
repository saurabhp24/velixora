import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { SlidePreview } from "@/components/SlidePreview";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";

export default function PptGenerator() {
  const { key, hasKey } = useApiKey();
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [slides, setSlides] = useState<{title: string, points: string[]}[]>([]);

  const handleProcess = async (f: File) => {
    if (!hasKey) return;
    setStatus("generating");
    try {
      const text = await extractPdfText(f);
      const res = await openaiChat(
        key,
        [
          { role: "system", content: "Create a presentation outline from this document. Return a JSON array of objects, each with 'title' (string) and 'points' (array of strings, max 4 short points per slide). Max 10 slides." },
          { role: "user", content: text.substring(0, 15000) }
        ]
      );
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '');
      setSlides(JSON.parse(cleanJson));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">AI PPT <span className="bg-clip-text text-transparent gradient-violet-cyan">Generator</span></h1>
        <p className="text-muted-foreground">Turn any document into a structured presentation outline.</p>
      </header>

      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" />}
      {status === "generating" && <AIProcessing status="Structuring presentation slides..." />}
      {status === "done" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((s, i) => (
            <SlidePreview key={i} number={i + 1} title={s.title} points={s.points} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
