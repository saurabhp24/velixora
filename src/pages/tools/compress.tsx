import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function Compress() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = (f: File, q: number) => {
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => { if (blob) setCompressedBlob(blob); }, "image/jpeg", q / 100);
    };
  };

  const handleProcess = (f: File) => { setFile(f); processImage(f, quality); };
  const handleQualityChange = (vals: number[]) => { setQuality(vals[0]); if (file) processImage(file, vals[0]); };
  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(compressedBlob);
    link.download = `compressed_${file.name}`; link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Smart <span className="text-gradient">Compressor</span></h1>
        <p className="text-muted-foreground">Reduce image size locally using browser APIs.</p>
      </header>
      {!file && <FileDropZone onFileSelect={handleProcess} accept="image/jpeg, image/png" title="Drop an image to compress" />}
      {file && previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-xl border border-border/50">
            <img src={previewUrl} alt="Original" className="w-full h-auto rounded-lg mb-4" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold">Original</span>
              <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <div className="glass p-6 rounded-xl border border-border/50 flex flex-col justify-between">
            <div>
              <canvas ref={canvasRef} className="hidden" />
              {compressedBlob && <img src={URL.createObjectURL(compressedBlob)} alt="Compressed" className="w-full h-auto rounded-lg mb-4" />}
              <div className="flex justify-between items-center text-sm mb-8">
                <span className="font-semibold text-primary">Compressed</span>
                {compressedBlob && <span className="font-mono bg-primary/20 text-primary px-2 py-1 rounded">{(compressedBlob.size / 1024).toFixed(1)} KB <span className="text-xs ml-2 opacity-80">(-{Math.round((1 - compressedBlob.size / file.size) * 100)}%)</span></span>}
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">Quality: {quality}%</label>
                <Slider value={[quality]} onValueChange={handleQualityChange} max={100} step={1} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setFile(null)} variant="outline" className="flex-1">Reset</Button>
              <Button onClick={handleDownload} className="flex-1">Download</Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
