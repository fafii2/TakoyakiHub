"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import type { OrderItem } from "@/lib/store"

interface CheckoutSectionProps {
  orderItems: OrderItem[]
  totalPrice: number
  onBack: () => void
  onConfirm: (name: string, contact: string) => void
}

export function CheckoutSection({ orderItems, totalPrice, onBack, onConfirm }: CheckoutSectionProps) {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: { name?: string; contact?: string } = {}
    if (!name.trim()) newErrors.name = "Name is required"
    if (!contact.trim()) newErrors.contact = "Contact number is required"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onConfirm(name.trim(), contact.trim())
  }

  return (
    <section className="relative z-10 min-h-screen px-4 py-8 md:px-8 max-w-lg mx-auto flex flex-col">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{"Back to Menu"}</span>
      </button>

      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">{"Checkout"}</h2>
        <p className="font-display text-lg text-muted-foreground">{"お会計"}</p>
        <div className="h-px w-12 bg-primary mt-1" />
      </div>

      {/* Order summary */}
      <div className="bg-card rounded-lg border border-border p-5 mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3">{"Order Summary"}</h3>
        <div className="flex flex-col gap-2">
          {orderItems.map((oi) => (
            <div key={oi.menuItem.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {oi.quantity}x {oi.menuItem.name}
              </span>
              <span className="text-foreground font-medium">{"P"}{oi.menuItem.price * oi.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between">
          <span className="text-foreground font-bold">{"Total"}</span>
          <span className="text-primary font-bold text-lg">{"P"}{totalPrice}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {"Name"}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            placeholder="Your name"
            className="bg-secondary text-foreground px-4 py-3 rounded-md border border-border
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                       focus:border-primary transition-all"
          />
          {errors.name && <span className="text-xs text-primary">{errors.name}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact" className="text-sm font-medium text-foreground">
            {"Contact Number"}
          </label>
          <input
            id="contact"
            type="tel"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value)
              if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }))
            }}
            placeholder="09XX XXX XXXX"
            className="bg-secondary text-foreground px-4 py-3 rounded-md border border-border
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                       focus:border-primary transition-all"
          />
          {errors.contact && <span className="text-xs text-primary">{errors.contact}</span>}
        </div>

        <div className="flex-1" />

        <button
          type="submit"
          className="mt-4 bg-primary text-primary-foreground font-bold text-lg py-4 rounded-md
                     hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                     shadow-[0_0_30px_rgba(225,6,0,0.2)]"
        >
          Confirm Order
        </button>
      </form>
    </section>
  )
}
