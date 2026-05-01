import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-muted border border-slate-edge flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-light" />
      </div>
      <h3 className="text-cream font-medium text-base mb-1">{title}</h3>
      {description && (
        <p className="text-slate-light text-sm max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}