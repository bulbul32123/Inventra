import mongoose, { Schema, type Document, type Model } from "mongoose"

export type InventoryAction =
  | "stock_in"
  | "stock_out"
  | "sale"
  | "return"
  | "adjustment"
  | "purchase"
  | "damage"
  | "expired"

export interface IInventoryLog extends Document {
  _id: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  productName: string
  productSku: string
  action: InventoryAction
  quantityBefore: number
  quantityChange: number
  quantityAfter: number
  reason?: string
  reference?: string
  referenceType?: "sale" | "purchase" | "adjustment"
  referenceId?: mongoose.Types.ObjectId
  costPrice?: number
  performedBy: mongoose.Types.ObjectId
  performedByName: string
  createdAt: Date
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["stock_in", "stock_out", "sale", "return", "adjustment", "purchase", "damage", "expired"],
      required: true,
      index: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    reason: String,
    reference: String,
    referenceType: {
      type: String,
      enum: ["sale", "purchase", "adjustment"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    costPrice: Number,
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Compound indexes for reporting
InventoryLogSchema.index({ product: 1, createdAt: -1 })
InventoryLogSchema.index({ action: 1, createdAt: -1 })
InventoryLogSchema.index({ createdAt: -1 })

export const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog || mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema)
