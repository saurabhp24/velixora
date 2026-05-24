import { Link } from "wouter";
import { ToolDefinition } from "../lib/tools";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: ToolDefinition;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      <Link href={tool.href} className="block h-full">
        <div className="h-full glass-panel rounded-xl p-6 transition-all duration-300 hover:bg-white/5 border border-border/50 hover:border-border group-hover:glow-primary relative overflow-hidden flex flex-col">
          
          <div 
            className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ backgroundColor: tool.color }}
          />

          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
            >
              <Icon className="w-6 h-6" />
            </div>
            {tool.trending && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Hot
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2 flex-grow-0 group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          
          <p className="text-sm text-muted-foreground flex-grow">
            {tool.description}
          </p>

          <div className="mt-4 flex items-center text-xs font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: tool.color }}>
            Use Tool <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
