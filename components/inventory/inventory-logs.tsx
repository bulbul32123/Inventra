"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getInventoryLogs } from "@/lib/actions/inventory.actions"
import { formatDateTime } from "@/lib/utils/format"
import { ClipboardList } from "lucide-react"
import useSWR from "swr"

interface InventoryLog {
  _id: string
  productName: string
  productSku: string
  action: string
  quantityBefore: number
  quantityChange: number
  quantityAfter: number
  reason?: string
  performedByName: string
  createdAt: string
}

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  stock_in: { label: "Stock In", variant: "default" },
  stock_out: { label: "Stock Out", variant: "secondary" },
  sale: { label: "Sale", variant: "outline" },
  return: { label: "Return", variant: "default" },
  adjustment: { label: "Adjustment", variant: "secondary" },
  purchase: { label: "Purchase", variant: "default" },
  damage: { label: "Damaged", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
}

export function InventoryLogs() {
  const [action, setAction] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const { data, isLoading } = useSWR(
    ["inventory-logs", action, startDate, endDate],
    () =>
      getInventoryLogs({
        action: action === "all" ? undefined : action,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100,
      }),
    { revalidateOnFocus: false },
  )

  const logs = data?.data?.logs || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <div className="flex flex-wrap gap-4 pt-4">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="stock_in">Stock In</SelectItem>
              <SelectItem value="stock_out">Stock Out</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="damage">Damaged</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[180px]"
            placeholder="Start date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[180px]"
            placeholder="End date"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No activity logs found</h3>
            <p className="text-muted-foreground">Stock adjustments will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Before</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">After</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: InventoryLog) => {
                const actionInfo = actionLabels[log.action] || { label: log.action, variant: "outline" as const }
                return (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{log.productName}</div>
                      <div className="text-xs text-muted-foreground">{log.productSku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{log.quantityBefore}</TableCell>
                    <TableCell className="text-right">
                      <span className={log.quantityChange > 0 ? "text-green-600" : "text-red-600"}>
                        {log.quantityChange > 0 ? "+" : ""}
                        {log.quantityChange}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{log.quantityAfter}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.reason || "-"}</TableCell>
                    <TableCell>{log.performedByName}</TableCell>
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
