"use client"

import { useStore, initMenuListener } from "@/lib/store"
import { HeroSection } from "@/components/hero-section"
import { MenuSection } from "@/components/menu-section"
import { OrderSummary } from "@/components/order-summary"
import { CheckoutSection } from "@/components/checkout-section"
import { PaymentScreen } from "@/components/payment-screen"
import { OrderStatusScreen } from "@/components/order-status"
import { useRef, useEffect, useState } from "react"

const ACTIVE_STATUSES = ["pending", "accepted", "preparing", "ready", "cancelled"] as const

export default function Page() {
  const {
    status,
    customerName,
    orderItems,
    menuItems,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    clearItems,
    setStatus,
    setCustomerInfo,
    submitOrder,
    cancelOrder,
  } = useStore()

  useEffect(() => {
    initMenuListener()
  }, [])

  const menuRef = useRef<HTMLDivElement>(null)

  function scrollToMenu() {
    menuRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function handleCheckout() {
    setStatus("checkout")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleConfirmOrder(name: string, contact: string) {
    setCustomerInfo(name, contact)
    setStatus("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handlePaymentComplete() {
    try {
      await submitOrder()
      setStatus("pending")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      alert("Failed to submit order. Please try again.")
    }
  }

  function handleNewOrder() {
    clearItems()
    setStatus("idle")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [isStatusVisible, setIsStatusVisible] = useState(true)
  const isActiveStatus = (ACTIVE_STATUSES as readonly string[]).includes(status)
  const hasActiveOrder = ["pending", "accepted", "preparing", "ready"].includes(status)

  useEffect(() => {
    if (isActiveStatus) {
      setIsStatusVisible(true)
    }
  }, [status, isActiveStatus])

  // Checkout flow
  if (status === "checkout") {
    return (
      <main className="relative z-10">
        <CheckoutSection
          orderItems={orderItems}
          totalPrice={totalPrice}
          onBack={() => setStatus("idle")}
          onConfirm={handleConfirmOrder}
        />
      </main>
    )
  }

  // Payment flow
  if (status === "payment") {
    return (
      <main className="relative z-10">
        <PaymentScreen
          totalPrice={totalPrice}
          customerName={customerName}
          onPaymentComplete={handlePaymentComplete}
        />
      </main>
    )
  }

  // Order status flow
  if (isActiveStatus && isStatusVisible) {
    return (
      <main className="relative z-10">
        <OrderStatusScreen
          status={status}
          customerName={customerName}
          onNewOrder={handleNewOrder}
          onBackToMenu={() => setIsStatusVisible(false)}
          onCancelOrder={cancelOrder}
        />
      </main>
    )
  }

  // Main ordering flow
  return (
    <main className="relative z-10">
      <HeroSection onOrderClick={scrollToMenu} />

      <div ref={menuRef}>
        <MenuSection
          menuItems={menuItems}
          orderItems={orderItems}
          onAdd={addItem}
          onRemove={removeItem}
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-display text-lg text-foreground">{"たこ焼き"}</span>
          <p className="text-xs text-muted-foreground">
            {"Fresh \u2022 Hot \u2022 Made to Order"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {"\u00A9 2026 Takoyaki. All rights reserved."}
          </p>
        </div>
      </footer>

      {!hasActiveOrder && (
        <OrderSummary
          orderItems={orderItems}
          totalItems={totalItems}
          totalPrice={totalPrice}
          onCheckout={handleCheckout}
          onRemove={removeItem}
        />
      )}

      {hasActiveOrder && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsStatusVisible(true)}
            className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {"View Active Order"}
          </button>
        </div>
      )}
    </main>
  )
}
