"use client"

import { useOrderCounts, useTotalSales, addDummyOrder } from "@/hooks/use-store"
import { Clock, Flame, PlusCircle } from "lucide-react"

export function TopBar() {
  const { pending, preparing } = useOrderCounts()
  const totalSales = useTotalSales()
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Takoyaki Admin
          </h1>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={addDummyOrder}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs font-medium text-white border border-zinc-700"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Simulate Order
          </button>
          <p className="text-xl font-bold text-primary tabular-nums">
            {"₱"}{totalSales.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
          <Clock className="h-3 w-3" />
          {pending} Pending
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-400/10 px-2.5 py-1 text-xs font-medium text-orange-400">
          <Flame className="h-3 w-3" />
          {preparing} Preparing
        </span>
      </div>
    </header>
  )
}
