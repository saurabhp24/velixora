import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { type ToolDefinition } from "@/lib/tools";

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
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative"
      data-testid={`tool-card-${tool.id}`}
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur"
        style={{ background: `linear-gradient(135deg, ${tool.color}, transparent)` }}
      />
      <div className="relative h-full glass rounded-xl border border-border/50 p-6 flex flex-col items-start hover:border-white/20 transition-colors">
        <div
          className="w-12 h-12 rounded-lg p-0.5 mb-4"
          style={{ background: `${tool.color}20` }}
        >
          <div className="w-full h-full rounded-[6px] flex items-center justify-center" style={{ color: tool.color }}>
            <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-foreground font-sans tracking-tight">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 flex-1">
          {tool.description}
        </p>

        <Link
          href={tool.href}
          className="mt-auto w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 h-9 px-4 py-2"
          style={{ color: tool.color }}
        >
          Open Tool
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
