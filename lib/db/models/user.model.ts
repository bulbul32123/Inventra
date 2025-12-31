import mongoose, { Schema, type Document, type Model } from "mongoose"

export type UserRole = "owner" | "manager" | "cashier"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "cashier"],
      default: "cashier",
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
)

// Compound index for active users by role
UserSchema.index({ role: 1, isActive: 1 })

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
