import { useState } from "react";
import { motion } from "framer-motion";
import { useApiKey } from "@/hooks/useApiKey";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Key, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Wifi, Info } from "lucide-react";

export default function Settings() {
  const { key, saveKey, removeKey, hasKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !trimmed.startsWith("sk-")) {
      toast({ title: "Invalid API Key", description: "Please enter a valid OpenAI API key starting with 'sk-'.", variant: "destructive" });
      return;
    }
    saveKey(trimmed);
    setInputValue("");
    setTestResult(null);
    toast({ title: "Key Saved", description: "Your API key has been securely saved to local storage." });
  };

  const handleRemove = () => {
    removeKey();
    setTestResult(null);
    toast({ title: "Key Removed", description: "Your API key has been removed from local storage." });
  };

  const handleTest = async () => {
    if (!hasKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      await openaiChat(key, [{ role: "user", content: "Say OK" }]);
      setTestResult("success");
      toast({ title: "Connection Successful", description: "Your OpenAI API key is working correctly." });
    } catch {
      setTestResult("fail");
      toast({ title: "Connection Failed", description: "Your API key may be invalid or expired.", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your connections and preferences.</p>
      </header>

      <div className="space-y-8">
        {/* API Key Section */}
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
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Key connected</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">sk-...{key.slice(-4)}</p>
                  </div>
                </div>
                {testResult === "success" && <span className="flex items-center gap-1.5 text-xs text-green-400"><Wifi className="w-3.5 h-3.5" /> Working</span>}
                {testResult === "fail" && <span className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> Invalid</span>}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleTest} variant="outline" disabled={testing} className="gap-2 flex-1">
                  {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</> : <><Wifi className="w-4 h-4" /> Test Connection</>}
                </Button>
                <Button variant="destructive" onClick={handleRemove} className="gap-2">Remove Key</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-400">No API key connected</p>
                  <p className="text-xs text-muted-foreground mt-1">AI features (summarizer, chat, OCR, translation, etc.) require your own OpenAI key.</p>
                </div>
              </div>

              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="sk-..."
                  className="bg-background/50 pr-10 font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleSave} className="w-full gap-2" disabled={!inputValue.trim()}>
                <Key className="w-4 h-4" /> Save API Key
              </Button>
            </div>
          )}
        </section>

        {/* Privacy Notice */}
        <section className="glass rounded-2xl border border-border/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
              <p className="text-sm text-muted-foreground">How we handle your data.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              "Your API key is stored ONLY in your browser's localStorage — it never reaches our servers.",
              "All file processing (PDF, image, archive) happens entirely in your browser.",
              "Files are never uploaded to any server. Your documents stay on your device.",
              "AI requests are sent directly from your browser to OpenAI using your own key.",
              "Clearing your browser data or cookies will remove your saved API key.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How to get key */}
        <section className="glass rounded-2xl border border-border/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">How to get an OpenAI API Key</h2>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              "Go to platform.openai.com and sign up or log in.",
              "Click your profile → View API Keys → Create new secret key.",
              "Copy the key (it starts with 'sk-') and paste it above.",
              "You only need to do this once — it's saved in your browser.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-5 text-sm text-primary hover:underline">
            Open OpenAI Platform →
          </a>
        </section>
      </div>
    </motion.div>
  );
}
