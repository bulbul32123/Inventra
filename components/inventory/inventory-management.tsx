"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockAdjustment } from "./stock-adjustment"
import { InventoryLogs } from "./inventory-logs"
import { LowStockAlerts } from "./low-stock-alerts"

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("adjustment")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Track stock levels, adjustments, and alerts</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="adjustment">Stock Adjustment</TabsTrigger>
          <TabsTrigger value="logs">Inventory Logs</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="adjustment" className="mt-6">
          <StockAdjustment />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <InventoryLogs />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <LowStockAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
