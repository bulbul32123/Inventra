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
  // New fields for auto-deletion
  isTrialUser: boolean; // Mark users as trial/preview users
  expiresAt: Date; // When this user's data should be deleted
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
    // New fields for auto-deletion
    isTrialUser: {
      type: Boolean,
      default: true, // Set to true for all new users (trial mode)
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Index for efficient cleanup queries
      default: function() {
        // Set expiration to 5 minutes from creation
        return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in milliseconds
      }
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ isTrialUser: 1, expiresAt: 1 }); // For cleanup queries

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);