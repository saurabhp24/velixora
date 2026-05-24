import { Button } from "@/components/ui/button";
import { Download, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface DownloadResultProps {
  onDownload: () => void;
  onReset: () => void;
  filename: string;
  size?: number;
}

export function DownloadResult({ onDownload, onReset, filename, size }: DownloadResultProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full glass-panel border border-primary/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 glow-accent">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-2">Processing Complete!</h3>
      <p className="text-muted-foreground mb-6">Your file is ready to download.</p>
      
      <div className="bg-background/50 border border-border/50 rounded-lg py-3 px-6 mb-8 flex items-center gap-4">
        <span className="font-medium text-foreground truncate max-w-[200px]">{filename}</span>
        {size && (
          <span className="text-sm text-muted-foreground bg-white/5 px-2 py-1 rounded">
            {formatSize(size)}
          </span>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <Button 
          size="lg" 
          onClick={onDownload}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(79,110,247,0.3)] hover:shadow-[0_0_30px_rgba(79,110,247,0.5)] transition-all duration-300"
        >
          <Download className="w-5 h-5 mr-2" />
          Download File
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          onClick={onReset}
          className="w-full border-border/50 hover:bg-white/5"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Process Another
        </Button>
      </div>
    </motion.div>
  );
}
