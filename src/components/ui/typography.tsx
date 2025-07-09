import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Page Headers
export const H1 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("text-3xl font-bold leading-tight tracking-tight text-gray-900", className)} {...props}>
    {children}
  </h1>
);

export const H2 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-2xl font-bold leading-tight tracking-tight text-gray-900", className)} {...props}>
    {children}
  </h2>
);

export const H3 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-semibold leading-tight text-gray-900", className)} {...props}>
    {children}
  </h3>
);

export const H4 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4 className={cn("text-lg font-semibold leading-tight text-gray-900", className)} {...props}>
    {children}
  </h4>
);

export const H5 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={cn("text-base font-semibold leading-tight text-gray-900", className)} {...props}>
    {children}
  </h5>
);

export const H6 = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6 className={cn("text-sm font-semibold leading-tight text-gray-900", className)} {...props}>
    {children}
  </h6>
);

// Body Text
export const Body = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-base leading-7 text-gray-700", className)} {...props}>
    {children}
  </p>
);

export const BodyLarge = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-lg leading-8 text-gray-700", className)} {...props}>
    {children}
  </p>
);

export const BodySmall = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm leading-6 text-gray-600", className)} {...props}>
    {children}
  </p>
);

// Utility Text
export const Caption = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-xs leading-5 text-gray-500", className)} {...props}>
    {children}
  </span>
);

export const Lead = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xl leading-8 text-gray-600", className)} {...props}>
    {children}
  </p>
);

export const Muted = ({ children, className, ...props }: TypographyProps & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm leading-6 text-gray-500", className)} {...props}>
    {children}
  </p>
);