import { Shield, Settings } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-xl" },
    lg: { icon: 36, text: "text-2xl" },
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Shield size={sizes[size].icon} className="text-sidebar-primary fill-sidebar-primary/20" strokeWidth={2} />
        <Settings
          size={sizes[size].icon * 0.45}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sidebar-primary"
          strokeWidth={2.5}
        />
      </div>
      {showText && <span className={`font-bold ${sizes[size].text} text-sidebar-foreground`}>GearGuard</span>}
    </div>
  )
}
