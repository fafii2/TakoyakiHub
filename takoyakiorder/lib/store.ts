"use client"

import { useSyncExternalStore, useCallback, useEffect } from "react"
import { collection, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface MenuItem {
  id: string
  name: string
  nameJp: string
  description: string
  price: number
  image: string
  available?: boolean
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

// Order data stored locally for tracking
export interface OrderData {
  id: string
  items: { name: string; qty: number; price: number }[]
  totalPrice: number
  status: OrderStatus
  timestamp: string
}

export type OrderStatus = "idle" | "checkout" | "payment" | "pending" | "accepted" | "preparing" | "ready" | "completed" | "cancelled"
export type UIState = "idle" | "checkout" | "payment" | "track-orders"

interface Store {
  // Shopping Cart & User
  items: Map<string, OrderItem>
  customerName: string
  customerContact: string

  // App State
  uiState: UIState
  menuItems: MenuItem[]

  // Active Orders Tracking
  activeOrderIds: string[]
  orders: Record<string, OrderData>
}

let store: Store = {
  items: new Map(),
  uiState: "idle",
  customerName: "",
  customerContact: "",
  menuItems: [],
  activeOrderIds: [],
  orders: {}
}

const listeners = new Set<() => void>()

function emitChange() {
  store = { ...store, items: new Map(store.items) }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

export function useStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  // Restore session from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIds = localStorage.getItem("takoyaki_order_ids")
      const savedName = localStorage.getItem("takoyaki_customer_name")
      const savedContact = localStorage.getItem("takoyaki_customer_contact")

      if (savedIds || savedName || savedContact) {
        let parsedIds: string[] = []
        try {
          parsedIds = savedIds ? JSON.parse(savedIds) : []
        } catch (e) {
          console.error("Failed to parse saved order IDs", e)
        }

        store = {
          ...store,
          activeOrderIds: parsedIds,
          customerName: savedName || "",
          customerContact: savedContact || ""
        }
        emitChange()
      }
    }
  }, [])

  // Listen for order updates
  useEffect(() => {
    initOrderListeners(state.activeOrderIds)
  }, [JSON.stringify(state.activeOrderIds)])

  const addItem = useCallback((item: MenuItem) => {
    const existing = store.items.get(item.id)
    if (existing) {
      store.items.set(item.id, { ...existing, quantity: existing.quantity + 1 })
    } else {
      store.items.set(item.id, { menuItem: item, quantity: 1 })
    }
    emitChange()
  }, [])

  const removeItem = useCallback((itemId: string) => {
    const existing = store.items.get(itemId)
    if (existing && existing.quantity > 1) {
      store.items.set(itemId, { ...existing, quantity: existing.quantity - 1 })
    } else {
      store.items.delete(itemId)
    }
    emitChange()
  }, [])

  const clearItems = useCallback(() => {
    store.items.clear()
    store.uiState = "idle"
    // Does NOT clear active orders
    emitChange()
  }, [])

  const setUIState = useCallback((state: UIState) => {
    store = { ...store, uiState: state }
    emitChange()
  }, [])

  const setCustomerInfo = useCallback((name: string, contact: string) => {
    store = { ...store, customerName: name, customerContact: contact }
    if (typeof window !== "undefined") {
      localStorage.setItem("takoyaki_customer_name", name)
      localStorage.setItem("takoyaki_customer_contact", contact)
    }
    emitChange()
  }, [])

  const submitOrder = useCallback(async () => {
    const orderItems = Array.from(store.items.values()).map(i => ({
      name: i.menuItem.name,
      qty: i.quantity,
      price: i.menuItem.price
    }))

    const totalPrice = Array.from(store.items.values()).reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)
    const timestamp = new Date().toISOString()

    const orderData = {
      name: store.customerName,
      contactNumber: store.customerContact,
      items: orderItems,
      totalPrice,
      status: "pending",
      pickupMethod: "pickup",
      timestamp
    }

    try {
      const colRef = collection(db, "orders")
      const docRef = await addDoc(colRef, orderData)

      const newId = docRef.id
      const newActiveIds = [...store.activeOrderIds, newId]

      // Update local state immediately for responsiveness
      const newOrder: OrderData = {
        id: newId,
        items: orderItems,
        totalPrice,
        status: "pending",
        timestamp
      }

      store = {
        ...store,
        activeOrderIds: newActiveIds,
        orders: { ...store.orders, [newId]: newOrder }, // Optimistic update
        uiState: "track-orders"
      }

      // Clear cart
      store.items.clear()

      if (typeof window !== "undefined") {
        localStorage.setItem("takoyaki_order_ids", JSON.stringify(newActiveIds))
      }
      emitChange()
      return newId
    } catch (e) {
      console.error("Error submitting order", e)
      throw e
    }
  }, [])

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const docRef = doc(db, "orders", orderId)
      await updateDoc(docRef, { status: "cancelled" })
    } catch (e) {
      console.error("Error cancelling order", e)
      throw e
    }
  }, [])

  const dismissOrder = useCallback((orderId: string) => {
    const newActiveIds = store.activeOrderIds.filter(id => id !== orderId)
    const newOrders = { ...store.orders }
    delete newOrders[orderId]

    store = {
      ...store,
      activeOrderIds: newActiveIds,
      orders: newOrders
    }

    if (newActiveIds.length === 0 && store.uiState === "track-orders") {
      store.uiState = "idle"
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("takoyaki_order_ids", JSON.stringify(newActiveIds))
    }
    emitChange()
  }, [])

  const totalItems = Array.from(state.items.values()).reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = Array.from(state.items.values()).reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  )

  return {
    ...state,
    orderItems: Array.from(state.items.values()),
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    clearItems,
    setUIState,
    setCustomerInfo,
    submitOrder,
    cancelOrder,
    dismissOrder
  }
}

