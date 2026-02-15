"use client"

import { ShoppingBag, ChevronUp, ChevronDown, X } from "lucide-react"
import { useState } from "react"
import type { OrderItem } from "@/lib/store"

interface OrderSummaryProps {
  orderItems: OrderItem[]
  totalItems: number
  totalPrice: number
  onCheckout: () => void
  onRemove: (itemId: string) => void
}

export function OrderSummary({ orderItems, totalItems, totalPrice, onCheckout, onRemove }: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      {/* Expanded details */}
      {expanded && (
        <div className="bg-card/95 backdrop-blur-lg border-t border-border mx-auto max-w-lg rounded-t-xl px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground text-sm">{"Your Order"}</h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close order details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {orderItems.map((oi) => (
              <div key={oi.menuItem.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{oi.quantity}x</span>
                  <span className="text-foreground">{oi.menuItem.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-medium">
                    {"P"}{oi.menuItem.price * oi.quantity}
                  </span>
                  <button
                    onClick={() => onRemove(oi.menuItem.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Remove ${oi.menuItem.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bar */}
      <div className="bg-card border-t border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 flex-1 min-w-0"
            aria-label={expanded ? "Collapse order summary" : "Expand order summary"}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-start text-left min-w-0">
              <span className="text-xs text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
              <span className="text-foreground font-bold">{"P"}{totalPrice}</span>
            </div>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={onCheckout}
            className="bg-primary text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-md
                       hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
