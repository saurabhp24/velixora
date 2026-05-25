import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { getToolsByCategory, getTrendingTools } from "../../lib/tools";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const trendingTools = getTrendingTools().slice(0, 6);
  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");
  const archiveTools = getToolsByCategory("archive");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg gradient-violet-cyan flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="font-bold text-lg tracking-tight text-gradient">
              VELIXORA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Tools Mega Menu */}
            <div className="relative" onMouseEnter={() => setToolsMenuOpen(true)} onMouseLeave={() => setToolsMenuOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Tools
                <ChevronDown className={cn("w-4 h-4 transition-transform", toolsMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {toolsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] glass-panel rounded-2xl border border-border/40 p-6 shadow-2xl"
                  >
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">PDF Tools</h3>
                        <div className="space-y-1">
                          {pdfTools.slice(0, 8).map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setToolsMenuOpen(false)}
                            >
                              <tool.icon className="w-3.5 h-3.5" style={{ color: tool.color }} />
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Images</h3>
                        <div className="space-y-1">
                          {imageTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setToolsMenuOpen(false)}
                            >
                              <tool.icon className="w-3.5 h-3.5" style={{ color: tool.color }} />
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                        <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3 mt-5">Archives</h3>
                        <div className="space-y-1">
                          {archiveTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setToolsMenuOpen(false)}
                            >
                              <tool.icon className="w-3.5 h-3.5" style={{ color: tool.color }} />
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="border-l border-border/40 pl-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Trending</h3>
                        <div className="space-y-2">
                          {trendingTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              className="block py-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                              onClick={() => setToolsMenuOpen(false)}
                            >
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">How it Works</a>
            <a href="#faq" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">FAQ</a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link
              href="/dashboard"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-1">
              <a href="#pdf-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>PDF Tools</a>
              <a href="#image-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Images</a>
              <a href="#archive-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Archives</a>
              <a href="#faq" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40">
                <span className="text-sm font-medium">Theme</span>
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
