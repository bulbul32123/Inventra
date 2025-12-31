"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, formatNumber } from "@/lib/utils/format"

interface CashierData {
  id: string
  name: string
  totalSales: number
  orderCount: number
  avgOrderValue: number
}

interface CashierPerformanceProps {
  data: CashierData[]
}

export function CashierPerformance({ data }: CashierPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashier Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">No data available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Avg Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cashier, index) => {
                const initials = cashier.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <TableRow key={cashier.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{cashier.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(cashier.totalSales)}</TableCell>
                    <TableCell className="text-right">{formatNumber(cashier.orderCount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cashier.avgOrderValue)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
