"use client"

import { useStore, initMenuListener } from "@/lib/store"
import { HeroSection } from "@/components/hero-section"
import { MenuSection } from "@/components/menu-section"
import { OrderSummary } from "@/components/order-summary"
import { CheckoutSection } from "@/components/checkout-section"
import { PaymentScreen } from "@/components/payment-screen"
import { ActiveOrdersList } from "@/components/active-orders"
import { useRef, useEffect, useState } from "react"
import { Package } from "lucide-react"

export default function Page() {
  const {
    uiState,
    activeOrderIds,
    customerName,
    orderItems,
    menuItems,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    clearItems,
    setUIState,
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
    setUIState("checkout")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleConfirmOrder(name: string, contact: string) {
    setCustomerInfo(name, contact)
    setUIState("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handlePaymentComplete() {
    try {
      await submitOrder()
      // uiState is set to "track-orders" inside submitOrder
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      alert("Failed to submit order. Please try again.")
    }
  }

  // Active Orders List
  if (uiState === "track-orders") {
    return (
      <main className="relative z-10">
        <ActiveOrdersList />
      </main>
    )
  }

  // Checkout flow
  if (uiState === "checkout") {
    return (
      <main className="relative z-10">
        <CheckoutSection
          orderItems={orderItems}
          totalPrice={totalPrice}
          onBack={() => setUIState("idle")}
          onConfirm={handleConfirmOrder}
        />
      </main>
    )
  }

  // Payment flow
  if (uiState === "payment") {
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

  // Main ordering flow (Idle)
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

      <OrderSummary
        orderItems={orderItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
        onRemove={removeItem}
      />

      {/* Floating 'View Orders' button if idle & has active orders */}
      {activeOrderIds.length > 0 && uiState === "idle" && (
        <div className="fixed bottom-24 right-6 z-40 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setUIState("track-orders")}
            className="bg-secondary text-secondary-foreground font-bold py-3 px-5 rounded-full shadow-lg hover:bg-secondary/90 transition-all flex items-center gap-2 border border-border"
          >
            <Package className="w-5 h-5" />
            <span>
              {"View Orders"}
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {activeOrderIds.length}
              </span>
            </span>
          </button>
        </div>
      )}
    </main>
  )
}
