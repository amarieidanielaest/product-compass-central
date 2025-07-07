import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center loom-rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-loom-ring focus:ring-offset-2 font-body",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 loom-shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        "loom-accent": "border-transparent bg-accent text-accent-foreground hover:bg-accent/80 loom-shadow-sm",
        "loom-coral": "border-transparent bg-coral text-coral-foreground hover:bg-coral/80 loom-shadow-sm",
        "loom-amber": "border-transparent bg-amber text-amber-foreground hover:bg-amber/80 loom-shadow-sm",
        "loom-indigo": "border-transparent bg-indigo text-indigo-foreground hover:bg-indigo/80 loom-shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
