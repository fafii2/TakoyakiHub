"use client"

import { MenuCard } from "@/components/menu-card"
import { type MenuItem, type OrderItem } from "@/lib/store"

interface MenuSectionProps {
  menuItems: MenuItem[]
  orderItems: OrderItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (itemId: string) => void
}

export function MenuSection({ menuItems, orderItems, onAdd, onRemove }: MenuSectionProps) {
  const orderMap = new Map(orderItems.map((oi) => [oi.menuItem.id, oi]))

  return (
    <section id="menu" className="relative z-10 px-4 py-16 md:px-8 max-w-5xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-12 text-center">
        <span className="text-xs text-muted-foreground tracking-[0.3em] uppercase">{"Our Menu"}</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          {"Menu"}
        </h2>
        <p className="font-display text-xl text-muted-foreground">{"メニュー"}</p>
        <div className="h-px w-16 bg-primary mt-2" />
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            orderItem={orderMap.get(item.id)}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
