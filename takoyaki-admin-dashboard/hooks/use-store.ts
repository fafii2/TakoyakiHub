import { useSyncExternalStore, useEffect } from "react"
import { orderStore, menuStore } from "@/lib/store"
import type { Order, MenuItem, OrderStatus } from "@/lib/types" // From shared types
import { toast } from "sonner"
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// ─── Orders ───

export function useOrders() {
  const orders = useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getState,
    orderStore.getState
  )

  useEffect(() => {
    // Only set up the listener once
    let isInitialLoad = true
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"))
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Order[] = []
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Order)
      })

      // Check for new orders
      const prevOrders = orderStore.getState()
      if (!isInitialLoad && items.length > prevOrders.length) {
        // Play sound
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
        audio.play().catch(e => console.error("Audio play failed", e))
        toast.success("New Order Received!")
      }

      orderStore.setState(() => items)
      isInitialLoad = false
    }, (error) => {
      console.error("Error fetching orders:", error)
      // toast.error("Failed to sync orders") // prevent noise
    })
    return () => unsub()
  }, [])

  return orders
}

export function useOrdersByStatus(status: OrderStatus) {
  const orders = useOrders()
  return orders.filter((o) => o.status === status)
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  // Optimistic update
  const prevOrders = orderStore.getState()
  orderStore.setState((prev) =>
    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
  )

  try {
    const ref = doc(db, "orders", orderId)
    await updateDoc(ref, { status: newStatus })
    toast.success(`Order updated to ${newStatus}`)
  } catch (e) {
    console.error(e)
    toast.error("Failed to update order")
    // Revert
    orderStore.setState(() => prevOrders)
  }
}

export async function removeOrder(orderId: string) {
  const prevOrders = orderStore.getState()
  orderStore.setState((prev) => prev.filter((o) => o.id !== orderId))

  try {
    await deleteDoc(doc(db, "orders", orderId))
    toast.success("Order removed")
  } catch (e) {
    console.error(e)
    toast.error("Failed to remove order")
    orderStore.setState(() => prevOrders)
  }
}

export async function addDummyOrder() {
  // For testing
  const id = Math.floor(Math.random() * 9000) + 1000
  const customers = ["New Customer", "Guest User", "Takoyaki Lover", "Hungry Person"]
  const items = [
    { name: "Classic Takoyaki", qty: 2, price: 60 },
    { name: "Cheese Takoyaki", qty: 1, price: 75 },
    { name: "Spam Takoyaki", qty: 1, price: 85 },
  ]

  const newOrder = {
    name: customers[Math.floor(Math.random() * customers.length)],
    contactNumber: "09123456789",
    items: [items[Math.floor(Math.random() * items.length)]],
    totalPrice: 150,
    status: "pending",
    pickupMethod: "pickup",
    timestamp: new Date().toISOString()
  }

  await addDoc(collection(db, "orders"), newOrder)
}

// ─── Menu ───

export function useMenu() {
  const menu = useSyncExternalStore(
    menuStore.subscribe,
    menuStore.getState,
    menuStore.getState
  )

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items: MenuItem[] = []
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem)
      })
      // Sort by name or ID if needed, mainly stability
      menuStore.setState(() => items.sort((a, b) => a.name.localeCompare(b.name)))
    })
    return () => unsub()
  }, [])

  return menu
}

export async function toggleMenuAvailability(itemId: string) {
  const menu = menuStore.getState()
  const item = menu.find(m => m.id === itemId)
  if (!item) return

  try {
    const ref = doc(db, "menu", itemId)
    await updateDoc(ref, { available: !item.available })
  } catch (e) {
    console.error(e)
    toast.error("Failed to update menu")
  }
}

export async function updateMenuItemPrice(itemId: string, newPrice: number) {
  try {
    const ref = doc(db, "menu", itemId)
    await updateDoc(ref, { price: newPrice })
    toast.success("Price updated successfully")
  } catch (e) {
    console.error(e)
    toast.error("Failed to update price")
  }
}

// ─── Computed Values ───

export function useOrderCounts() {
  const orders = useOrders()
  const pending = orders.filter((o) => o.status === "pending").length
  const preparing = orders.filter((o) => o.status === "preparing").length
  const accepted = orders.filter((o) => o.status === "accepted").length
  return { pending, preparing, accepted }
}

export function useTotalSales() {
  const orders = useOrders()
  return orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.qty, 0), 0)
}
