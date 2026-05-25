import { useState } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export default function Convert() {
  const [files, setFiles] = useState<File[]>([]);

  const handleProcess = (f: File) => {
    setFiles(prev => [...prev, f]);
  };

  const handleConvertImagesToPdf = async () => {
    if (files.length === 0) return;
    const doc = new jsPDF();
    
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith("image/")) continue;
      
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.src = url;
      
      await new Promise(resolve => {
        img.onload = () => {
          if (i > 0) doc.addPage();
          // Scale to fit A4 roughly
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
          doc.addImage(img, 'JPEG', 0, 0, img.width * ratio, img.height * ratio);
          resolve(true);
        };
      });
    }
    
    doc.save("converted_images.pdf");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Convert & <span className="bg-clip-text text-transparent gradient-violet-cyan">Merge</span></h1>
        <p className="text-muted-foreground">Convert images to PDF locally.</p>
      </header>

      <div className="mb-8">
        <FileDropZone onFileSelect={handleProcess} accept="image/*" title="Drop images to convert to PDF" />
      </div>

      {files.length > 0 && (
        <div className="glass p-6 rounded-xl border border-border/50">
          <h2 className="text-lg font-semibold mb-4">Selected Files</h2>
          <ul className="space-y-2 mb-6">
            {files.map((f, i) => (
              <li key={i} className="text-sm bg-background/50 px-3 py-2 rounded border border-border/50 flex justify-between">
                <span>{f.name}</span>
                <span className="text-muted-foreground">{(f.size/1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => setFiles([])}>Clear</Button>
             <Button onClick={handleConvertImagesToPdf}>Generate PDF</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
