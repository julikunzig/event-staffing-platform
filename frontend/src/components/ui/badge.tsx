import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-emerald-100 text-emerald-800 border-emerald-200",
        secondary:   "bg-slate-100 text-slate-700 border-slate-200",
        destructive: "bg-red-100 text-red-700 border-red-200",
        outline:     "bg-white text-slate-700 border-slate-300",
        success:     "bg-emerald-100 text-emerald-700 border-emerald-200",
        warning:     "bg-amber-100 text-amber-700 border-amber-200",
        info:        "bg-blue-100 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
