"use server"

import { revalidatePath } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Customer, AuditLog } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { customerSchema, type CustomerInput } from "@/lib/validations"
import type { ActionResult } from "./product.actions"

export async function getCustomers(options?: { search?: string; page?: number; limit?: number }) {
  try {
    await connectDB()

    const { search, page = 1, limit = 50 } = options || {}

    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ])

    return {
      success: true,
      data: {
        customers: customers.map((c) => ({ ...c, _id: c._id.toString() })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    }
  } catch (error) {
    console.error("Get customers error:", error)
    return { success: false, error: "Failed to fetch customers" }
  }
}

export async function getCustomerById(id: string) {
  try {
    await connectDB()

    const customer = await Customer.findById(id).lean()

    if (!customer) {
      return { success: false, error: "Customer not found" }
    }

    return {
      success: true,
      data: { ...customer, _id: customer._id.toString() },
    }
  } catch (error) {
    console.error("Get customer error:", error)
    return { success: false, error: "Failed to fetch customer" }
  }
}

export async function createCustomer(data: CustomerInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const validation = customerSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    // Check for duplicate phone
    const existing = await Customer.findOne({ phone: data.phone })
    if (existing) {
      return { success: false, error: "A customer with this phone number already exists" }
    }

    const customer = await Customer.create(validation.data)

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "create",
      entity: "Customer",
      entityId: customer._id,
      description: `Created customer: ${customer.name}`,
    })

    revalidatePath("/customers")
    return { success: true, data: { id: customer._id.toString() } }
  } catch (error) {
    console.error("Create customer error:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function updateCustomer(id: string, data: Partial<CustomerInput>): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    // Check for duplicate phone if changing
    if (data.phone) {
      const existing = await Customer.findOne({ phone: data.phone, _id: { $ne: id } })
      if (existing) {
        return { success: false, error: "A customer with this phone number already exists" }
      }
    }

    const customer = await Customer.findByIdAndUpdate(id, data, { new: true })
    if (!customer) {
      return { success: false, error: "Customer not found" }
    }

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "update",
      entity: "Customer",
      entityId: customer._id,
      description: `Updated customer: ${customer.name}`,
    })

    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Update customer error:", error)
    return { success: false, error: "Failed to update customer" }
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    const customer = await Customer.findByIdAndDelete(id)
    if (!customer) {
      return { success: false, error: "Customer not found" }
    }

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "delete",
      entity: "Customer",
      entityId: customer._id,
      description: `Deleted customer: ${customer.name}`,
    })

    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error("Delete customer error:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}
