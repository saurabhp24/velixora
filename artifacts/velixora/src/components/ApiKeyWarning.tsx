import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/useApiKey";
import { Link } from "wouter";

export function ApiKeyWarning({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { hasKey } = useApiKey();

  // If they already have a key, don't force it open unless explicitly asked (usually shouldn't happen)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-clip-text text-transparent gradient-violet-cyan">Connect Your AI Brain</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Velixora runs directly in your browser. To use the AI features, you need to provide your own OpenAI API key.
            Your key is stored securely in your browser's local storage and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Link href="/settings" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Go to Settings
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
