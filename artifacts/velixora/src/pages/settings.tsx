import { useState } from "react";
import { motion } from "framer-motion";
import { useApiKey } from "@/hooks/useApiKey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Key, CheckCircle2, AlertCircle } from "lucide-react";

export default function Settings() {
  const { key, saveKey, removeKey, hasKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!inputValue.trim() || !inputValue.startsWith("sk-")) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key starting with 'sk-'.",
        variant: "destructive"
      });
      return;
    }
    saveKey(inputValue.trim());
    setInputValue("");
    toast({
      title: "Key Saved",
      description: "Your API key has been securely saved to local storage."
    });
  };

  const handleRemove = () => {
    removeKey();
    toast({
      title: "Key Removed",
      description: "Your API key has been removed from local storage."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your connections and preferences.</p>
      </header>

      <div className="space-y-8">
        <section className="glass rounded-2xl border border-border/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-violet-cyan flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">OpenAI API Key</h2>
              <p className="text-sm text-muted-foreground">Required for AI intelligence features.</p>
            </div>
          </div>

          {hasKey ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Key is connected</p>
                  <p className="font-mono text-xs text-muted-foreground mt-1">sk-...{key.slice(-4)}</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleRemove}>Remove Key</Button>
            </div>
          ) : (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 mb-6">
               <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
               <p className="text-sm text-destructive font-medium">No API key found. AI features will not work.</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-medium">Connect New Key</label>
            <div className="flex gap-3">
              <Input
                type="password"
                placeholder="sk-..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="font-mono bg-background/50 border-border/50"
              />
              <Button onClick={handleSave}>Save Key</Button>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-background/30 border border-border/30">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Privacy First Architecture</p>
              <p>Your API key and all documents never leave your browser. They are processed entirely on your device and sent directly to OpenAI's API. Velixora has no backend and stores nothing.</p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
