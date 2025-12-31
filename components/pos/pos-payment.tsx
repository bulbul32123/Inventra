"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils/format"
import { Loader2, Banknote, CreditCard, Smartphone } from "lucide-react"

interface POSPaymentProps {
  total: number
  currencySymbol: string
  onPayment: (payments: { method: "cash" | "card" | "mobile"; amount: number; reference?: string }[]) => void
  onCancel: () => void
  isProcessing: boolean
}

export function POSPayment({ total, currencySymbol, onPayment, onCancel, isProcessing }: POSPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [cashAmount, setCashAmount] = useState(total.toString())
  const [cardReference, setCardReference] = useState("")
  const [mobileReference, setMobileReference] = useState("")

  const cashAmountNum = Number.parseFloat(cashAmount) || 0
  const changeAmount = Math.max(0, cashAmountNum - total)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (paymentMethod === "cash" && cashAmountNum < total) {
      return
    }

    const payment = {
      method: paymentMethod,
      amount: paymentMethod === "cash" ? cashAmountNum : total,
      reference: paymentMethod === "card" ? cardReference : paymentMethod === "mobile" ? mobileReference : undefined,
    }

    onPayment([payment])
  }

  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="text-center py-4 bg-muted rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-3xl font-bold">{formatCurrency(total, currencySymbol)}</p>
        </div>

        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="cash" className="gap-2">
              <Banknote className="h-4 w-4" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4">
            <TabsContent value="cash" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="text-xl h-12"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.slice(0, 5).map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCashAmount(amount.toString())}
                  >
                    {formatCurrency(amount, currencySymbol)}
                  </Button>
                ))}
              </div>

              {cashAmountNum >= total && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Change</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(changeAmount, currencySymbol)}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Reference / Last 4 Digits</Label>
                <Input
                  placeholder="Optional"
                  value={cardReference}
                  onChange={(e) => setCardReference(e.target.value)}
                  autoFocus
                />
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input
                  placeholder="Optional"
                  value={mobileReference}
                  onChange={(e) => setMobileReference(e.target.value)}
                  autoFocus
                />
              </div>
            </TabsContent>

            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isProcessing || (paymentMethod === "cash" && cashAmountNum < total)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Sale"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
