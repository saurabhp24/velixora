import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ToolDefinition } from "../../lib/tools";
import { AdBanner } from "../../components/AdBanner";

interface ToolPageLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolPageLayout({ tool, children }: ToolPageLayoutProps) {
  const Icon = tool.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-12 max-w-5xl"
    >
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tools
      </Link>

      <div className="text-center mb-12">
        <div 
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: `${tool.color}15`, color: tool.color, boxShadow: `0 0 40px ${tool.color}20` }}
        >
          <Icon className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{tool.name}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{tool.description}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {children}
        
        <div className="mt-12">
          <AdBanner placement="inline" />
        </div>
      </div>
    </motion.div>
  );
}
