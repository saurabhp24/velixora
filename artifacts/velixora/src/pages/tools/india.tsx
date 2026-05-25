import { motion } from "framer-motion";
import { ToolCard } from "@/components/ToolCard";
import { 
  CreditCard, FileBadge, Image as ImageIcon, 
  MessageCircle, FileText, Receipt
} from "lucide-react";

export default function IndiaTools() {
  const tools = [
    { title: "Aadhaar PDF Optimizer", description: "Compress Aadhaar PDF to <500KB for portal uploads.", icon: CreditCard, href: "/tools/compress" },
    { title: "PAN Card Compressor", description: "Resize scanned PAN to <2MB with high legibility.", icon: FileBadge, href: "/tools/compress" },
    { title: "Passport Photo Formatter", description: "Crop and compress image to 2x2 inch for visa applications.", icon: ImageIcon, href: "/tools/compress" },
    { title: "WhatsApp PDF Optimizer", description: "Reduce heavy PDFs for quick WhatsApp sharing.", icon: MessageCircle, href: "/tools/compress" },
    { title: "Exam Document Scanner", description: "Enhance contrast and OCR handwritten answer sheets.", icon: FileText, href: "/tools/ocr" },
    { title: "GST Invoice Extractor", description: "Extract tables and totals from GST invoices.", icon: Receipt, href: "/tools/table-extractor" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">India <span className="bg-clip-text text-transparent gradient-violet-cyan">Tools</span></h1>
        <p className="text-muted-foreground">Pre-configured optimizations for common Indian document workflows.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, idx) => (
          <ToolCard key={idx} {...tool} delay={idx * 0.05} />
        ))}
      </div>
    </motion.div>
  );
}
