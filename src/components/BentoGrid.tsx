import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'highlight' | 'glass' | 'clay';
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min",
      className
    )}>
      {children}
    </div>
  );
};

export const BentoCard = ({ 
  title, 
  description, 
  children, 
  className, 
  size = 'md',
  variant = 'default'
}: BentoCardProps) => {
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-2 row-span-1',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    xl: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2'
  };

  const variantClasses = {
    default: 'loom-glass border border-border/50',
    highlight: 'gradient-clarity border-2 border-primary/20 loom-shadow-lg',
    glass: 'loom-glass-dark border border-border/30',
    clay: 'clay-card loom-shadow-clay border border-border/40'
  };

  return (
    <Card className={cn(
      'loom-rounded-lg loom-hover-lift transition-all duration-300 overflow-hidden',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && (
            <CardTitle className="text-lg font-headline font-semibold text-foreground">
              {title}
            </CardTitle>
          )}
          {description && (
            <p className="text-sm text-muted-foreground font-body">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        "flex-1",
        title || description ? "pt-0" : "pt-6"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default BentoGrid;