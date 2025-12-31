import mongoose, { Schema, type Document, type Model } from "mongoose"

export type AuditAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "sale"
  | "refund"
  | "stock_adjustment"
  | "settings_change"
  | "user_management"

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  userName: string
  userRole: string
  action: AuditAction
  entity?: string
  entityId?: mongoose.Types.ObjectId
  description: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "sale",
        "refund",
        "stock_adjustment",
        "settings_change",
        "user_management",
      ],
      required: true,
      index: true,
    },
    entity: String,
    entityId: Schema.Types.ObjectId,
    description: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// Indexes for querying
AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ user: 1, createdAt: -1 })
AuditLogSchema.index({ action: 1, createdAt: -1 })

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)
