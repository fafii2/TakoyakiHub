"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface PaymentScreenProps {
  totalPrice: number
  customerName: string
  onPaymentComplete: () => void
}

export function PaymentScreen({ totalPrice, customerName, onPaymentComplete }: PaymentScreenProps) {
  const [copied, setCopied] = useState(false)

  const referenceNumber = `TKY-${Date.now().toString(36).toUpperCase().slice(-6)}`

  function handleCopy() {
    navigator.clipboard.writeText(referenceNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative z-10 min-h-screen px-4 py-8 md:px-8 max-w-lg mx-auto flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">{"Payment"}</h2>
        <p className="font-display text-lg text-muted-foreground">{"お支払い"}</p>
        <div className="h-px w-12 bg-primary mt-1" />
      </div>

      {/* Payment card */}
      <div className="bg-card rounded-lg border border-border p-6 w-full mb-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">{"Amount Due"}</p>
          <p className="text-4xl font-bold text-primary">{"P"}{totalPrice}</p>

          <div className="w-full border-t border-border my-2" />

          {/* QR Placeholder */}
          <div className="w-48 h-48 bg-foreground rounded-lg flex items-center justify-center">
            <div className="w-40 h-40 bg-background rounded flex flex-col items-center justify-center gap-2">
              <svg viewBox="0 0 100 100" className="w-32 h-32" fill="none">
                {/* Simplified QR-like pattern */}
                <rect x="5" y="5" width="25" height="25" rx="2" fill="hsl(var(--foreground))" />
                <rect x="70" y="5" width="25" height="25" rx="2" fill="hsl(var(--foreground))" />
                <rect x="5" y="70" width="25" height="25" rx="2" fill="hsl(var(--foreground))" />
                <rect x="10" y="10" width="15" height="15" rx="1" fill="hsl(var(--background))" />
                <rect x="75" y="10" width="15" height="15" rx="1" fill="hsl(var(--background))" />
                <rect x="10" y="75" width="15" height="15" rx="1" fill="hsl(var(--background))" />
                <rect x="14" y="14" width="7" height="7" rx="0.5" fill="hsl(var(--foreground))" />
                <rect x="79" y="14" width="7" height="7" rx="0.5" fill="hsl(var(--foreground))" />
                <rect x="14" y="79" width="7" height="7" rx="0.5" fill="hsl(var(--foreground))" />
                <rect x="35" y="5" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="45" y="5" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="55" y="5" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="35" y="15" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="50" y="15" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="35" y="35" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="45" y="40" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="55" y="35" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="40" y="50" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="55" y="50" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="70" y="40" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="80" y="50" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="90" y="40" width="5" height="5" fill="hsl(var(--foreground))" />
                <rect x="70" y="70" width="25" height="25" rx="2" stroke="hsl(var(--foreground))" strokeWidth="3" />
                <rect x="80" y="80" width="7" height="7" fill="hsl(var(--foreground))" />
              </svg>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {"Scan with your preferred payment app"}
          </p>

          <div className="w-full border-t border-border my-2" />

          {/* Reference number */}
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-xs text-muted-foreground">{"Reference Number"}</p>
            <div className="flex items-center gap-2">
              <code className="text-foreground font-mono text-sm bg-secondary px-3 py-1.5 rounded">
                {referenceNumber}
              </code>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Copy reference number"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="w-full border-t border-border my-2" />

          <p className="text-xs text-muted-foreground text-center">
            {"For: "}{customerName}
          </p>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor"/>
          </svg>
          <span>{"Secure payment"}</span>
          <span>{"\u2022"}</span>
          <span>{"Verified merchant"}</span>
        </div>
      </div>

      <button
        onClick={onPaymentComplete}
        className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-md
                   hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                   shadow-[0_0_30px_rgba(225,6,0,0.2)]"
      >
        {"I've Completed Payment"}
      </button>
    </section>
  )
}
