"use client"

import { Clock, ChefHat, CheckCircle2, XCircle } from "lucide-react"
import { type OrderData, useStore } from "@/lib/store"

interface ActiveOrderDetailsProps {
    order: OrderData
    onBack: () => void
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
    completed: {
        icon: CheckCircle2,
        label: "Completed",
        labelJp: "完了",
        description: "Thank you for your order!",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
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

const STATUS_ORDER = ["pending", "accepted", "preparing", "ready", "completed"] as const

export function ActiveOrderDetails({ order, onBack }: ActiveOrderDetailsProps) {
    const { cancelOrder } = useStore()

    // Handle cancelled status gracefully
    const activeStatus = order.status === "cancelled" ? "cancelled" :
        STATUS_ORDER.includes(order.status as any) ? order.status : "pending"

    // @ts-ignore - config is safe
    const config = STATUS_CONFIG[activeStatus] || STATUS_CONFIG.pending
    const Icon = config.icon

    // @ts-ignore
    const currentIndex = STATUS_ORDER.indexOf(activeStatus)

    return (
        <div className="min-h-screen pb-24 pt-10 px-4 max-w-lg mx-auto relative z-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    {"← Back to Orders"}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center">
                {/* Status Hero */}
                <div className={`w-full ${config.bg} ${config.border} border rounded-2xl p-8 flex flex-col items-center gap-5 mb-8 text-center shadow-sm`}>
                    <div className={`${config.color} ${activeStatus === "preparing" ? "animate-pulse-soft" : ""}`}>
                        <Icon className="w-16 h-16" />
                    </div>
                    <div>
                        <h3 className={`font-bold text-2xl ${config.color} mb-1`}>{config.label}</h3>
                        <p className="font-display text-sm tracking-widest uppercase opacity-70 mb-2">{config.labelJp}</p>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">{config.description}</p>
                    </div>
                </div>

                {/* Progress Steps (Only if not cancelled) */}
                {activeStatus !== "cancelled" && (
                    <div className="flex items-center w-full px-2 mb-10">
                        {STATUS_ORDER.slice(0, 4).map((s, i) => {
                            // @ts-ignore
                            const stepConfig = STATUS_CONFIG[s]
                            const StepIcon = stepConfig.icon
                            const isActive = i <= currentIndex
                            const isCurrentStep = i === currentIndex

                            return (
                                <div key={s} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-2 relative">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10
                        ${isActive ? `${stepConfig.bg} ${stepConfig.border} border shadow-sm` : "bg-muted border border-border"}
                        ${isCurrentStep ? "ring-2 ring-offset-2 ring-offset-background ring-current scale-110 " + stepConfig.color : ""}`}
                                        >
                                            <StepIcon className={`w-5 h-5 transition-colors duration-500 ${isActive ? stepConfig.color : "text-muted-foreground"}`} />
                                        </div>
                                    </div>
                                    {i < 3 && (
                                        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${i < currentIndex ? stepConfig.bg.replace('/10', '') : "bg-muted"}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Order Details */}
                <div className="w-full bg-card border border-border rounded-xl p-5 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                        <h4 className="font-bold text-sm">{"Order Details"}</h4>
                        <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex gap-3">
                                    <span className="font-bold w-6 text-center bg-muted rounded text-xs py-0.5">{item.qty}x</span>
                                    <span className="text-foreground/90">{item.name}</span>
                                </div>
                                <span className="text-muted-foreground">₱{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                        <span className="font-bold text-lg text-primary">₱{order.totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                {/* Cancel Button */}
                {activeStatus === "pending" && (
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to cancel this order?")) {
                                cancelOrder(order.id)
                                onBack() // Go back to list after cancelling
                            }
                        }}
                        className="w-full text-red-500 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors border border-red-200 mb-8"
                    >
                        {"Cancel Order"}
                    </button>
                )}
            </div>
        </div>
    )
}
