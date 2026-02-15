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

export type OrderStatus = "idle" | "checkout" | "payment" | "pending" | "accepted" | "preparing" | "ready" | "completed" | "cancelled"

interface Store {
  items: Map<string, OrderItem>
  status: OrderStatus
  customerName: string
  customerContact: string
  menuItems: MenuItem[]
  currentOrderId: string | null
}

let store: Store = {
  items: new Map(),
  status: "idle",
  customerName: "",
  customerContact: "",
  menuItems: [],
  currentOrderId: null,
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
      const savedId = localStorage.getItem("takoyaki_order_id")
      const savedName = localStorage.getItem("takoyaki_customer_name")
      const savedContact = localStorage.getItem("takoyaki_customer_contact")

      if (savedId || savedName || savedContact) {
        store = {
          ...store,
          currentOrderId: savedId || null,
          status: savedId ? "pending" : "idle",
          customerName: savedName || "",
          customerContact: savedContact || ""
        }
        emitChange()
      }
    }
  }, [])

  // Listen for order status updates from Firestore
  useEffect(() => {
    initOrderListener()
  }, [state.currentOrderId])

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
    store.currentOrderId = null
    store.status = "idle"
    if (typeof window !== "undefined") {
      localStorage.removeItem("takoyaki_order_id")
    }
    emitChange()
  }, [])

  const setStatus = useCallback((status: OrderStatus) => {
    store = { ...store, status }
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
    const orderData = {
      name: store.customerName,
      contactNumber: store.customerContact,
      items: Array.from(store.items.values()).map(i => ({
        name: i.menuItem.name,
        qty: i.quantity,
        price: i.menuItem.price
      })),
      totalPrice: Array.from(store.items.values()).reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
      status: "pending",
      pickupMethod: "pickup",
      timestamp: new Date().toISOString()
    }

    try {
      const colRef = collection(db, "orders")
      const docRef = await addDoc(colRef, orderData)
      store = { ...store, currentOrderId: docRef.id }
      if (typeof window !== "undefined") {
        localStorage.setItem("takoyaki_order_id", docRef.id)
      }
      emitChange()
      return docRef.id
    } catch (e) {
      console.error("Error submitting order", e)
      throw e
    }
  }, [])

  const cancelOrder = useCallback(async () => {
    if (!store.currentOrderId) return

    try {
      const docRef = doc(db, "orders", store.currentOrderId)
      await updateDoc(docRef, { status: "cancelled" })
    } catch (e) {
      console.error("Error cancelling order", e)
      throw e
    }
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
    setStatus,
    setCustomerInfo,
    submitOrder,
    cancelOrder
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

let orderUnsub: (() => void) | null = null
let lastOrderId: string | null = null

export function initOrderListener() {
  const currentId = store.currentOrderId

  if (!currentId) {
    if (orderUnsub) {
      orderUnsub()
      orderUnsub = null
      lastOrderId = null
    }
    return
  }

  if (currentId !== lastOrderId) {
    if (orderUnsub) {
      orderUnsub()
      orderUnsub = null
    }
    lastOrderId = currentId

    const docRef = doc(db, "orders", currentId)
    orderUnsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.status && data.status !== store.status) {
          const newStatus = data.status as OrderStatus
          store = { ...store, status: newStatus }

          if (newStatus === "cancelled" && typeof window !== "undefined") {
            localStorage.removeItem("takoyaki_order_id")
          }

          emitChange()
        }
      } else {
        // Order deleted by admin — treat as cancelled
        store = { ...store, status: "cancelled" }
        if (typeof window !== "undefined") {
          localStorage.removeItem("takoyaki_order_id")
        }
        emitChange()
      }
    }, (error) => {
      console.error("Error listening to order:", error)
    })
  }
}
