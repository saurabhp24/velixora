import { cn } from "@/lib/utils";

interface AdBannerProps {
  placement: 'top' | 'sidebar' | 'inline' | 'bottom';
  className?: string;
}

export function AdBanner({ placement, className }: AdBannerProps) {
  return (
    <div className={cn(
      "w-full glass-panel border-border/50 flex flex-col items-center justify-center overflow-hidden relative",
      placement === 'inline' ? "my-8 min-h-[120px] rounded-xl" : "min-h-[250px] rounded-xl",
      className
    )}>
      <span className="absolute top-2 right-3 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
        Advertisement
      </span>
      <div className="text-muted-foreground/30 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border border-muted-foreground/20 rounded opacity-50 flex items-center justify-center">
          <span className="text-xs">AD</span>
        </div>
        <span className="text-sm font-medium">Premium Placement</span>
      </div>
    </div>
  );
}
