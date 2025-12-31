import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ITaxRule {
  name: string
  rate: number
  isDefault: boolean
}

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId
  storeName: string
  storeAddress?: string
  storePhone?: string
  storeEmail?: string
  storeLogo?: string
  currency: string
  currencySymbol: string
  taxRules: ITaxRule[]
  invoicePrefix: string
  invoiceNextNumber: number
  barcodeFormat: "EAN13" | "CODE128" | "CODE39"
  lowStockThreshold: number
  enableLoyalty: boolean
  loyaltyPointsPerCurrency: number
  receiptFooter?: string
  updatedAt: Date
}

const TaxRuleSchema = new Schema<ITaxRule>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
)

const SettingsSchema = new Schema<ISettings>(
  {
    storeName: {
      type: String,
      required: true,
      default: "My Store",
    },
    storeAddress: String,
    storePhone: String,
    storeEmail: String,
    storeLogo: String,
    currency: {
      type: String,
      default: "USD",
    },
    currencySymbol: {
      type: String,
      default: "$",
    },
    taxRules: {
      type: [TaxRuleSchema],
      default: [{ name: "Default Tax", rate: 0, isDefault: true }],
    },
    invoicePrefix: {
      type: String,
      default: "INV",
    },
    invoiceNextNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    barcodeFormat: {
      type: String,
      enum: ["EAN13", "CODE128", "CODE39"],
      default: "CODE128",
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    enableLoyalty: {
      type: Boolean,
      default: false,
    },
    loyaltyPointsPerCurrency: {
      type: Number,
      default: 1,
      min: 0,
    },
    receiptFooter: String,
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
)

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema)
