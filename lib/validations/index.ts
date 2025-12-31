import { z } from "zod"

// User validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["owner", "manager", "cashier"]).default("cashier"),
  phone: z.string().optional(),
})

// Product validations
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().min(1, "Barcode is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  description: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  taxPercent: z.number().min(0).max(100).default(0),
  discountPercent: z.number().min(0).default(0),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  stock: z.number().min(0).default(0),
  reorderLevel: z.number().min(0).default(10),
  supplier: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  unit: z.string().default("pcs"),
  expiryDate: z.string().datetime().optional(),
})

// Customer validations
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
})

// Supplier validations
export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
})

// Sale validations
export const saleItemSchema = z.object({
  product: z.string(),
  productName: z.string(),
  productSku: z.string(),
  barcode: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0),
  discountPercent: z.number().min(0).default(0),
  taxPercent: z.number().min(0).default(0),
})

export const paymentSchema = z.object({
  method: z.enum(["cash", "card", "mobile", "split"]),
  amount: z.number().min(0),
  reference: z.string().optional(),
})

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  customer: z.string().optional(),
  payments: z.array(paymentSchema).min(1, "At least one payment is required"),
  notes: z.string().optional(),
  counter: z.string().optional(),
})

// Inventory adjustment validation
export const inventoryAdjustmentSchema = z.object({
  productId: z.string(),
  action: z.enum(["stock_in", "stock_out", "adjustment", "damage", "expired"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  costPrice: z.number().min(0).optional(),
})

// Settings validations
export const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email().optional().or(z.literal("")),
  currency: z.string().default("USD"),
  currencySymbol: z.string().default("$"),
  invoicePrefix: z.string().default("INV"),
  barcodeFormat: z.enum(["EAN13", "CODE128", "CODE39"]).default("CODE128"),
  lowStockThreshold: z.number().min(0).default(10),
  enableLoyalty: z.boolean().default(false),
  loyaltyPointsPerCurrency: z.number().min(0).default(1),
  receiptFooter: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
export type SaleInput = z.infer<typeof saleSchema>
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
