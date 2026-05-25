import { motion } from "framer-motion";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { Link } from "wouter";
import { ArrowRight, File as FileIcon, Clock, HardDrive, BrainCircuit } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";

export default function Dashboard() {
  const { getFiles } = useRecentFiles();
  const files = getFiles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Workspace <span className="bg-clip-text text-transparent gradient-violet-cyan">Dashboard</span></h1>
        <p className="text-muted-foreground">Your recent files and AI recommendations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Files
              </h2>
            </div>
            
            {files.length === 0 ? (
              <div className="glass rounded-xl p-10 text-center border border-border/50">
                <HardDrive className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No files yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Drop a file on the homepage or use a tool to get started.</p>
                <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:bg-primary/90 transition-colors">
                  Go to Upload
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, i) => (
                  <div key={i} className="glass p-4 rounded-xl border border-border/50 flex items-center justify-between group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(file.timestamp).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Link href={`/tools/${file.tool}`} className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <BrainCircuit className="w-5 h-5 text-cyan-400" /> Smart Workflows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-xl border border-border/50">
                <h3 className="font-medium mb-2">Contract Review</h3>
                <p className="text-sm text-muted-foreground mb-4">Analyze risk + Summarize terms</p>
                <Link href="/tools/contract-analyzer" className="text-sm text-primary hover:underline">Start Workflow &rarr;</Link>
              </div>
              <div className="glass p-6 rounded-xl border border-border/50">
                <h3 className="font-medium mb-2">Job Application</h3>
                <p className="text-sm text-muted-foreground mb-4">Analyze Resume + Export PDF</p>
                <Link href="/tools/resume-analyzer" className="text-sm text-primary hover:underline">Start Workflow &rarr;</Link>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
             <div className="glass rounded-xl border border-border/50 overflow-hidden flex flex-col h-[500px]">
               <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
                 <h3 className="font-semibold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                   AI Assistant
                 </h3>
               </div>
               <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                 <BrainCircuit className="w-12 h-12 text-muted-foreground/20 mb-4" />
                 <p className="text-sm text-muted-foreground px-6">
                   Open a tool to interact with the AI. Your context will appear here.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
