import mongoose, { Schema, type Document, type Model } from "mongoose"

export type PaymentMethod = "cash" | "card" | "mobile" | "split"

export interface ISaleItem {
  product: mongoose.Types.ObjectId
  productName: string
  productSku: string
  barcode: string
  quantity: number
  unitPrice: number
  costPrice: number
  discountPercent: number
  discountAmount: number
  taxPercent: number
  taxAmount: number
  subtotal: number
  total: number
}

export interface IPayment {
  method: PaymentMethod
  amount: number
  reference?: string
}

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId
  invoiceNumber: string
  items: ISaleItem[]
  customer?: mongoose.Types.ObjectId
  customerName?: string
  customerPhone?: string
  subtotal: number
  totalDiscount: number
  totalTax: number
  grandTotal: number
  payments: IPayment[]
  amountPaid: number
  changeAmount: number
  status: "completed" | "refunded" | "partial_refund"
  notes?: string
  cashier: mongoose.Types.ObjectId
  cashierName: string
  counter?: string
  createdAt: Date
  updatedAt: Date
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productSku: { type: String, required: true },
    barcode: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
)

const PaymentSchema = new Schema<IPayment>(
  {
    method: {
      type: String,
      enum: ["cash", "card", "mobile", "split"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    reference: String,
  },
  { _id: false },
)

const SaleSchema = new Schema<ISale>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: [(v: ISaleItem[]) => v.length > 0, "Sale must have at least one item"],
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    customerName: String,
    customerPhone: String,
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    totalTax: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    payments: [PaymentSchema],
    amountPaid: { type: Number, required: true, min: 0 },
    changeAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["completed", "refunded", "partial_refund"],
      default: "completed",
      index: true,
    },
    notes: String,
    cashier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cashierName: { type: String, required: true },
    counter: String,
  },
  {
    timestamps: true,
  },
)

// Indexes for reporting
SaleSchema.index({ createdAt: -1 })
SaleSchema.index({ cashier: 1, createdAt: -1 })
SaleSchema.index({ customer: 1, createdAt: -1 })
SaleSchema.index({ status: 1, createdAt: -1 })

export const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema)