// ─── Firebase Listeners ───

let menuUnsub: (() => void) | null = null

export function initMenuListener() {
  if (menuUnsub) return

  const q = collection(db, "menu")
  menuUnsub = onSnapshot(q, (snapshot) => {
    const items: MenuItem[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      items.push({
        id: doc.id,
        name: data.name || "Unknown",
        nameJp: data.nameJp || "",
        description: data.description || "",
        price: data.price || 0,
        image: data.image || "/images/placeholder.jpg",
        available: data.available
      } as MenuItem)
    })
    store = { ...store, menuItems: items.filter(i => i.available !== false) }
    emitChange()
  }, (error) => {
    console.error("Error fetching menu:", error)
  })
}

// Map of orderId -> unsubscribe function
const orderUnsubs = new Map<string, () => void>()

export function initOrderListeners(orderIds: string[]) {
  // Remove listeners for IDs that are no longer active
  for (const [id, unsub] of orderUnsubs.entries()) {
    if (!orderIds.includes(id)) {
      unsub()
      orderUnsubs.delete(id)
    }
  }

  // Add listeners for new IDs
  orderIds.forEach(id => {
    if (orderUnsubs.has(id)) return // Already listening

    const docRef = doc(db, "orders", id)
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()

        // Update local order data
        const updatedOrder: OrderData = {
          id: docSnap.id,
          items: data.items || [],
          totalPrice: data.totalPrice || 0,
          status: data.status as OrderStatus,
          timestamp: data.timestamp || new Date().toISOString()
        }

        store.orders = { ...store.orders, [id]: updatedOrder }
        emitChange()
      } else {
        // Order deleted remotely
        store.orders = {
          ...store.orders,
          [id]: { ...store.orders[id], status: "cancelled" } as OrderData
        }
        emitChange()
      }
    }, (error) => {
      console.error(`Error listening to order ${id}:`, error)
    })

    orderUnsubs.set(id, unsub)
  })
}
