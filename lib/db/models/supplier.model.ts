import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email?: string
  phone: string
  address?: string
  contactPerson?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: String,
    contactPerson: String,
    notes: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema)
