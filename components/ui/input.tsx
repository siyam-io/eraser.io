import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Line-based input: 2px bottom rule, thickens to 4px on focus.
 * No ring, no radius — the rule change is the focus state.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground placeholder:italic selection:bg-foreground selection:text-background flex h-10 w-full min-w-0 rounded-none border-0 border-b-2 border-foreground bg-transparent px-0 py-2 text-base outline-none transition-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-b-4 focus-visible:outline-none",
        "aria-invalid:border-b-4",
        className
      )}
      {...props}
    />
  )
}

export { Input }
