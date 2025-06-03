import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  };
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
          <h1 className="font-semibold text-2xl md:text-3xl">{title}</h1>
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick} variant={action.variant || 'default'}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}