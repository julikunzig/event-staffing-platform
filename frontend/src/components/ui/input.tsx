import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition-all outline-none font-['Poppins',sans-serif]",
        "placeholder:text-gray-400",
        "focus:border-[#2db84b] focus:ring-2 focus:ring-[#2db84b]/15 focus:bg-white",
        "disabled:pointer-events-none disabled:bg-gray-50 disabled:opacity-60",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
