import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Minimalist Monochrome buttons:
 * - Sharp corners, no shadows, monospace uppercase labels
 * - Primary = black fill; hover inverts instantly (100ms)
 * - Focus: 3px solid outline, 3px offset (global :focus-visible)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-mono text-xs font-medium uppercase tracking-widest transition-colors duration-100 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground",
        destructive:
          "border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground",
        outline:
          "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary:
          "border-2 border-border-light bg-muted text-foreground hover:border-foreground",
        ghost:
          "border-2 border-transparent bg-transparent text-foreground hover:underline underline-offset-4",
        link: "border-0 bg-transparent text-foreground underline underline-offset-4 hover:opacity-60",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-12 px-10",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
