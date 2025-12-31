"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLowStockProducts } from "@/lib/actions/inventory.actions"
import { AlertTriangle, Package } from "lucide-react"
import useSWR from "swr"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  stock: number
  reorderLevel: number
}

export function LowStockAlerts() {
  const { data, isLoading } = useSWR("low-stock", getLowStockProducts, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  })

  const products = data?.data || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            {products.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">All stocked up!</h3>
            <p className="text-muted-foreground">No products are running low on stock.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-right">Shortage</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => {
                const shortage = product.reorderLevel - product.stock
                const isOutOfStock = product.stock === 0

                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className={isOutOfStock ? "text-red-600 font-medium" : "text-orange-500"}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{product.reorderLevel}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
                        {shortage > 0 ? `Need ${shortage}` : "At limit"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products?id=${product._id}`}>Restock</Link>
                      </Button>
                    </TableCell>
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
