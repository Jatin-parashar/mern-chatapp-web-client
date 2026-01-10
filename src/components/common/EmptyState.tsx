import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <Icon className="h-12 w-12 text-muted-foreground mb-3" />
    <p className="text-sm text-muted-foreground mb-2">{title}</p>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
);
