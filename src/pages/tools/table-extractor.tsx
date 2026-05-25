import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { AIProcessing } from "@/components/AIProcessing";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function TableExtractor() {
  const { key, hasKey } = useApiKey();
  const [status, setStatus] = useState<"idle" | "extracting" | "done" | "error">("idle");
  const [resultCsv, setResultCsv] = useState("");

  const handleProcess = async (f: File) => {
    if (!hasKey) return;
    setStatus("extracting");
    try {
      const text = await extractPdfText(f);
      const csvData = await openaiChat(key, [
        { role: "system", content: "Extract all tables from the text and format them as CSV. Return ONLY raw CSV data, no markdown blocks or extra text." },
        { role: "user", content: text.substring(0, 20000) }
      ]);
      setResultCsv(csvData);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const rows = resultCsv.split('\n').map(r => r.split(','));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Tables");
    XLSX.writeFile(wb, "extracted_tables.xlsx");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Table <span className="text-gradient">Extractor</span></h1>
        <p className="text-muted-foreground">Pull structured data out of flat documents.</p>
      </header>
      {status === "idle" && <FileDropZone onFileSelect={handleProcess} accept="application/pdf" />}
      {status === "extracting" && <AIProcessing status="Extracting tables..." />}
      {status === "done" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">CSV Result</h2>
            <Button onClick={handleDownload}>Download Excel</Button>
          </div>
          <pre className="glass p-4 rounded-lg overflow-x-auto text-xs">{resultCsv}</pre>
        </div>
      )}
    </motion.div>
  );
}
