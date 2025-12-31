"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSaleById, getStoreSettings } from "@/lib/actions/sale.actions"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"
import { Printer, Plus, CheckCircle } from "lucide-react"
import useSWR from "swr"

interface POSReceiptProps {
  saleId: string
  onNewSale: () => void
  currencySymbol: string
}

export function POSReceipt({ saleId, onNewSale, currencySymbol }: POSReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const { data: saleData } = useSWR(["sale", saleId], () => getSaleById(saleId))
  const { data: settingsData } = useSWR("store-settings", getStoreSettings)

  const sale = saleData?.data
  const settings = settingsData?.data

  function handlePrint() {
    const content = receiptRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${sale?.invoiceNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (!sale) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {/* Success Header */}
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">Invoice: {sale.invoiceNumber}</p>
          </div>

          {/* Receipt Preview */}
          <div ref={receiptRef} className="bg-white text-black p-4 rounded border text-sm font-mono">
            <div className="text-center mb-4">
              <div className="font-bold text-lg">{settings?.storeName || "My Store"}</div>
              {settings?.storeAddress && <div>{settings.storeAddress}</div>}
              {settings?.storePhone && <div>Tel: {settings.storePhone}</div>}
            </div>

            <Separator className="my-2 border-dashed" />

            <div className="mb-2">
              <div>Invoice: {sale.invoiceNumber}</div>
              <div>Date: {formatDateTime(sale.createdAt)}</div>
              <div>Cashier: {sale.cashierName}</div>
              {sale.customerName && <div>Customer: {sale.customerName}</div>}
            </div>

            <Separator className="my-2 border-dashed" />

            <table className="w-full">
              <tbody>
                {sale.items.map(
                  (
                    item: { productName: string; quantity: number; unitPrice: number; total: number },
                    index: number,
                  ) => (
                    <tr key={index}>
                      <td className="align-top">{item.productName}</td>
                      <td className="text-right align-top whitespace-nowrap">
                        {item.quantity} x {formatCurrency(item.unitPrice, currencySymbol)}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            <Separator className="my-2 border-dashed" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal, currencySymbol)}</span>
              </div>
              {sale.totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(sale.totalDiscount, currencySymbol)}</span>
                </div>
              )}
              {sale.totalTax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(sale.totalTax, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>TOTAL</span>
                <span>{formatCurrency(sale.grandTotal, currencySymbol)}</span>
              </div>
            </div>

            <Separator className="my-2 border-dashed" />

            <div className="space-y-1">
              {sale.payments.map((payment: { method: string; amount: number }, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{payment.method.toUpperCase()}</span>
                  <span>{formatCurrency(payment.amount, currencySymbol)}</span>
                </div>
              ))}
              {sale.changeAmount > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change</span>
                  <span>{formatCurrency(sale.changeAmount, currencySymbol)}</span>
                </div>
              )}
            </div>

            <Separator className="my-2 border-dashed" />

            <div className="text-center text-xs">{settings?.receiptFooter || "Thank you for your purchase!"}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            <Button className="flex-1" onClick={onNewSale}>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
