import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/ParticleBackground";
import { FileDropZone } from "@/components/FileDropZone";
import { ToolCard } from "@/components/ToolCard";
import { useLocation } from "wouter";
import { 
  FileText, ScanText, Table, Shield, ArrowLeftRight, Languages
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleFileDrop = (file: File) => {
    // Smart routing based on file type
    if (file.type === "application/pdf") {
      setLocation("/tools/pdf-summarizer");
    } else if (file.type.startsWith("image/")) {
      setLocation("/tools/ocr");
    } else {
      setLocation("/tools/convert");
    }
  };

  const tools = [
    { title: "AI Summarization", description: "Extract key insights from lengthy PDFs in seconds.", icon: FileText, href: "/tools/pdf-summarizer" },
    { title: "Smart OCR", description: "Convert scanned images into editable, searchable text.", icon: ScanText, href: "/tools/ocr" },
    { title: "Table Extraction", description: "Pull structured data from documents into Excel/CSV.", icon: Table, href: "/tools/table-extractor" },
    { title: "Contract Analysis", description: "Instantly flag risks and clauses in legal documents.", icon: Shield, href: "/tools/contract-analyzer" },
    { title: "Format Conversion", description: "Split, merge, and convert between document formats seamlessly.", icon: ArrowLeftRight, href: "/tools/convert" },
    { title: "Translation", description: "Accurately translate documents across multiple languages.", icon: Languages, href: "/tools/translate" },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden text-foreground">
      <ParticleBackground />
      
      {/* Navbar placeholder */}
      <header className="absolute top-0 w-full z-10 p-6 flex justify-between items-center">
        <div className="font-sans font-bold text-2xl tracking-tight bg-clip-text text-transparent gradient-violet-cyan select-none flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-violet-cyan flex items-center justify-center text-white text-sm">V</div>
          VELIXORA
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setLocation("/dashboard")} className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </button>
          <button onClick={() => setLocation("/settings")} className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-full transition-colors border border-primary/20">
            Start for Free — No signup required
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold font-sans tracking-tight mb-6">
            <span className="bg-clip-text text-transparent gradient-violet-cyan">AI-Native</span> Document Workspace
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Convert, analyze, summarize, and automate documents at lightning speed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full mb-24"
        >
          <FileDropZone 
            onFileSelect={handleFileDrop} 
            title="Drop a document to start"
            description="PDF, JPEG, PNG • Smart routing to the right tool"
          />
        </motion.div>

        <div className="w-full">
          <h2 className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Power Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, idx) => (
              <ToolCard key={idx} {...tool} delay={0.4 + idx * 0.1} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
