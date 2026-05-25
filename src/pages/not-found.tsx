import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="glass rounded-2xl border border-border/50 p-12 text-center max-w-md mx-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-3">404</h1>
        <p className="text-muted-foreground mb-8">This page doesn't exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
