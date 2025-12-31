// Barcode generation utilities
export function generateBarcode(format: "EAN13" | "CODE128" | "CODE39" = "CODE128"): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  switch (format) {
    case "EAN13":
      // Generate 12 digits, 13th is checksum
      const digits = timestamp.slice(-11) + random.slice(0, 1)
      const checksum = calculateEAN13Checksum(digits)
      return digits + checksum
    case "CODE39":
      return `*${timestamp.slice(-8)}${random}*`
    case "CODE128":
    default:
      return `${timestamp.slice(-10)}${random}`
  }
}

function calculateEAN13Checksum(digits: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(digits[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const checksum = (10 - (sum % 10)) % 10
  return checksum.toString()
}

export function generateSKU(category: string, index: number): string {
  const prefix = category.slice(0, 3).toUpperCase()
  const timestamp = Date.now().toString().slice(-4)
  const paddedIndex = index.toString().padStart(4, "0")
  return `${prefix}-${timestamp}-${paddedIndex}`
}

export function generateInvoiceNumber(prefix: string, nextNumber: number): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const paddedNumber = nextNumber.toString().padStart(6, "0")
  return `${prefix}-${year}${month}${day}-${paddedNumber}`
}
