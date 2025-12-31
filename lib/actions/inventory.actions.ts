"use server"

import { revalidatePath } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Product, InventoryLog, AuditLog, Supplier } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { inventoryAdjustmentSchema, supplierSchema, type SupplierInput } from "@/lib/validations"
import mongoose from "mongoose"
import type { ActionResult } from "./product.actions"

// Inventory adjustments with atomic updates
export async function adjustInventory(data: {
  productId: string
  action: "stock_in" | "stock_out" | "adjustment" | "damage" | "expired"
  quantity: number
  reason: string
  costPrice?: number
}): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const validation = inventoryAdjustmentSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    const product = await Product.findById(data.productId)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    const quantityBefore = product.stock
    let quantityChange = data.quantity

    // For stock_out, damage, expired - quantity is subtracted
    if (["stock_out", "damage", "expired"].includes(data.action)) {
      quantityChange = -Math.abs(data.quantity)
    }

    const quantityAfter = quantityBefore + quantityChange

    if (quantityAfter < 0) {
      return { success: false, error: "Insufficient stock" }
    }

    // Atomic update to prevent race conditions
    const updated = await Product.findOneAndUpdate(
      { _id: data.productId, stock: { $gte: data.action === "stock_in" ? 0 : Math.abs(quantityChange) } },
      { $inc: { stock: quantityChange } },
      { new: true },
    )

    if (!updated) {
      return { success: false, error: "Stock update failed - concurrent modification detected" }
    }

    // Create inventory log
    await InventoryLog.create({
      product: product._id,
      productName: product.name,
      productSku: product.sku,
      action: data.action,
      quantityBefore,
      quantityChange,
      quantityAfter: updated.stock,
      reason: data.reason,
      costPrice: data.costPrice || product.costPrice,
      performedBy: session.userId,
      performedByName: session.name,
    })

    // Audit log
    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "stock_adjustment",
      entity: "Product",
      entityId: product._id,
      description: `${data.action}: ${Math.abs(quantityChange)} units of ${product.name}`,
      metadata: { reason: data.reason, before: quantityBefore, after: updated.stock },
    })

    revalidatePath("/inventory")
    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Inventory adjustment error:", error)
    return { success: false, error: "Failed to adjust inventory" }
  }
}

export async function getInventoryLogs(options?: {
  productId?: string
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  try {
    await connectDB()

    const { productId, action, startDate, endDate, page = 1, limit = 50 } = options || {}

    const query: Record<string, unknown> = {}

    if (productId) query.product = new mongoose.Types.ObjectId(productId)
    if (action) query.action = action
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate)
      if (endDate) (query.createdAt as Record<string, unknown>).$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      InventoryLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      InventoryLog.countDocuments(query),
    ])

    return {
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          _id: log._id.toString(),
          product: log.product.toString(),
          performedBy: log.performedBy.toString(),
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    }
  } catch (error) {
    console.error("Get inventory logs error:", error)
    return { success: false, error: "Failed to fetch inventory logs" }
  }
}

export async function getLowStockProducts() {
  try {
    await connectDB()

    const products = await Product.find({
      $expr: { $lte: ["$stock", "$reorderLevel"] },
      status: "active",
    })
      .sort({ stock: 1 })
      .limit(50)
      .lean()

    return {
      success: true,
      data: products.map((p) => ({
        ...p,
        _id: p._id.toString(),
        supplier: p.supplier?.toString(),
      })),
    }
  } catch (error) {
    console.error("Get low stock products error:", error)
    return { success: false, error: "Failed to fetch low stock products" }
  }
}

// Supplier actions
export async function getSuppliers(search?: string) {
  try {
    await connectDB()

    const query: Record<string, unknown> = { isActive: true }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }]
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 }).lean()

    return {
      success: true,
      data: suppliers.map((s) => ({ ...s, _id: s._id.toString() })),
    }
  } catch (error) {
    console.error("Get suppliers error:", error)
    return { success: false, error: "Failed to fetch suppliers" }
  }
}

export async function createSupplier(data: SupplierInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const validation = supplierSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    const supplier = await Supplier.create(validation.data)

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "create",
      entity: "Supplier",
      entityId: supplier._id,
      description: `Created supplier: ${supplier.name}`,
    })

    revalidatePath("/suppliers")
    return { success: true, data: { id: supplier._id.toString() } }
  } catch (error) {
    console.error("Create supplier error:", error)
    return { success: false, error: "Failed to create supplier" }
  }
}

export async function updateSupplier(id: string, data: Partial<SupplierInput>): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    const supplier = await Supplier.findByIdAndUpdate(id, data, { new: true })
    if (!supplier) {
      return { success: false, error: "Supplier not found" }
    }

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "update",
      entity: "Supplier",
      entityId: supplier._id,
      description: `Updated supplier: ${supplier.name}`,
    })

    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Update supplier error:", error)
    return { success: false, error: "Failed to update supplier" }
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    const supplier = await Supplier.findByIdAndUpdate(id, { isActive: false })
    if (!supplier) {
      return { success: false, error: "Supplier not found" }
    }

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "delete",
      entity: "Supplier",
      entityId: supplier._id,
      description: `Deleted supplier: ${supplier.name}`,
    })

    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Delete supplier error:", error)
    return { success: false, error: "Failed to delete supplier" }
  }
}
