import { Link, useLocation } from "wouter";
import { Hexagon, Moon, Sun, Menu, Search, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass-panel">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:glow-primary transition-all duration-300">
            <Hexagon className="w-5 h-5 absolute" />
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">Velixora</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#pdf-tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">PDF Tools</Link>
          <Link href="/#image-tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Images</Link>
          <Link href="/#archive-tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Archives</Link>
          
          <div className="flex items-center gap-2 border-l border-border/50 pl-6">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 glow-primary rounded-full px-6">
              All Tools
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link href="/#pdf-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>PDF Tools</Link>
              <Link href="/#image-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Images</Link>
              <Link href="/#archive-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Archives</Link>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-medium">Theme</span>
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
