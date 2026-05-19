import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all outline-none",
        "placeholder:text-slate-400",
        "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
        "disabled:pointer-events-none disabled:bg-slate-50 disabled:opacity-60",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
