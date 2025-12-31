"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getProductByBarcode, getProducts } from "@/lib/actions/product.actions"
import { createSale, getStoreSettings } from "@/lib/actions/sale.actions"
import { formatCurrency } from "@/lib/utils/format"
import { toast } from "sonner"
import { POSCart } from "./pos-cart"
import { POSPayment } from "./pos-payment"
import { POSReceipt } from "./pos-receipt"
import { CustomerSearch } from "./customer-search"
import { Search, Barcode, LogOut, ShoppingCart } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import Link from "next/link"
import useSWR from "swr"

interface CartItem {
  id: string
  product: string
  productName: string
  productSku: string
  barcode: string
  quantity: number
  unitPrice: number
  costPrice: number
  discountPercent: number
  taxPercent: number
  stock: number
}

interface Customer {
  _id: string
  name: string
  phone: string
}

interface POSTerminalProps {
  cashier: {
    id: string
    name: string
  }
}

export function POSTerminal({ cashier }: POSTerminalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [completedSale, setCompletedSale] = useState<{ invoiceNumber: string; saleId: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const barcodeRef = useRef<HTMLInputElement>(null)

  const { data: settingsData } = useSWR("store-settings", getStoreSettings)
  const currencySymbol = settingsData?.data?.currencySymbol || "$"

  const { data: searchResults } = useSWR(
    searchQuery.length >= 2 ? ["product-search", searchQuery] : null,
    () => getProducts({ search: searchQuery, status: "active", limit: 8 }),
    { revalidateOnFocus: false },
  )

  // Focus barcode input on mount and after actions
  useEffect(() => {
    barcodeRef.current?.focus()
  }, [cart.length, showPayment])

  // Handle barcode scanner input (keyboard wedge mode)
  const handleBarcodeSubmit = useCallback(
    async (barcode: string) => {
      if (!barcode.trim()) return

      const result = await getProductByBarcode(barcode.trim())

      if (result.success && result.data) {
        const product = result.data
        addToCart({
          id: crypto.randomUUID(),
          product: product._id,
          productName: product.name,
          productSku: product.sku,
          barcode: product.barcode,
          quantity: 1,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          discountPercent: product.discountPercent || 0,
          taxPercent: product.taxPercent || 0,
          stock: product.stock,
        })
        toast.success(`Added: ${product.name}`)
      } else {
        toast.error("Product not found")
      }

      setBarcodeInput("")
    },
    [cart],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Focus barcode input
      if (e.key === "F2") {
        e.preventDefault()
        barcodeRef.current?.focus()
      }
      // F4 - Checkout
      if (e.key === "F4" && cart.length > 0 && !showPayment) {
        e.preventDefault()
        setShowPayment(true)
      }
      // Escape - Close payment / Clear
      if (e.key === "Escape") {
        if (showPayment) {
          setShowPayment(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cart.length, showPayment])

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product === item.product)
      if (existing) {
        // Check stock
        if (existing.quantity >= existing.stock) {
          toast.error("Insufficient stock")
          return prev
        }
        return prev.map((i) => (i.product === item.product ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, item]
    })
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item && quantity > item.stock) {
        toast.error("Insufficient stock")
        return prev
      }
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== id)
      }
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    })
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  function clearCart() {
    setCart([])
    setSelectedCustomer(null)
    setShowPayment(false)
  }

  function addProductFromSearch(product: {
    _id: string
    name: string
    sku: string
    barcode: string
    sellingPrice: number
    costPrice: number
    discountPercent: number
    taxPercent: number
    stock: number
  }) {
    if (product.stock <= 0) {
      toast.error("Product is out of stock")
      return
    }

    addToCart({
      id: crypto.randomUUID(),
      product: product._id,
      productName: product.name,
      productSku: product.sku,
      barcode: product.barcode,
      quantity: 1,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice,
      discountPercent: product.discountPercent || 0,
      taxPercent: product.taxPercent || 0,
      stock: product.stock,
    })
    setSearchQuery("")
  }

  async function handlePayment(payments: { method: "cash" | "card" | "mobile"; amount: number; reference?: string }[]) {
    setIsProcessing(true)

    const result = await createSale({
      items: cart.map((item) => ({
        product: item.product,
        productName: item.productName,
        productSku: item.productSku,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        discountPercent: item.discountPercent,
        taxPercent: item.taxPercent,
      })),
      customer: selectedCustomer?._id,
      payments,
    })

    setIsProcessing(false)

    if (result.success && result.data) {
      setCompletedSale(result.data)
      toast.success(`Sale completed: ${result.data.invoiceNumber}`)
    } else {
      toast.error(result.error || "Failed to process sale")
    }
  }

  function handleNewSale() {
    setCompletedSale(null)
    clearCart()
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalDiscount = cart.reduce((sum, item) => {
    const itemSubtotal = item.unitPrice * item.quantity
    return sum + (itemSubtotal * item.discountPercent) / 100
  }, 0)
  const totalTax = cart.reduce((sum, item) => {
    const itemSubtotal = item.unitPrice * item.quantity
    const afterDiscount = itemSubtotal - (itemSubtotal * item.discountPercent) / 100
    return sum + (afterDiscount * item.taxPercent) / 100
  }, 0)
  const grandTotal = subtotal - totalDiscount + totalTax

  if (completedSale) {
    return <POSReceipt saleId={completedSale.saleId} onNewSale={handleNewSale} currencySymbol={currencySymbol} />
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span>POS</span>
          </Link>
          <span className="text-sm text-muted-foreground">Cashier: {cashier.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">F2: Scan | F4: Checkout | ESC: Back</span>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Search & Scanner */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Barcode Scanner Input */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                placeholder="Scan barcode or press F2..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBarcodeSubmit(barcodeInput)
                  }
                }}
                className="pl-9 text-lg h-12"
                autoFocus
              />
            </div>
          </div>

          {/* Product Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && searchResults?.data?.products && (
            <Card className="mb-4">
              <CardContent className="p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {searchResults.data.products.map(
                    (product: {
                      _id: string
                      name: string
                      sku: string
                      barcode: string
                      sellingPrice: number
                      costPrice: number
                      discountPercent: number
                      taxPercent: number
                      stock: number
                    }) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => addProductFromSearch(product)}
                        disabled={product.stock <= 0}
                        className="p-3 text-left border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold">{formatCurrency(product.sellingPrice, currencySymbol)}</span>
                          <span className={`text-xs ${product.stock <= 0 ? "text-red-500" : "text-muted-foreground"}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cart */}
          <div className="flex-1 overflow-hidden">
            <POSCart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              currencySymbol={currencySymbol}
            />
          </div>
        </div>

        {/* Right Panel - Summary & Payment */}
        <div className="w-96 border-l bg-card flex flex-col">
          {/* Customer Selection */}
          <div className="p-4 border-b">
            <CustomerSearch selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />
          </div>

          {/* Order Summary */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currencySymbol)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(totalDiscount, currencySymbol)}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(totalTax, currencySymbol)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal, currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t space-y-2">
            <Button className="w-full h-12 text-lg" disabled={cart.length === 0} onClick={() => setShowPayment(true)}>
              Checkout (F4)
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <POSPayment
          total={grandTotal}
          currencySymbol={currencySymbol}
          onPayment={handlePayment}
          onCancel={() => setShowPayment(false)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}
