import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-1 items-center", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          style={{
            animation: "pulseDot 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}