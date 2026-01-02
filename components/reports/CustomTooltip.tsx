import { formatCurrency } from "@/lib/utils/format";

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 8,
        padding: "8px 12px",
        color: "black",
      }}
    >
      <p className="text-sm font-medium">{payload[0].name}</p>
      <p className="text-sm">Revenue: {formatCurrency(payload[0].value)}</p>
    </div>
  );
};
