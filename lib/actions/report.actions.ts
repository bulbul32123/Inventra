"use server"
import { connectDB } from "@/lib/db/mongodb"
import { Sale, Product } from "@/lib/db/models"

interface DateRange {
  startDate: string
  endDate: string
}

export async function getSalesOverview(range: DateRange) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    const [salesStats, previousPeriodStats] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$grandTotal" },
            totalCost: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", { $multiply: ["$$this.costPrice", "$$this.quantity"] }] },
                },
              },
            },
            totalDiscount: { $sum: "$totalDiscount" },
            totalTax: { $sum: "$totalTax" },
            orderCount: { $sum: 1 },
            itemsSold: { $sum: { $size: "$items" } },
          },
        },
      ]),
      // Previous period for comparison
      Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
              $lt: startDate,
            },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$grandTotal" },
            orderCount: { $sum: 1 },
          },
        },
      ]),
    ])

    const current = salesStats[0] || { totalRevenue: 0, totalCost: 0, orderCount: 0, totalDiscount: 0, totalTax: 0 }
    const previous = previousPeriodStats[0] || { totalRevenue: 0, orderCount: 0 }

    const profit = current.totalRevenue - current.totalCost
    const profitMargin = current.totalRevenue > 0 ? (profit / current.totalRevenue) * 100 : 0
    const avgOrderValue = current.orderCount > 0 ? current.totalRevenue / current.orderCount : 0

    const revenueChange =
      previous.totalRevenue > 0
        ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
        : current.totalRevenue > 0
          ? 100
          : 0

    return {
      success: true,
      data: {
        totalRevenue: current.totalRevenue,
        totalProfit: profit,
        profitMargin,
        orderCount: current.orderCount,
        avgOrderValue,
        totalDiscount: current.totalDiscount,
        totalTax: current.totalTax,
        revenueChange,
      },
    }
  } catch (error) {
    console.error("Get sales overview error:", error)
    return { success: false, error: "Failed to fetch sales overview" }
  }
}

export async function getSalesTrend(range: DateRange) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Group by day for 30 days or less, by week for more
    const groupBy =
      daysDiff <= 30 ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } : { $week: "$createdAt" }

    const trend = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
          profit: {
            $sum: {
              $subtract: [
                "$grandTotal",
                {
                  $reduce: {
                    input: "$items",
                    initialValue: 0,
                    in: { $add: ["$$value", { $multiply: ["$$this.costPrice", "$$this.quantity"] }] },
                  },
                },
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return {
      success: true,
      data: trend.map((t) => ({
        date: t._id,
        revenue: t.revenue,
        orders: t.orders,
        profit: t.profit,
      })),
    }
  } catch (error) {
    console.error("Get sales trend error:", error)
    return { success: false, error: "Failed to fetch sales trend" }
  }
}

export async function getTopProducts(range: DateRange, limit = 10) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    const topProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.productName" },
          sku: { $first: "$items.productSku" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          totalProfit: {
            $sum: {
              $subtract: ["$items.total", { $multiply: ["$items.costPrice", "$items.quantity"] }],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ])

    return {
      success: true,
      data: topProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        totalSold: p.totalSold,
        totalRevenue: p.totalRevenue,
        totalProfit: p.totalProfit,
      })),
    }
  } catch (error) {
    console.error("Get top products error:", error)
    return { success: false, error: "Failed to fetch top products" }
  }
}

export async function getCategorySales(range: DateRange) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    // Get product IDs from sales
    const salesProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          revenue: { $sum: "$items.total" },
          quantity: { $sum: "$items.quantity" },
        },
      },
    ])

    // Get categories for products
    const productIds = salesProducts.map((p) => p._id)
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id category")
      .lean()

    const categoryMap = new Map(products.map((p) => [p._id.toString(), p.category]))

    // Aggregate by category
    const categoryTotals = new Map<string, { revenue: number; quantity: number }>()
    for (const sp of salesProducts) {
      const category = categoryMap.get(sp._id.toString()) || "Unknown"
      const existing = categoryTotals.get(category) || { revenue: 0, quantity: 0 }
      categoryTotals.set(category, {
        revenue: existing.revenue + sp.revenue,
        quantity: existing.quantity + sp.quantity,
      })
    }

    const result = Array.from(categoryTotals.entries())
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    return { success: true, data: result }
  } catch (error) {
    console.error("Get category sales error:", error)
    return { success: false, error: "Failed to fetch category sales" }
  }
}

export async function getPaymentMethodSummary(range: DateRange) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    const summary = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed",
        },
      },
      { $unwind: "$payments" },
      {
        $group: {
          _id: "$payments.method",
          total: { $sum: "$payments.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])

    return {
      success: true,
      data: summary.map((s) => ({
        method: s._id,
        total: s.total,
        count: s.count,
      })),
    }
  } catch (error) {
    console.error("Get payment method summary error:", error)
    return { success: false, error: "Failed to fetch payment summary" }
  }
}

export async function getCashierPerformance(range: DateRange) {
  try {
    await connectDB()

    const startDate = new Date(range.startDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(range.endDate)
    endDate.setHours(23, 59, 59, 999)

    const performance = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$cashier",
          name: { $first: "$cashierName" },
          totalSales: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$grandTotal" },
        },
      },
      { $sort: { totalSales: -1 } },
    ])

    return {
      success: true,
      data: performance.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        totalSales: p.totalSales,
        orderCount: p.orderCount,
        avgOrderValue: p.avgOrderValue,
      })),
    }
  } catch (error) {
    console.error("Get cashier performance error:", error)
    return { success: false, error: "Failed to fetch cashier performance" }
  }
}
