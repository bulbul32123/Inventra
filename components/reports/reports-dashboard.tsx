"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSalesOverview,
  getSalesTrend,
  getTopProducts,
  getCategorySales,
  getPaymentMethodSummary,
  getCashierPerformance,
} from "@/lib/actions/report.actions";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
} from "@/lib/utils/format";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { SalesTrendChart } from "./sales-trend-chart";
import { CategoryChart } from "./category-chart";
import { TopProductsTable } from "./top-products-table";
import { PaymentSummary } from "./payment-summary";
import { CashierPerformance } from "./cashier-performance";
import useSWR from "swr";

function getDateRange(preset: string) {
  const today = new Date();
  const startDate = new Date();

  switch (preset) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(today.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(today.getMonth() - 1);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
}

export function ReportsDashboard() {
  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange =
    preset === "custom" && customStart && customEnd
      ? { startDate: customStart, endDate: customEnd }
      : getDateRange(preset);

  const { data: overviewData } = useSWR(["sales-overview", dateRange], () =>
    getSalesOverview(dateRange)
  );
  const { data: trendData } = useSWR(["sales-trend", dateRange], () =>
    getSalesTrend(dateRange)
  );
  const { data: topProductsData } = useSWR(["top-products", dateRange], () =>
    getTopProducts(dateRange)
  );
  const { data: categoryData } = useSWR(["category-sales", dateRange], () =>
    getCategorySales(dateRange)
  );
  const { data: paymentData } = useSWR(["payment-summary", dateRange], () =>
    getPaymentMethodSummary(dateRange)
  );
  const { data: cashierData } = useSWR(["cashier-performance", dateRange], () =>
    getCashierPerformance(dateRange)
  );

  const overview = overviewData?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Business performance insights</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {["today", "week", "month", "quarter", "year"].map((p) => (
              <Button
                key={p}
                variant={preset === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(p)}
                className={preset !== p ? "bg-transparent" : ""}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => {
                setCustomStart(e.target.value);
                if (e.target.value && customEnd) setPreset("custom");
              }}
              className="w-36"
            />
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value);
                if (customStart && e.target.value) setPreset("custom");
              }}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-xs mt-1">
              {(overview?.revenueChange || 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  (overview?.revenueChange || 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercent(Math.abs(overview?.revenueChange || 0))}
              </span>
              <span className="text-muted-foreground ml-1">
                vs previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.totalProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(overview?.profitMargin || 0)} margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(overview?.orderCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(overview?.avgOrderValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Discounts Given
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview?.totalDiscount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tax collected: {formatCurrency(overview?.totalTax || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend" className="space-y-4 overflow-y-hidden">
        <TabsList className="bg-primary/40 md:gap-2 ">
          <TabsTrigger className="cursor-pointer" value="trend">Sales Trend</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="categories">Categories</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="products">Top Products</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="payments">Payments</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="cashiers">Cashier Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <SalesTrendChart data={trendData?.data || []} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryChart data={categoryData?.data || []} />
        </TabsContent>

        <TabsContent value="products">
          <TopProductsTable data={topProductsData?.data || []} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSummary data={paymentData?.data || []} />
        </TabsContent>

        <TabsContent value="cashiers">
          <CashierPerformance data={cashierData?.data || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
