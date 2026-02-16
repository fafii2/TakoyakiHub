"use client"

import { useState, useMemo } from "react"
import { useOrders } from "@/hooks/use-store"
import type { Order, OrderStatus } from "@/lib/types" // Updated type import
import { OrderCard } from "./order-card"
import { OrderDrawer } from "./order-drawer"

const FILTER_OPTIONS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" }
]

export function LiveQueue() {
  const allOrders = useOrders()

  // Only show orders from today
  const orders = useMemo(() => {
    const today = new Date().toLocaleDateString()
    return allOrders.filter((o) => new Date(o.timestamp).toLocaleDateString() === today)
  }, [allOrders])

  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter)

  // Sort: pending first, then accepted, preparing, ready, completed
  const statusOrder: Record<OrderStatus, number> = {
    pending: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    cancelled: 5
  }

  const sorted = [...filtered].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    // If same status, oldest first
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  return (
    <div className="flex flex-col h-full">
      {/* Filter pills */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`min-h-[36px] whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${filter === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground border border-border active:bg-accent"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">Waiting for new orders...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">No orders in this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onTap={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )}
      </div>

      <OrderDrawer
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
