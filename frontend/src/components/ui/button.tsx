import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

/* Tema Slate & Emerald — Emerald como color primario */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 gap-1.5 cursor-pointer",
  {
    variants: {
      variant: {
        // Primario — Emerald
        default:
          "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm border border-emerald-400",
        // Outline — borde emerald
        outline:
          "border-2 border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100",
        // Secundario — slate claro
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
        // Ghost — sin fondo
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        // Destructivo — rojo
        destructive:
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300",
        // Link
        link:
          "text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700 p-0 h-auto",
        // Dark — para usar sobre fondos oscuros
        dark:
          "bg-slate-700 text-white hover:bg-slate-600 border border-slate-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-7 px-3 text-xs rounded-md",
        lg:      "h-11 px-6 text-base",
        icon:    "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-md",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
