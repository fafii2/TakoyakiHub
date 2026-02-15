"use client"

import { Drawer } from "vaul"
import type { Order } from "@/lib/types"
import { updateOrderStatus, removeOrder } from "@/hooks/use-store"
import { BadgeCheck, Check, Truck, Store } from "lucide-react"

export function OrderDrawer({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null

  const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0)
  const time = new Date(order.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })



  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border outline-none max-h-[90vh] flex flex-col">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-muted flex-shrink-0" />
          <div className="px-5 pb-8 pt-4 flex-1 overflow-y-auto">
            <Drawer.Title className="sr-only">
              Order #{order.id} Details
            </Drawer.Title>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg font-bold text-foreground">
                  Order #{order.id.slice(0, 5)}...
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed at {time}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={order.status} />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                  {order.pickupMethod === "delivery" ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                  {order.pickupMethod}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-lg bg-accent p-3 mb-4 space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {order.name}
                  </span>
                  {order.fbVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-400" aria-label="Facebook verified" />
                  )}
                </div>
                {order.facebook && (
                  <a href={order.facebook} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                    View Profile
                  </a>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {order.contactNumber}
              </div>

              {order.notes && (
                <div className="mt-2 text-xs italic text-foreground bg-background/50 p-2 rounded">
                  "{order.notes}"
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Items
              </p>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      x{item.qty}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {"₱"}{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-border mb-6">
              <span className="text-sm font-semibold text-foreground">
                Total
              </span>
              <span className="text-lg font-bold text-primary">
                {"₱"}{orderTotal}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      removeOrder(order.id)
                      onClose()
                    }}
                    className="h-12 rounded-xl text-sm font-medium text-muted-foreground border border-border active:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(order.id, "accepted")
                      onClose()
                    }}
                    className="h-12 rounded-xl text-sm font-medium text-primary-foreground bg-primary active:bg-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Accept
                  </button>
                </>
              )}
              {order.status === "accepted" && (
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, "preparing")
                    onClose()
                  }}
                  className="col-span-2 h-12 rounded-xl text-sm font-medium text-white bg-blue-500 active:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Start Preparing
                </button>
              )}
              {order.status === "preparing" && (
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, "ready")
                    onClose()
                  }}
                  className="col-span-2 h-12 rounded-xl text-sm font-medium text-white bg-orange-500 active:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Mark Ready for Pickup
                </button>
              )}
              {order.status === "ready" && (
                <button
                  onClick={() => {
                    updateOrderStatus(order.id, "completed")
                    onClose()
                  }}
                  className="col-span-2 h-12 rounded-xl text-sm font-medium text-white bg-green-500 active:bg-green-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Complete Order
                </button>
              )}
              {order.status === "completed" && (
                <button
                  onClick={onClose}
                  className="col-span-2 h-12 rounded-xl text-sm font-medium text-green-400 border border-green-400/20 bg-green-400/10 active:bg-green-400/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Done
                </button>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    accepted: "text-blue-400 bg-blue-400/10",
    preparing: "text-orange-400 bg-orange-400/10",
    ready: "text-green-400 bg-green-400/10",
    completed: "text-gray-400 bg-gray-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] || map.pending}`}
    >
      {status}
    </span>
  )
}
