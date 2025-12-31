"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProducts } from "@/lib/actions/product.actions"
import { adjustInventory } from "@/lib/actions/inventory.actions"
import { toast } from "sonner"
import { Loader2, Search, Package } from "lucide-react"
import useSWR from "swr"

interface Product {
  _id: string
  name: string
  sku: string
  barcode: string
  stock: number
  costPrice: number
}

export function StockAdjustment() {
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    action: "stock_in" as "stock_in" | "stock_out" | "adjustment" | "damage" | "expired",
    quantity: 1,
    reason: "",
    costPrice: 0,
  })

  const { data } = useSWR(search ? ["products-search", search] : null, () => getProducts({ search, limit: 10 }), {
    revalidateOnFocus: false,
  })

  const products = data?.data?.products || []

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product)
    setFormData((prev) => ({ ...prev, costPrice: product.costPrice }))
    setSearch("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return

    setIsLoading(true)

    const result = await adjustInventory({
      productId: selectedProduct._id,
      ...formData,
    })

    if (result.success) {
      toast.success("Stock adjusted successfully")
      setSelectedProduct(null)
      setFormData({ action: "stock_in", quantity: 1, reason: "", costPrice: 0 })
    } else {
      toast.error(result.error || "Failed to adjust stock")
    }

    setIsLoading(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {search && products.length > 0 && (
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {products.map((product: Product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU: {product.sku} | Stock: {product.stock}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU: {selectedProduct.sku} | Current Stock:{" "}
                    <span className="font-medium text-foreground">{selectedProduct.stock}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select
                value={formData.action}
                onValueChange={(value: typeof formData.action) => setFormData((prev) => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_in">Stock In (Add)</SelectItem>
                  <SelectItem value="stock_out">Stock Out (Remove)</SelectItem>
                  <SelectItem value="adjustment">Adjustment (Correction)</SelectItem>
                  <SelectItem value="damage">Damaged</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                required
              />
            </div>

            {formData.action === "stock_in" && (
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price (Optional)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: Number(e.target.value) }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for adjustment..."
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={!selectedProduct || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Apply Adjustment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
