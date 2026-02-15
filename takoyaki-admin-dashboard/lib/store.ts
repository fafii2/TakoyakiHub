import type { Order, MenuItem, OrderStatus } from "./types"
export type { Order, MenuItem, OrderStatus }

// ─── Store with useSyncExternalStore pattern ───

type Listener = () => void

function createStore<T>(initialState: T) {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,
    setState: (updater: (prev: T) => T) => {
      state = updater(state)
      listeners.forEach((l) => l())
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const orderStore = createStore<Order[]>([])
export const menuStore = createStore<MenuItem[]>([])
