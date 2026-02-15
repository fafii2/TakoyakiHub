"use client"

import { Clock, ChefHat, CheckCircle2, XCircle } from "lucide-react"
import type { OrderStatus as OrderStatusType } from "@/lib/store"

interface OrderStatusProps {
  status: OrderStatusType
  customerName: string
  onNewOrder: () => void
  onBackToMenu: () => void
  onCancelOrder: () => void
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Awaiting Confirmation",
    labelJp: "確認待ち",
    description: "Waiting for the restaurant to confirm your order.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  accepted: {
    icon: ChefHat,
    label: "Order Confirmed",
    labelJp: "注文確認済み",
    description: "Your order has been accepted and will be prepared shortly.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  preparing: {
    icon: ChefHat,
    label: "Preparing",
    labelJp: "調理中",
    description: "Your takoyaki is being freshly prepared!",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready for Pickup",
    labelJp: "完成",
    description: "Your order is ready! Come and get it.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  cancelled: {
    icon: XCircle,
    label: "Order Rejected",
    labelJp: "注文拒否",
    description: "Sorry, your order could not be fulfilled at this time.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
} as const

type ActiveStatus = "pending" | "accepted" | "preparing" | "ready" | "cancelled"

const STATUS_ORDER: ActiveStatus[] = ["pending", "accepted", "preparing", "ready"]

export function OrderStatusScreen({ status, customerName, onNewOrder, onBackToMenu, onCancelOrder }: OrderStatusProps) {
  const activeStatus = status === "pending" || status === "accepted" || status === "preparing" || status === "ready" || status === "cancelled"
    ? status
    : "pending"

  const config = STATUS_CONFIG[activeStatus]
  const Icon = config.icon
  const currentIndex = STATUS_ORDER.indexOf(activeStatus)

  return (
    <section className="relative z-10 min-h-screen px-4 py-8 md:px-8 max-w-lg mx-auto flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">{"Order Status"}</h2>
        <p className="font-display text-lg text-muted-foreground">{"注文状況"}</p>
        <div className="h-px w-12 bg-primary mt-1" />
        <button
          onClick={onBackToMenu}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {"← Back to Menu"}
        </button>
      </div>

      {/* Greeting */}
      <p className="text-muted-foreground text-sm mb-8">
        {"Thank you, "}<span className="text-foreground font-medium">{customerName}</span>{"!"}
      </p>

      {/* Current status */}
      <div className={`${config.bg} ${config.border} border rounded-xl p-8 w-full flex flex-col items-center gap-4 mb-10`}>
        <div className={`${config.color} ${activeStatus === "preparing" ? "animate-pulse-soft" : ""}`}>
          <Icon className="w-12 h-12" />
        </div>
        <h3 className={`font-bold text-xl ${config.color}`}>{config.label}</h3>
        <p className="font-display text-sm text-muted-foreground">{config.labelJp}</p>
        <p className="text-muted-foreground text-sm text-center">{config.description}</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center w-full max-w-xs mb-10">
        {STATUS_ORDER.map((s, i) => {
          const stepConfig = STATUS_CONFIG[s]
          const StepIcon = stepConfig.icon
          const isActive = i <= currentIndex
          const isCurrentStep = i === currentIndex

          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive ? `${stepConfig.bg} ${stepConfig.border} border` : "bg-secondary border border-border"}
                    ${isCurrentStep ? "ring-2 ring-offset-2 ring-offset-background ring-current " + stepConfig.color : ""}`}
                >
                  <StepIcon className={`w-5 h-5 transition-colors duration-500 ${isActive ? stepConfig.color : "text-muted-foreground"}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {stepConfig.label}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 transition-colors duration-500 ${i < currentIndex ? "bg-foreground/30" : "bg-border"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Cancel Order Button (Only when pending) */}
      {activeStatus === "pending" && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to cancel your order?")) {
              onCancelOrder()
            }
          }}
          className="w-full mb-4 text-red-500 font-medium py-3 rounded-md hover:bg-red-50 transition-colors border border-red-200"
        >
          Cancel Order
        </button>
      )}

      {/* New order button (only when ready or cancelled) */}
      {(activeStatus === "ready" || activeStatus === "cancelled") && (
        <button
          onClick={onNewOrder}
          className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-md
                     hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                     shadow-[0_0_30px_rgba(225,6,0,0.2)] animate-slide-up"
        >
          Order Again
        </button>
      )}
    </section>
  )
}
