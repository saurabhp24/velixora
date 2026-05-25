import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  delay?: number;
}

export function ToolCard({ title, description, icon: Icon, href, delay = 0 }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="group relative"
      data-testid={`tool-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur" />
      <div className="relative h-full glass rounded-xl border border-border/50 p-6 flex flex-col items-start hover:border-primary/30 transition-colors">
        <div className="w-12 h-12 rounded-lg gradient-violet-cyan p-0.5 mb-4">
          <div className="w-full h-full bg-background/90 rounded-[6px] flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-foreground font-sans tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 flex-1">
          {description}
        </p>
        
        <Link href={href} className="mt-auto w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 h-9 px-4 py-2 group-hover:text-primary">
          Open Tool
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
