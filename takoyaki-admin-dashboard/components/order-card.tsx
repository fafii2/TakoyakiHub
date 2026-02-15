"use client"

import { useState, useEffect } from "react"
import type { Order } from "@/lib/types" // Updated type
import { updateOrderStatus, removeOrder } from "@/hooks/use-store"
import { BadgeCheck, Check } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "text-yellow-400 bg-yellow-400/10",
  },
  accepted: {
    label: "Accepted",
    className: "text-blue-400 bg-blue-400/10",
  },
  preparing: {
    label: "Preparing",
    className: "text-orange-400 bg-orange-400/10",
  },
  ready: {
    label: "Ready",
    className: "text-green-400 bg-green-400/10",
  },
  completed: {
    label: "Completed",
    className: "text-gray-400 bg-gray-400/10",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-red-400 bg-red-400/10",
  }
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function OrderCard({
  order,
  onTap,
}: {
  order: Order
  onTap: () => void
}) {
  const config = statusConfig[order.status] || statusConfig.pending
  const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onTap()
        }
      }}
      className="rounded-xl bg-card border border-border p-4 transition-colors active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            #{order.id.slice(0, 4)}...
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
          >
            {config.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {mounted ? timeAgo(order.timestamp) : "--"}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm text-foreground">{order.name}</span>
        {order.fbVerified && (
          <BadgeCheck className="h-3.5 w-3.5 text-blue-400" aria-label="Facebook verified" />
        )}
      </div>

      {/* Items summary */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
        {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
      </p>

      {/* Total + Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">
          {"₱"}{orderTotal}
        </span>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {order.status === "pending" && (
            <>
              <button
                onClick={() => removeOrder(order.id)}
                className="min-h-[44px] px-4 rounded-lg text-xs font-medium text-muted-foreground border border-border active:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Reject
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, "accepted")}
                className="min-h-[44px] px-4 rounded-lg text-xs font-medium text-primary-foreground bg-primary active:bg-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Accept
              </button>
            </>
          )}
          {order.status === "accepted" && (
            <button
              onClick={() => updateOrderStatus(order.id, "preparing")}
              className="min-h-[44px] px-4 rounded-lg text-xs font-medium text-foreground bg-blue-500 active:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Preparing
            </button>
          )}
          {order.status === "preparing" && (
            <button
              onClick={() => updateOrderStatus(order.id, "ready")}
              className="min-h-[44px] px-4 rounded-lg text-xs font-medium text-foreground bg-orange-500 active:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ready
            </button>
          )}
          {order.status === "ready" && (
            <button
              onClick={() => updateOrderStatus(order.id, "completed")}
              className="min-h-[44px] px-4 rounded-lg text-xs font-medium text-foreground bg-green-500 active:bg-green-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Complete
            </button>
          )}
          {order.status === "completed" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
              <Check className="h-4 w-4" />
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
