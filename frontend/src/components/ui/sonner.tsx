import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg":     "#ffffff",
        "--normal-text":   "#111827",
        "--normal-border": "#e5e7eb",
        "--success-bg":    "#f0fdf4",
        "--success-text":  "#15803d",
        "--success-border":"#bbf7d0",
        "--error-bg":      "#fef2f2",
        "--error-text":    "#dc2626",
        "--error-border":  "#fecaca",
        "--border-radius": "0.875rem",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "13px",
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }
