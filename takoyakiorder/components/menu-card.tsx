"use client"

import Image from "next/image"
import { Minus, Plus } from "lucide-react"
import type { MenuItem, OrderItem } from "@/lib/store"

interface MenuCardProps {
  item: MenuItem
  orderItem?: OrderItem
  onAdd: (item: MenuItem) => void
  onRemove: (itemId: string) => void
}

export function MenuCard({ item, orderItem, onAdd, onRemove }: MenuCardProps) {
  const quantity = orderItem?.quantity ?? 0

  return (
    <div className="group bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-slide-up">
            {quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">{item.name}</h3>
            <span className="text-xs text-muted-foreground font-display">{item.nameJp}</span>
          </div>
          <span className="text-primary font-bold text-lg whitespace-nowrap">
            {"P"}{item.price}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-md
                         hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
            >
              Add to Order
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => onRemove(item.id)}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-foreground
                           hover:bg-secondary/80 active:scale-95 transition-all duration-150"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-foreground font-bold text-lg tabular-nums min-w-[2rem] text-center">
                {quantity}
              </span>

              <button
                onClick={() => onAdd(item)}
                className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground
                           hover:bg-primary/90 active:scale-95 transition-all duration-150"
                aria-label={`Add one more ${item.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
