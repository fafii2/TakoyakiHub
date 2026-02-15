"use client"

import { ClipboardList, Package, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabKey = "queue" | "menu" | "records"

const tabs: { key: TabKey; label: string; icon: typeof ClipboardList }[] = [
  { key: "queue", label: "Live Queue", icon: ClipboardList },
  { key: "menu", label: "Menu Stock", icon: Package },
  { key: "records", label: "Records", icon: BarChart3 },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (tab: TabKey) => void
}) {
  return (
    <nav
      className="sticky bottom-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-h-[56px] flex-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
