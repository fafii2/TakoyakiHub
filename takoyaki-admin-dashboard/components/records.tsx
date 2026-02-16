"use client"

import { useMemo, useState } from "react"
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
import { Check, Calendar, ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TimeRange = "today" | "yesterday" | "week" | "month" | "all"

export function Records() {
  const orders = useOrders()
  const [timeRange, setTimeRange] = useState<TimeRange>("today")
  const [showFullHistory, setShowFullHistory] = useState(false)

  const completedOrders = useMemo(() => orders.filter((o) => o.status === "completed").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [orders])

  // Calculate sales history for chart (always last 7 days for now, or could match filter)
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

  // Filtered orders for the list view
  const filteredOrders = useMemo(() => {
    const now = new Date()
    const today = now.toLocaleDateString()
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toLocaleDateString()

    // Reset date for calculations
    const d = new Date()

    return completedOrders.filter(o => {
      const orderDate = new Date(o.timestamp)
      const orderDateStr = orderDate.toLocaleDateString()

      if (timeRange === "today") return orderDateStr === today
      if (timeRange === "yesterday") return orderDateStr === yesterday
      if (timeRange === "week") {
        const weekAgo = new Date(d.setDate(d.getDate() - 7))
        return orderDate >= weekAgo
      }
      if (timeRange === "month") {
        const monthAgo = new Date(d.setMonth(d.getMonth() - 1))
        return orderDate >= monthAgo
      }
      return true
    })
  }, [completedOrders, timeRange])

  // Display limits
  const displayOrders = showFullHistory ? filteredOrders : filteredOrders.slice(0, 15)

  if (showFullHistory) {
    return (
      <div className="px-4 py-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFullHistory(false)}>
              ← Back
            </Button>
            <h2 className="text-xl font-bold">Full Sales History</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Calendar className="mr-2 h-4 w-4" />
                {timeRange === "today" && "Today"}
                {timeRange === "yesterday" && "Yesterday"}
                {timeRange === "week" && "Last 7 Days"}
                {timeRange === "month" && "Last 30 Days"}
                {timeRange === "all" && "All Time"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("today")}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("yesterday")}>Yesterday</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("week")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("month")}>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("all")}>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{new Date(order.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{order.name}</td>
                  <td className="px-4 py-3">
                    {order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ₱{order.items.reduce((s, i) => s + (i.price * i.qty), 0)}
                  </td>
                </tr>
              ))}
              {displayOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders found for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart Section */}
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">
                Sales History
              </h2>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
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

        {/* Filtered Orders List */}
        <section className="bg-card border border-border rounded-xl p-4 flex flex-col h-full max-h-[400px] lg:max-h-none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {timeRange === "today" && "Today's"}
                {timeRange === "yesterday" && "Yesterday's"}
                {timeRange === "week" && "This Week's"}
                {timeRange === "month" && "This Month's"}
                {timeRange === "all" && "All"} Completed
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredOrders.length} orders
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Calendar className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange("today")}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("yesterday")}>Yesterday</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("week")}>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("month")}>Last 30 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("all")}>All Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {displayOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[100px]">
                <p className="text-sm text-muted-foreground">
                  No completed orders for this period
                </p>
              </div>
            ) : (
              displayOrders.map((order) => {
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
              })
            )}
          </div>

          <div className="pt-3 mt-auto border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground justify-between"
              onClick={() => setShowFullHistory(true)}
            >
              View Full History
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
