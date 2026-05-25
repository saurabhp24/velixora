import React from "react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4 inline-flex">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary">
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <span className="font-bold text-lg text-gradient">Velixora</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Smart Conversion Universe. Process PDFs, images, and archives entirely in your browser with zero server uploads.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">PDF Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/merge-pdf" className="hover:text-primary transition-colors">Merge PDF</Link></li>
              <li><Link href="/tools/split-pdf" className="hover:text-primary transition-colors">Split PDF</Link></li>
              <li><Link href="/tools/compress-pdf" className="hover:text-primary transition-colors">Compress PDF</Link></li>
              <li><Link href="/tools/pdf-to-word" className="hover:text-primary transition-colors">PDF to Word</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Image Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/compress-image" className="hover:text-primary transition-colors">Compress Image</Link></li>
              <li><Link href="/tools/convert-image" className="hover:text-primary transition-colors">Convert Image</Link></li>
              <li><Link href="/tools/resize-image" className="hover:text-primary transition-colors">Resize Image</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal & Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Velixora. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Client-side only</span>
            <span className="w-1 h-1 rounded-full bg-border self-center" />
            <span>100% Free</span>
            <span className="w-1 h-1 rounded-full bg-border self-center" />
            <span>Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
