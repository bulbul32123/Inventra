// lib/db/models/User.ts
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "owner" | "manager" | "cashier";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  isTrialUser: boolean;
  expiresAt: Date;
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
    isTrialUser: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      default: function () {
        // ✅ CHANGED: Expires after 7 days
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ isTrialUser: 1, expiresAt: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
