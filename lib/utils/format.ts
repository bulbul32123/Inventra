export function formatCurrency(amount: number, symbol = "$"): string {
  return `${symbol}${amount.toFixed(2)}`
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function calculateDiscountedPrice(
  price: number,
  discountPercent: number,
  discountType: "percentage" | "fixed",
): number {
  if (discountType === "fixed") {
    return Math.max(0, price - discountPercent)
  }
  return price * (1 - discountPercent / 100)
}

export function calculateTax(price: number, taxPercent: number): number {
  return price * (taxPercent / 100)
}
