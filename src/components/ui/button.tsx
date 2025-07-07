import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap loom-rounded text-sm font-medium font-body ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-loom-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 loom-hover-lift",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 loom-shadow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 loom-shadow",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground loom-shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 loom-shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // SaaS Trend: Emotional Design - Playful button variants
        "loom-action": "gradient-action text-white hover:opacity-90 loom-shadow-md loom-hover-glow font-semibold",
        "loom-glass": "loom-glass text-foreground hover:bg-background/90 loom-shadow border-0",
        "loom-coral": "bg-coral text-coral-foreground hover:bg-coral/90 loom-shadow-md",
        "loom-accent": "bg-accent text-accent-foreground hover:bg-accent/90 loom-shadow-md",
        "loom-premium": "gradient-intelligence text-white hover:opacity-95 loom-shadow-lg loom-hover-glow font-semibold"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 loom-rounded px-3",
        lg: "h-11 loom-rounded px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
