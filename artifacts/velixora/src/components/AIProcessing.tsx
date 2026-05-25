import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AIProcessingProps {
  status?: string;
  streamingText?: string;
}

export function AIProcessing({ status = "Processing with AI...", streamingText }: AIProcessingProps) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center p-8" data-testid="ai-processing">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 0 0 rgba(124, 58, 237, 0)", 
            "0 0 60px rgba(124, 58, 237, 0.6)", 
            "0 0 0 rgba(124, 58, 237, 0)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full gradient-violet-cyan flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-1 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </motion.div>
      
      <h3 className="text-xl font-medium mb-6 bg-clip-text text-transparent gradient-violet-cyan font-sans">
        {status}
      </h3>

      {streamingText !== undefined && (
        <div className="w-full h-64 glass rounded-xl border border-border/50 p-6 overflow-y-auto font-mono text-sm leading-relaxed text-muted-foreground/90 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80 pointer-events-none group-hover:opacity-0 transition-opacity" />
          <div className="whitespace-pre-wrap">
            {streamingText}
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 ml-1 bg-primary align-middle"
            />
          </div>
        </div>
      )}
    </div>
  );
}
