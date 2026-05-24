import { Link } from "wouter";
import { Hexagon, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tools, getToolsByCategory, ToolDefinition } from "../../lib/tools";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pdfTools = getToolsByCategory('pdf');

  const groupPdf = (list: ToolDefinition[]) => {
    const groups: { title: string; items: ToolDefinition[] }[] = [
      { title: 'Organize PDF', items: [] },
      { title: 'Optimize PDF', items: [] },
      { title: 'Convert To PDF', items: [] },
      { title: 'Convert From PDF', items: [] },
      { title: 'Edit PDF', items: [] },
      { title: 'PDF Security', items: [] },
    ];

    list.forEach((t) => {
      const id = t.id.toLowerCase();
      if (/(merge|split|delete|extract|rearrange|organize|jpg-to-pdf|jpg)/.test(id)) groups[0].items.push(t);
      else if (/(compress|compress-pdf)/.test(id)) groups[1].items.push(t);
      else if (/(jpg-to-pdf|word-to-pdf)/.test(id)) groups[2].items.push(t);
      else if (/(pdf-to-jpg|pdf-to-word)/.test(id)) groups[3].items.push(t);
      else if (/(rotate|watermark|page-numbers)/.test(id)) groups[4].items.push(t);
      else if (/(protect|unlock)/.test(id)) groups[5].items.push(t);
      else groups[4].items.push(t);
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const pdfGroups = groupPdf(pdfTools);

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

  {/* NAV LINKS */}
  <a
    href="#pdf-tools"
    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    PDF Tools
  </a>

  <a
    href="#image-tools"
    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    Images
  </a>

  <a
    href="#archive-tools"
    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    Archives
  </a>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-2 border-l border-border/50 pl-6">

    {/* THEME TOGGLE */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const next =
          theme === "dark"
            ? "light"
            : theme === "light"
            ? "dark"
            : "dark";

        setTheme(next as any);
      }}
      aria-label="Toggle theme"
      className="rounded-full"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>

    {/* FAQ */}
    <a
      href="#faq"
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3"
    >
      FAQ
    </a>

    {/* MEGA MENU */}
    <div className="relative group">

      {/* BUTTON */}
      <button className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105">
        All Tools
      </button>

      {/* DROPDOWN */}
<div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute top-full right-[-100px] mt-5 w-[72vw] min-w-[1450px] max-w-[1400px] h-[77vh] overflow-hidden z-50">        <div className="relative rounded-3xl border border-white/10 bg-[#07111f]/95 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

          {/* BACKGROUND GLOWS */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none" />

          <div className="absolute top-0 left-1/3 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />

          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full" />

          {/* CONTENT: unified tool grid (all tools together) */}
          <div className="relative p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-[rgba(255,255,255,0.02)] border-t border-l border-white/6" />
            <div className="absolute right-6 top-4 text-xs text-muted-foreground">Showing {tools.length} tools</div>
              <div className="relative grid grid-cols-6 gap-6 p-6">

                {/* PDF grouped subcategories */}
                <div className="col-span-2">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-4">PDF Tools</h3>
                  <div className="grid grid-cols-[minmax(260px,1fr)_minmax(300px,1fr)] gap-6">
                    <div>
                      <div className="text-[12px] font-semibold text-foreground/80 mb-2">Organize PDF</div>
                      <div className="space-y-1">
                        {pdfGroups.find((group) => group.title === 'Organize PDF')?.items.map((tool) => (
                          <Link key={tool.id} href={tool.href} className="flex items-center gap-3 py-1 rounded-md hover:bg-white/5">
                            <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${tool.color}10`, color: tool.color }}>
                              <tool.icon className="w-4 h-4" />
                            </div>
                            <div className="text-sm text-white leading-tight">{tool.name}</div>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-6">
                        <div className="text-[12px] font-semibold text-foreground/80 mb-2">Edit PDF</div>
                        <div className="space-y-1">
                          {pdfGroups.find((group) => group.title === 'Edit PDF')?.items.map((tool) => (
                            <Link key={tool.id} href={tool.href} className="flex items-center gap-3 py-1 rounded-md hover:bg-white/5">
                              <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${tool.color}10`, color: tool.color }}>
                                <tool.icon className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-white leading-tight">{tool.name}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {['Optimize PDF', 'Convert To PDF', 'Convert From PDF', 'PDF Security'].map((title) => {
                        const group = pdfGroups.find((g) => g.title === title);
                        return group ? (
                          <div key={group.title}>
                            <div className="text-[12px] font-semibold text-foreground/80 mb-2">{group.title}</div>
                            <div className="space-y-1">
                              {group.items.map((tool) => (
                                <Link key={tool.id} href={tool.href} className="flex items-center gap-3 py-1 rounded-md hover:bg-white/5">
                                  <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${tool.color}10`, color: tool.color }}>
                                    <tool.icon className="w-4 h-4" />
                                  </div>
                                  <div className="text-sm text-white leading-tight">{tool.name}</div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Images column */}
                <div className="col-span-1 border-l border-white/10 pl-6">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4">Images</h3>
                  <div className="space-y-2">
                    {getToolsByCategory("image").map((tool) => (
                      <Link key={tool.id} href={tool.href} className="flex items-center gap-3 py-1 rounded-md hover:bg-white/5">
                        <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${tool.color}10`, color: tool.color }}>
                          <tool.icon className="w-4 h-4" />
                        </div>
                        <div className="text-sm text-white leading-tight">{tool.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Archives column */}
                <div className="col-span-1 border-l border-white/10 pl-6">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400 mb-4">Archives</h3>
                  <div className="space-y-2">
                    {getToolsByCategory("archive").map((tool) => (
                      <Link key={tool.id} href={tool.href} className="flex items-center gap-3 py-1 rounded-md hover:bg-white/5">
                        <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${tool.color}10`, color: tool.color }}>
                          <tool.icon className="w-4 h-4" />
                        </div>
                        <div className="text-sm text-white leading-tight">{tool.name}</div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* feature panel */}
                <div className="col-span-2 border-l border-white/10 pl-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-5">Velixora AI</div>
                    <h3 className="text-3xl font-bold leading-tight text-white">Smart file conversion powered by AI.</h3>
                    <p className="mt-4 text-sm leading-relaxed text-gray-400">Convert PDFs, images, archives, and documents with futuristic speed and privacy-first architecture.</p>
                  </div>
                </div>

              </div>
          </div>
        </div>
      </div>
    </div>
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
              <a href="#pdf-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>PDF Tools</a>
              <a href="#image-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Images</a>
              <a href="#archive-tools" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>Archives</a>
              <a href="#faq" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#trending" className="text-sm font-medium p-2 hover:bg-white/5 rounded-md" onClick={() => setMobileMenuOpen(false)}>All Tools</a>
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
