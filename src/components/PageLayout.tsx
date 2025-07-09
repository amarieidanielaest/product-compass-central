import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Standard page container with consistent padding and max-width
export const PageContainer = ({ children, className }: PageLayoutProps) => (
  <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
);

// Standard content area with consistent spacing
export const PageContent = ({ children, className }: PageLayoutProps) => (
  <div className={cn("py-6 space-y-6", className)}>
    {children}
  </div>
);

// Standard section spacing
export const Section = ({ children, className }: PageLayoutProps) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
);

// Grid layouts
export const Grid = ({ children, className }: PageLayoutProps) => (
  <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {children}
  </div>
);

export const Grid2Col = ({ children, className }: PageLayoutProps) => (
  <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2", className)}>
    {children}
  </div>
);

export const Grid4Col = ({ children, className }: PageLayoutProps) => (
  <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}>
    {children}
  </div>
);

// Standard card spacing
export const CardGrid = ({ children, className }: PageLayoutProps) => (
  <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {children}
  </div>
);

// Stack layout for forms and content
export const Stack = ({ children, className }: PageLayoutProps) => (
  <div className={cn("space-y-4", className)}>
    {children}
  </div>
);

export const StackLarge = ({ children, className }: PageLayoutProps) => (
  <div className={cn("space-y-6", className)}>
    {children}
  </div>
);

export const StackSmall = ({ children, className }: PageLayoutProps) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);