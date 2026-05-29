import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors font-['Poppins',sans-serif]",
  {
    variants: {
      variant: {
        default:     "bg-green-50 text-green-700 border-green-200",
        secondary:   "bg-gray-100 text-gray-600 border-gray-200",
        destructive: "bg-red-50 text-red-600 border-red-200",
        outline:     "bg-white text-gray-600 border-gray-300",
        success:     "bg-green-50 text-green-700 border-green-200",
        warning:     "bg-amber-50 text-amber-700 border-amber-200",
        info:        "bg-blue-50 text-blue-600 border-blue-200",
      },
    },
    defaultVariants: { variant: "default" },
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
