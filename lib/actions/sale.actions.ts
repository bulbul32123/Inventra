"use server"

import { revalidatePath } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Product, Sale, Customer, InventoryLog, AuditLog, Settings } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { generateInvoiceNumber } from "@/lib/utils/barcode"
import mongoose from "mongoose"
import type { ActionResult } from "./product.actions"

interface SaleItemInput {
  product: string
  productName: string
  productSku: string
  barcode: string
  quantity: number
  unitPrice: number
  costPrice: number
  discountPercent: number
  taxPercent: number
}

interface PaymentInput {
  method: "cash" | "card" | "mobile" | "split"
  amount: number
  reference?: string
}

export async function createSale(data: {
  items: SaleItemInput[]
  customer?: string
  payments: PaymentInput[]
  notes?: string
  counter?: string
}): Promise<ActionResult<{ invoiceNumber: string; saleId: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const mongoSession = await mongoose.startSession()
  mongoSession.startTransaction()

  try {
    await connectDB()

    // Get settings for invoice number
    const settings = await Settings.findOne().session(mongoSession)
    const invoiceNumber = generateInvoiceNumber(settings?.invoicePrefix || "INV", settings?.invoiceNextNumber || 1)

    // Calculate totals for each item
    const processedItems = data.items.map((item) => {
      const subtotal = item.unitPrice * item.quantity
      const discountAmount = (subtotal * item.discountPercent) / 100
      const afterDiscount = subtotal - discountAmount
      const taxAmount = (afterDiscount * item.taxPercent) / 100
      const total = afterDiscount + taxAmount

      return {
        product: new mongoose.Types.ObjectId(item.product),
        productName: item.productName,
        productSku: item.productSku,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        discountPercent: item.discountPercent,
        discountAmount,
        taxPercent: item.taxPercent,
        taxAmount,
        subtotal,
        total,
      }
    })

    // Calculate sale totals
    const subtotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalDiscount = processedItems.reduce((sum, item) => sum + item.discountAmount, 0)
    const totalTax = processedItems.reduce((sum, item) => sum + item.taxAmount, 0)
    const grandTotal = processedItems.reduce((sum, item) => sum + item.total, 0)
    const amountPaid = data.payments.reduce((sum, p) => sum + p.amount, 0)
    const changeAmount = Math.max(0, amountPaid - grandTotal)

    // Verify stock availability and update atomically
    for (const item of data.items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true, session: mongoSession },
      )

      if (!updated) {
        await mongoSession.abortTransaction()
        return { success: false, error: `Insufficient stock for ${item.productName}` }
      }
    }

    // Get customer info if provided
    let customerName: string | undefined
    let customerPhone: string | undefined
    if (data.customer) {
      const customer = await Customer.findById(data.customer).session(mongoSession)
      if (customer) {
        customerName = customer.name
        customerPhone = customer.phone
      }
    }

    // Create sale
    const [sale] = await Sale.create(
      [
        {
          invoiceNumber,
          items: processedItems,
          customer: data.customer ? new mongoose.Types.ObjectId(data.customer) : undefined,
          customerName,
          customerPhone,
          subtotal,
          totalDiscount,
          totalTax,
          grandTotal,
          payments: data.payments,
          amountPaid,
          changeAmount,
          status: "completed",
          notes: data.notes,
          cashier: new mongoose.Types.ObjectId(session.userId),
          cashierName: session.name,
          counter: data.counter,
        },
      ],
      { session: mongoSession },
    )

    // Create inventory logs for each item
    const inventoryLogs = processedItems.map((item) => ({
      product: item.product,
      productName: item.productName,
      productSku: item.productSku,
      action: "sale" as const,
      quantityBefore: 0, // Will be updated below
      quantityChange: -item.quantity,
      quantityAfter: 0, // Will be updated below
      reason: `Sale: ${invoiceNumber}`,
      referenceType: "sale" as const,
      referenceId: sale._id,
      performedBy: new mongoose.Types.ObjectId(session.userId),
      performedByName: session.name,
    }))

    // Get actual stock values for logs
    for (const log of inventoryLogs) {
      const product = await Product.findById(log.product).session(mongoSession)
      if (product) {
        log.quantityAfter = product.stock
        log.quantityBefore = product.stock - log.quantityChange
      }
    }

    await InventoryLog.insertMany(inventoryLogs, { session: mongoSession })

    // Update customer stats if customer is attached
    if (data.customer) {
      await Customer.findByIdAndUpdate(
        data.customer,
        {
          $inc: {
            totalPurchases: 1,
            totalSpent: grandTotal,
          },
        },
        { session: mongoSession },
      )
    }

    // Update invoice number in settings
    await Settings.findOneAndUpdate({}, { $inc: { invoiceNextNumber: 1 } }, { session: mongoSession, upsert: true })

    // Audit log
    await AuditLog.create(
      [
        {
          user: session.userId,
          userName: session.name,
          userRole: session.role,
          action: "sale",
          entity: "Sale",
          entityId: sale._id,
          description: `Created sale: ${invoiceNumber} - Total: $${grandTotal.toFixed(2)}`,
          metadata: { invoiceNumber, grandTotal, itemCount: data.items.length },
        },
      ],
      { session: mongoSession },
    )

    await mongoSession.commitTransaction()

    revalidatePath("/pos")
    revalidatePath("/dashboard")
    revalidatePath("/reports")

    return { success: true, data: { invoiceNumber, saleId: sale._id.toString() } }
  } catch (error) {
    await mongoSession.abortTransaction()
    console.error("Create sale error:", error)
    return { success: false, error: "Failed to process sale" }
  } finally {
    mongoSession.endSession()
  }
}

export async function getSales(options?: {
  startDate?: string
  endDate?: string
  cashier?: string
  customer?: string
  status?: string
  page?: number
  limit?: number
}) {
  try {
    await connectDB()

    const { startDate, endDate, cashier, customer, status, page = 1, limit = 50 } = options || {}

    const query: Record<string, unknown> = {}

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) (query.createdAt as Record<string, unknown>).$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        ;(query.createdAt as Record<string, unknown>).$lte = end
      }
    }

    if (cashier) query.cashier = new mongoose.Types.ObjectId(cashier)
    if (customer) query.customer = new mongoose.Types.ObjectId(customer)
    if (status) query.status = status

    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Sale.countDocuments(query),
    ])

    return {
      success: true,
      data: {
        sales: sales.map((s) => ({
          ...s,
          _id: s._id.toString(),
          cashier: s.cashier.toString(),
          customer: s.customer?.toString(),
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    }
  } catch (error) {
    console.error("Get sales error:", error)
    return { success: false, error: "Failed to fetch sales" }
  }
}

export async function getSaleById(id: string) {
  try {
    await connectDB()

    const sale = await Sale.findById(id).lean()

    if (!sale) {
      return { success: false, error: "Sale not found" }
    }

    return {
      success: true,
      data: {
        ...sale,
        _id: sale._id.toString(),
        cashier: sale.cashier.toString(),
        customer: sale.customer?.toString(),
      },
    }
  } catch (error) {
    console.error("Get sale error:", error)
    return { success: false, error: "Failed to fetch sale" }
  }
}

export async function getStoreSettings() {
  try {
    await connectDB()

    let settings = await Settings.findOne().lean()

    if (!settings) {
      settings = await Settings.create({})
      settings = settings.toObject()
    }

    return {
      success: true,
      data: {
        ...settings,
        _id: settings._id.toString(),
      },
    }
  } catch (error) {
    console.error("Get settings error:", error)
    return { success: false, error: "Failed to fetch settings" }
  }
}
