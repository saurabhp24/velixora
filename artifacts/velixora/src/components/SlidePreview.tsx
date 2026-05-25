import { motion } from "framer-motion";

interface SlidePreviewProps {
  number: number;
  title: string;
  points: string[];
}

export function SlidePreview({ number, title, points }: SlidePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="glass p-6 rounded-xl border border-border/50 aspect-video flex flex-col relative overflow-hidden"
      data-testid={`slide-preview-${number}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="text-6xl font-bold font-serif">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-4 pr-8 bg-clip-text text-transparent gradient-violet-cyan">{title}</h3>
      <ul className="space-y-3 flex-1 overflow-hidden">
        {points.map((point, idx) => (
          <motion.li 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex items-start text-sm text-muted-foreground/90"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-3 shrink-0" />
            <span className="leading-relaxed">{point}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
