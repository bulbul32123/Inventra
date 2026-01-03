import { connectDB } from "@/lib/db/mongodb"
import { Product, Sale, Customer } from "@/lib/db/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, Users, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { DashboardComponents } from "./DashboardComponents"

async function getDashboardStats() {
  await connectDB()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalProducts, lowStockCount, todaySales, totalCustomers] = await Promise.all([
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({ $expr: { $lte: ["$stock", "$reorderLevel"] }, status: "active" }),
    Sale.aggregate([
      { $match: { createdAt: { $gte: today }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
    ]),
    Customer.countDocuments(),
  ])

  const todayRevenue = todaySales[0]?.total || 0
  const todayOrders = todaySales[0]?.count || 0

  return { totalProducts, lowStockCount, todayRevenue, todayOrders, totalCustomers }
}

export async function DashboardContent() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">{stats.todayOrders} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Products need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>
      <DashboardComponents />
    </div>
  )
}

