import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CapacityBarProps {
  current: number;
  max: number;
  className?: string;
}

export function CapacityBar({ current, max, className }: CapacityBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  let colorClass = "bg-green-500";
  if (percentage > 50 && percentage <= 80) colorClass = "bg-amber-500";
  else if (percentage > 80 && percentage < 100) colorClass = "bg-orange-500";
  else if (percentage === 100) colorClass = "bg-red-500";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <Progress 
        value={percentage} 
        className="h-2 w-full"
        indicatorClassName={colorClass}
      />
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>{current} / {max} spots filled</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
