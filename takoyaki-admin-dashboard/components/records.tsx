"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useOrders } from "@/hooks/use-store"
import { Check } from "lucide-react"

export function Records() {
  const orders = useOrders()

  const completedOrders = orders.filter((o) => o.status === "completed")

  // Calculate sales history from actual orders
  const salesData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const history = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = days[d.getDay()]
      const dateStr = d.toLocaleDateString()

      // Filter orders for this day
      const dayOrders = completedOrders.filter(o => new Date(o.timestamp).toLocaleDateString() === dateStr)
      const sales = dayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.price * i.qty), 0), 0)

      history.push({
        day: dayName,
        sales,
        orders: dayOrders.length
      })
    }
    return history
  }, [completedOrders])

  return (
    <div className="px-4 py-3 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart Section */}
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">
            Sales History
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Last 7 days</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(0 0% 18%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#FFFFFF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#FFFFFF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(0 0% 14.9%)" }}
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid hsl(0 0% 18%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  labelStyle={{ color: "#FFFFFF" }}
                  formatter={(value: number) => [`₱${value}`, "Sales"]}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {salesData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === salesData.length - 1
                          ? "hsl(1 100% 44%)"
                          : "hsl(1 100% 44% / 0.4)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Summary row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Total (7d)</p>
              <p className="text-sm font-bold text-foreground">
                {"₱"}
                {salesData
                  .reduce((sum, d) => sum + d.sales, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Orders (7d)</p>
              <p className="text-sm font-bold text-foreground">
                {salesData.reduce((sum, d) => sum + d.orders, 0)}
              </p>
            </div>
          </div>
        </section>

        {/* Today's Completed Orders */}
        <section className="bg-card border border-border rounded-xl p-4 flex flex-col h-full max-h-[400px] lg:max-h-none">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {"Today's Completed"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {completedOrders.length} orders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {completedOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[100px]">
                <p className="text-sm text-muted-foreground">
                  No completed orders yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedOrders.map((order) => {
                  const total = order.items.reduce(
                    (s, i) => s + i.price * i.qty,
                    0
                  )
                  const time = new Date(order.timestamp).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "2-digit" }
                  )
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg bg-background border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400/10">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            #{order.id.slice(0, 5)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {order.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-primary">
                          {"₱"}{total}
                        </span>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
