import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Key } from "lucide-react";

export function ApiKeyWarning() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-violet-cyan flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">Connect Your AI Brain</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Velixora runs directly in your browser. To use AI features, provide your OpenAI API key.
            It is stored only in your browser's local storage and never sent to any server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            onClick={() => setOpen(false)}
          >
            Go to Settings
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
