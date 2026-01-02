"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import { CustomTooltip } from "./CustomTooltip";

interface CategoryData {
  category: string;
  revenue: number;
  quantity: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const COLORS = ["#caef96", "#a4e8eb", "#fcd3e2", "#f7eb9d", "#e8c7ae","8eb8f2"];

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={160}
                  fill="#ffffff"
                  dataKey="revenue"
                  nameKey="category"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.revenue / total) * 100 : 0;
                return (
                  <div
                    key={item.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(item.revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% | {item.quantity} items
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
