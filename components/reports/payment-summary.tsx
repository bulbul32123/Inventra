"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";

interface PaymentData {
  method: string;
  total: number;
  count: number;
}

interface PaymentSummaryProps {
  data: PaymentData[];
}

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
};

export function PaymentSummary({ data }: PaymentSummaryProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  type="category"
                  dataKey="method"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <Tooltip
                 content={<CustomTooltip text='Total'/>}
                />
                <Bar dataKey="total" fill="#caef96" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {data.map((item) => {
                const percentage =
                  totalAmount > 0 ? (item.total / totalAmount) * 100 : 0;
                return (
                  <div
                    key={item.method}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {methodIcons[item.method] || (
                        <Banknote className="h-5 w-5" />
                      )}
                      <div>
                        <div className="font-medium capitalize">
                          {item.method}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(item.count)} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(item.total)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
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
