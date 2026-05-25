import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, MessageSquare, ScanText, Table,
  UserCheck, Shield, Minimize2, ArrowLeftRight, Presentation,
  Languages, Globe, Settings, Menu, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { group: "Workspace", items: [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", path: "/settings", icon: Settings },
  ]},
  { group: "AI Tools", items: [
    { name: "PDF Summarizer", path: "/tools/pdf-summarizer", icon: FileText },
    { name: "Chat with PDF", path: "/tools/chat-pdf", icon: MessageSquare },
    { name: "Smart OCR", path: "/tools/ocr", icon: ScanText },
    { name: "Table Extractor", path: "/tools/table-extractor", icon: Table },
    { name: "Resume Analyzer", path: "/tools/resume-analyzer", icon: UserCheck },
    { name: "Contract Analyzer", path: "/tools/contract-analyzer", icon: Shield },
    { name: "Compressor", path: "/tools/compress", icon: Minimize2 },
    { name: "Convert & Merge", path: "/tools/convert", icon: ArrowLeftRight },
    { name: "PPT Generator", path: "/tools/ppt-generator", icon: Presentation },
    { name: "Translator", path: "/tools/translate", icon: Languages },
    { name: "India Tools", path: "/tools/india", icon: Globe },
  ]}
];

export function Layout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between shrink-0">
        {!collapsed ? (
          <Link href="/" className="font-sans font-bold text-xl tracking-tight text-gradient select-none flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-violet-cyan flex items-center justify-center text-white text-xs">V</div>
            VELIXORA
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-md gradient-violet-cyan flex items-center justify-center text-white text-sm font-bold">V</div>
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx} className="mb-6 px-3">
            {!collapsed && <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{section.group}</h3>}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground"} ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.name : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 hidden md:flex shrink-0 border-t border-border/50">
        <Button variant="ghost" size="icon" className="w-full flex justify-center text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <motion.aside initial={false} animate={{ width: collapsed ? 72 : 256 }} className="hidden md:block h-full glass border-r border-border/50 z-20 shrink-0">
        <SidebarContent />
      </motion.aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <motion.aside initial={{ x: "-100%" }} animate={{ x: mobileOpen ? 0 : "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 w-64 glass border-r border-border/50 z-50 md:hidden shadow-2xl">
        <SidebarContent />
      </motion.aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <header className="md:hidden flex items-center justify-between p-4 glass border-b border-border/50 shrink-0">
          <Link href="/" className="font-sans font-bold text-lg tracking-tight text-gradient select-none flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-violet-cyan flex items-center justify-center text-white text-[10px]">V</div>
            VELIXORA
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto relative">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
