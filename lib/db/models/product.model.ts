import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IProductVariant {
  name: string
  sku: string
  barcode: string
  costPrice: number
  sellingPrice: number
  stock: number
  attributes: Record<string, string>
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  sku: string
  barcode: string
  category: string
  brand?: string
  description?: string
  costPrice: number
  sellingPrice: number
  taxPercent: number
  discountPercent: number
  discountType: "percentage" | "fixed"
  stock: number
  reorderLevel: number
  supplier?: mongoose.Types.ObjectId
  status: "active" | "inactive"
  hasVariants: boolean
  variants: IProductVariant[]
  images: string[]
  unit: string
  expiryDate?: Date
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    barcode: { type: String, required: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    attributes: { type: Map, of: String },
  },
  { _id: true },
)

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    description: String,
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [ProductVariantSchema],
    images: [String],
    unit: {
      type: String,
      default: "pcs",
    },
    expiryDate: Date,
  },
  {
    timestamps: true,
  },
)

// Compound indexes for common queries
ProductSchema.index({ category: 1, status: 1 })
ProductSchema.index({ stock: 1, reorderLevel: 1 })
ProductSchema.index({ name: "text", sku: "text", barcode: "text" })

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
