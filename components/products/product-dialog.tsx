"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct, updateProduct, getCategories } from "@/lib/actions/product.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import useSWR from "swr"

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  product?: {
    _id: string
    name: string
    sku: string
    barcode: string
    category: string
    costPrice: number
    sellingPrice: number
    stock: number
    reorderLevel: number
    status: "active" | "inactive"
    description?: string
    brand?: string
    taxPercent?: number
    unit?: string
  } | null
  onSuccess: () => void
}

const defaultCategories = ["Electronics", "Clothing", "Food & Beverages", "Health & Beauty", "Home & Garden", "Other"]

export function ProductDialog({ open, onClose, product, onSuccess }: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    description: "",
    costPrice: 0,
    sellingPrice: 0,
    taxPercent: 0,
    stock: 0,
    reorderLevel: 10,
    status: "active" as "active" | "inactive",
    unit: "pcs",
  })

  const { data: categoriesData } = useSWR("categories", getCategories)
  const categories = [...new Set([...defaultCategories, ...(categoriesData?.data || [])])]

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        brand: product.brand || "",
        description: product.description || "",
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        taxPercent: product.taxPercent || 0,
        stock: product.stock,
        reorderLevel: product.reorderLevel,
        status: product.status,
        unit: product.unit || "pcs",
      })
    } else {
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        category: "",
        brand: "",
        description: "",
        costPrice: 0,
        sellingPrice: 0,
        taxPercent: 0,
        stock: 0,
        reorderLevel: 10,
        status: "active",
        unit: "pcs",
      })
    }
  }, [product, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = product ? await updateProduct(product._id, formData) : await createProduct(formData)

      if (result.success) {
        toast.success(product ? "Product updated" : "Product created")
        onSuccess()
      } else {
        toast.error(result.error || "Operation failed")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxPercent">Tax %</Label>
              <Input
                id="taxPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxPercent}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxPercent: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                disabled={!!product}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, reorderLevel: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="g">Grams</SelectItem>
                  <SelectItem value="l">Liters</SelectItem>
                  <SelectItem value="ml">Milliliters</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
