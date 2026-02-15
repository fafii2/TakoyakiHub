"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMenu, toggleMenuAvailability, updateMenuItemPrice } from "@/hooks/use-store"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"
import type { MenuItem } from "@/lib/types"
import { toast } from "sonner"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

const priceSchema = z.object({
  price: z
    .number({ invalid_type_error: "Enter a valid number" })
    .min(1, "Price must be at least 1")
    .max(9999, "Price is too high"),
})

type PriceForm = z.infer<typeof priceSchema>

export function MenuStock() {
  const menu = useMenu()
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground">Menu Items</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">
            {menu.filter((m) => m.available).length}/{menu.length} available
          </span>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl bg-card border border-border p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </span>
                {!item.available && (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 rounded-full px-2 py-0.5">
                    Out
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-primary font-semibold">
                  {"₱"}{item.price}
                </span>
                <button
                  onClick={() => setEditItem(item)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground active:text-foreground transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={`Edit price for ${item.name}`}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Label htmlFor={`switch-${item.id}`} className="sr-only">
                Toggle availability for {item.name}
              </Label>
              <Switch
                id={`switch-${item.id}`}
                checked={item.available}
                onCheckedChange={() => toggleMenuAvailability(item.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <EditPriceDialog
        item={editItem}
        open={!!editItem}
        onClose={() => setEditItem(null)}
      />

      <AddItemDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  )
}

function EditPriceDialog({
  item,
  open,
  onClose,
}: {
  item: MenuItem | null
  open: boolean
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PriceForm>({
    resolver: zodResolver(priceSchema),
    values: item ? { price: item.price } : undefined,
  })

  const onSubmit = (data: PriceForm) => {
    if (item) {
      updateMenuItemPrice(item.id, data.price)
      reset()
      onClose()
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Price</DialogTitle>
          <DialogDescription>
            Update the price for {item.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground">
              Price (PHP)
            </Label>
            <Input
              id="price"
              type="number"
              step="1"
              {...register("price", { valueAsNumber: true })}
              className="bg-accent text-foreground"
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-lg text-sm font-medium text-muted-foreground border border-border active:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary active:bg-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Save
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddItemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!name || !price) return
    setLoading(true)
    try {
      await addDoc(collection(db, "menu"), {
        name,
        price: Number(price),
        available: true,
      })
      toast.success("Item added")
      setName("")
      setPrice("")
      onClose()
    } catch (e) {
      toast.error("Failed to add item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cola" />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" />
          </div>
          <DialogFooter>
            <button onClick={handleAdd} disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              {loading ? "Adding..." : "Add Item"}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
