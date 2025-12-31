"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils/format"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"

interface CartItem {
  id: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxPercent: number
  stock: number
}

interface POSCartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  currencySymbol: string
}

export function POSCart({ items, onUpdateQuantity, onRemove, currencySymbol }: POSCartProps) {
  if (items.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Cart is empty</h3>
          <p className="text-muted-foreground">Scan a barcode or search for products</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Cart ({items.length} items)</span>
          <span className="text-sm font-normal text-muted-foreground">
            {items.reduce((sum, item) => sum + item.quantity, 0)} units
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="divide-y">
            {items.map((item) => {
              const itemTotal = item.unitPrice * item.quantity
              const discountAmount = (itemTotal * item.discountPercent) / 100

              return (
                <div key={item.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.productSku}</div>
                      <div className="text-sm mt-1">
                        {formatCurrency(item.unitPrice, currencySymbol)} x {item.quantity}
                        {item.discountPercent > 0 && (
                          <span className="text-green-600 ml-2">(-{item.discountPercent}%)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(itemTotal - discountAmount, currencySymbol)}</div>
                      {item.discountPercent > 0 && (
                        <div className="text-xs line-through text-muted-foreground">
                          {formatCurrency(itemTotal, currencySymbol)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="h-8 w-16 text-center"
                        min={1}
                        max={item.stock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onRemove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {item.quantity >= item.stock && <p className="text-xs text-orange-500 mt-1">Max stock reached</p>}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
