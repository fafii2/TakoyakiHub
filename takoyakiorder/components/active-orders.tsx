"use client"

import { Clock, ChefHat, CheckCircle2, XCircle, Trash2, X } from "lucide-react"
import { useStore, type OrderStatus } from "@/lib/store"
import { useState } from "react"
import { ActiveOrderDetails } from "./active-order-details"

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        label: "Awaiting Confirmation",
        labelJp: "確認待ち",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
    },
    accepted: {
        icon: ChefHat,
        label: "Order Confirmed",
        labelJp: "注文確認済み",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
    },
    preparing: {
        icon: ChefHat,
        label: "Preparing",
        labelJp: "調理中",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
    },
    ready: {
        icon: CheckCircle2,
        label: "Ready for Pickup",
        labelJp: "完成",
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
    },
    completed: {
        icon: CheckCircle2,
        label: "Completed",
        labelJp: "完了",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
    },
    cancelled: {
        icon: XCircle,
        label: "Order Rejected",
        labelJp: "注文拒否",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
    },
    idle: {
        icon: Clock,
        label: "Unknown",
        labelJp: "",
        color: "text-gray-500",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
    },
    checkout: {
        icon: Clock,
        label: "Checkout",
        labelJp: "",
        color: "text-gray-500",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
    },
    payment: {
        icon: Clock,
        label: "Payment",
        labelJp: "",
        color: "text-gray-500",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
    }
} as const

export function ActiveOrdersList() {
    const { activeOrderIds, orders, setUIState, dismissOrder } = useStore()
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

    // Sort orders by timestamp (newest first)
    const sortedOrders = activeOrderIds
        .map(id => orders[id])
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Detail View
    if (selectedOrderId) {
        const order = orders[selectedOrderId]
        if (!order) {
            setSelectedOrderId(null) // Order gone?
            return null
        }
        return <ActiveOrderDetails order={order} onBack={() => setSelectedOrderId(null)} />
    }

    // Empty State
    if (sortedOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">{"No Active Orders"}</h3>
                <p className="text-muted-foreground mt-2">{"You rarely have empty hands in a takoyaki shop!"}</p>
                <button
                    onClick={() => setUIState("idle")}
                    className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium"
                >
                    {"Order Some Takoyaki"}
                </button>
            </div>
        )
    }

    // List View
    return (
        <div className="min-h-screen pb-24 pt-20 px-4 max-w-lg mx-auto relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-display text-2xl font-bold">{"Your Orders"}</h2>
                    <p className="text-sm text-muted-foreground">{"Track your delicious takoyaki"}</p>
                </div>
                <button
                    onClick={() => setUIState("idle")}
                    className="bg-secondary/50 p-2 rounded-full hover:bg-secondary transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {sortedOrders.map((order) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.idle
                    const Icon = config.icon
                    const isFinalState = ["completed", "cancelled", "ready"].includes(order.status)

                    return (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`rounded-xl border p-5 ${config.bg} ${config.border} relative overflow-hidden transition-all cursor-pointer hover:shadow-md active:scale-[0.99]`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-background/50 ${config.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-sm ${config.color}`}>{config.label}</h3>
                                        <p className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">
                                            {config.labelJp}
                                        </p>
                                    </div>
                                </div>
                                {isFinalState && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            dismissOrder(order.id)
                                        }}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2 -mt-2 opacity-70 hover:opacity-100 z-10"
                                        title="Dismiss Order"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Items Summary */}
                            <div className="bg-background/40 rounded-lg p-3 mb-3 space-y-1 pointe-events-none">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-foreground/90">
                                            <span className="font-medium mr-1">{item.qty}x</span>
                                            {item.name}
                                        </span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="text-xs text-muted-foreground pt-1">
                                        {`+ ${order.items.length - 3} more items`}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-black/5">
                                <span className="text-xs text-muted-foreground">
                                    Order #{order.id.slice(-4).toUpperCase()}
                                </span>
                                {/* View Details removed */}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => setUIState("idle")}
                    className="text-primary hover:underline text-sm font-medium"
                >
                    {"+ Order More"}
                </button>
            </div>
        </div>
    )
}
