import { Button } from "../../components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface ProcessButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  disabled: boolean;
  text?: string;
  color?: string;
  className?: string;
}

export function ProcessButton({ onClick, isProcessing, disabled, text = "Process File", color = "hsl(var(--primary))", className }: ProcessButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 });
  };

  return (
    <motion.div
      animate={{ x: isHovered && !disabled ? mousePos.x * 0.1 : 0, y: isHovered && !disabled ? mousePos.y * 0.1 : 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn("w-full max-w-sm mx-auto mt-8 relative", className)}
    >
      <div className={cn("absolute -inset-1 blur-xl opacity-0 transition-opacity duration-500 rounded-full", isHovered && !disabled && !isProcessing ? "opacity-40" : "", isProcessing ? "opacity-60 animate-pulse" : "")} style={{ backgroundColor: color }} />
      <Button
        ref={buttonRef}
        size="lg"
        onClick={onClick}
        disabled={disabled || isProcessing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
        onMouseMove={handleMouseMove}
        className={cn("w-full h-14 text-lg font-semibold rounded-xl relative overflow-hidden transition-all duration-300", disabled ? "bg-muted text-muted-foreground" : "text-white")}
        style={!disabled ? { backgroundColor: color, border: `1px solid ${color}` } : undefined}
      >
        <span className={cn("flex items-center justify-center gap-2", isProcessing ? "opacity-0" : "opacity-100")}>
          <Zap className="w-5 h-5 fill-current" /> {text}
        </span>
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-3">Processing...</span>
          </div>
        )}
      </Button>
    </motion.div>
  );
}
