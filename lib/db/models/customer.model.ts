import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  phone: string
  email?: string
  address?: string
  loyaltyPoints: number
  totalPurchases: number
  totalSpent: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    address: String,
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema)
