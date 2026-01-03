"use client";
import useSWR from "swr";
import { getCategorySales, getTopProducts } from "@/lib/actions/report.actions";
import { useState } from "react";
import { CategoryChart } from "../reports/category-chart";
import { TopProductsTable } from "../reports/top-products-table";

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

export function DashboardComponents() {
  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange =
    preset === "custom" && customStart && customEnd
      ? { startDate: customStart, endDate: customEnd }
      : getDateRange(preset);

  const { data: topProductsData } = useSWR(["top-products", dateRange], () =>
    getTopProducts(dateRange)
  );
  const { data: categoryData } = useSWR(["category-sales", dateRange], () =>
    getCategorySales(dateRange)
  );
  return (
    <div className="flex flex-col gap-5">
      <CategoryChart data={categoryData?.data || []} />
      <TopProductsTable data={topProductsData?.data || []} />
    </div>
  );
}
