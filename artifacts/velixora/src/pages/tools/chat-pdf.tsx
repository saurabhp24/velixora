import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileDropZone } from "@/components/FileDropZone";
import { useApiKey } from "@/hooks/useApiKey";
import { extractPdfText } from "@/lib/pdfUtils";
import { openaiChat } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User } from "lucide-react";

export default function ChatPdf() {
  const { key, hasKey } = useApiKey();
  
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "ready" | "error">("idle");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleProcess = async (f: File) => {
    if (!hasKey) return setStatus("error");
    setFile(f);
    setStatus("extracting");
    try {
      const text = await extractPdfText(f);
      setPdfText(text);
      setMessages([{ role: "assistant", content: `I've read "${f.name}". What would you like to know about it?` }]);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    let assistantMsg = "";
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      await openaiChat(
        key,
        [
          { role: "system", content: `You are a helpful assistant answering questions about a document. Use ONLY the provided document text to answer. If you don't know, say so. \n\nDocument Text:\n${pdfText.substring(0, 30000)}` },
          ...messages,
          { role: "user", content: userMsg }
        ],
        (chunk) => {
          assistantMsg += chunk;
          setMessages(prev => {
            const newM = [...prev];
            newM[newM.length - 1].content = assistantMsg;
            return newM;
          });
        }
      );
    } catch {
      setMessages(prev => {
        const newM = [...prev];
        newM[newM.length - 1].content = "Error communicating with AI.";
        return newM;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Chat with <span className="bg-clip-text text-transparent gradient-violet-cyan">PDF</span></h1>
      </header>

      {status === "idle" && (
        <div className="flex-1 flex items-center justify-center">
          <FileDropZone onFileSelect={handleProcess} accept="application/pdf" title="Drop a PDF to start chatting" />
        </div>
      )}

      {status === "extracting" && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p>Extracting knowledge...</p>
        </div>
      )}

      {status === "ready" && (
        <div className="flex-1 glass rounded-2xl border border-border/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-primary/20 border border-primary/20 text-right' : 'bg-background/50 border border-border/50'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="p-4 bg-background/50 border-t border-border/50 flex gap-3">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything about the document..." 
              className="flex-1 bg-background/80"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
