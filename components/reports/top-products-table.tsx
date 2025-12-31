"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/utils/format"

interface ProductData {
  id: string
  name: string
  sku: string
  totalSold: number
  totalRevenue: number
  totalProfit: number
}

interface TopProductsTableProps {
  data: ProductData[]
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">No data available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product, index) => {
                const margin = product.totalRevenue > 0 ? (product.totalProfit / product.totalRevenue) * 100 : 0
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(product.totalSold)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.totalRevenue)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(product.totalProfit)}</TableCell>
                    <TableCell className="text-right">{margin.toFixed(1)}%</TableCell>
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
