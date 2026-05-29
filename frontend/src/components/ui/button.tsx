import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 gap-1.5 cursor-pointer font-['Poppins',sans-serif]",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-sm border border-transparent",
        outline:
          "border-2 bg-white font-semibold",
        secondary:
          "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
        ghost:
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive:
          "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300",
        link:
          "underline-offset-4 hover:underline p-0 h-auto",
        dark:
          "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
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

const variantStyles: Record<string, React.CSSProperties> = {
  default:     { background: 'linear-gradient(135deg, #1e9038, #2db84b)', boxShadow: '0 2px 8px rgba(45,184,75,0.25)' },
  outline:     { borderColor: '#2db84b', color: '#1e9038' },
  link:        { color: '#2db84b' },
}

const variantHover: Record<string, React.CSSProperties> = {
  default:     { background: 'linear-gradient(135deg, #1a7d30, #28a843)', boxShadow: '0 4px 14px rgba(45,184,75,0.35)' },
  outline:     { background: '#f0fdf4' },
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const [hovered, setHovered] = React.useState(false)

  const computedStyle: React.CSSProperties = {
    ...(variantStyles[variant as string] || {}),
    ...(hovered ? variantHover[variant as string] || {} : {}),
    ...style,
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      style={computedStyle}
      onMouseEnter={e => { setHovered(true); onMouseEnter?.(e as any) }}
      onMouseLeave={e => { setHovered(false); onMouseLeave?.(e as any) }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
