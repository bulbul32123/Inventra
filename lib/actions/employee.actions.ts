"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongodb"
import { User, AuditLog, Sale } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import type { ActionResult } from "./product.actions"
import type { UserRole } from "@/lib/db/models"
import mongoose from "mongoose"

export async function getEmployees() {
  try {
    await connectDB()

    const employees = await User.find({}).sort({ createdAt: -1 }).lean()

    return {
      success: true,
      data: employees.map((e) => ({
        _id: e._id.toString(),
        email: e.email,
        name: e.name,
        role: e.role,
        phone: e.phone,
        isActive: e.isActive,
        lastLogin: e.lastLogin,
        createdAt: e.createdAt,
      })),
    }
  } catch (error) {
    console.error("Get employees error:", error)
    return { success: false, error: "Failed to fetch employees" }
  }
}

export async function createEmployee(data: RegisterInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== "owner") {
    return { success: false, error: "Unauthorized" }
  }

  const validation = registerSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    const existing = await User.findOne({ email: data.email.toLowerCase() })
    if (existing) {
      return { success: false, error: "Email already registered" }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const employee = await User.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      role: data.role,
      phone: data.phone,
    })

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "user_management",
      entity: "User",
      entityId: employee._id,
      description: `Created employee: ${employee.name} (${employee.role})`,
    })

    revalidatePath("/employees")
    return { success: true, data: { id: employee._id.toString() } }
  } catch (error) {
    console.error("Create employee error:", error)
    return { success: false, error: "Failed to create employee" }
  }
}

export async function updateEmployee(
  id: string,
  data: { name?: string; email?: string; role?: UserRole; phone?: string; password?: string },
): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== "owner") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await connectDB()

    const employee = await User.findById(id)
    if (!employee) {
      return { success: false, error: "Employee not found" }
    }

    // Check email uniqueness
    if (data.email && data.email !== employee.email) {
      const existing = await User.findOne({ email: data.email.toLowerCase() })
      if (existing) {
        return { success: false, error: "Email already registered" }
      }
    }

    const updateData: Record<string, unknown> = {}
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email.toLowerCase()
    if (data.role) updateData.role = data.role
    if (data.phone) updateData.phone = data.phone
    if (data.password) updateData.password = await bcrypt.hash(data.password, 12)

    await User.findByIdAndUpdate(id, updateData)

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "user_management",
      entity: "User",
      entityId: employee._id,
      description: `Updated employee: ${employee.name}`,
      metadata: { changes: Object.keys(data) },
    })

    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Update employee error:", error)
    return { success: false, error: "Failed to update employee" }
  }
}

export async function toggleEmployeeStatus(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== "owner") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await connectDB()

    const employee = await User.findById(id)
    if (!employee) {
      return { success: false, error: "Employee not found" }
    }

    // Prevent deactivating self
    if (employee._id.toString() === session.userId) {
      return { success: false, error: "Cannot deactivate your own account" }
    }

    await User.findByIdAndUpdate(id, { isActive: !employee.isActive })

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "user_management",
      entity: "User",
      entityId: employee._id,
      description: `${employee.isActive ? "Deactivated" : "Activated"} employee: ${employee.name}`,
    })

    revalidatePath("/employees")
    return { success: true }
  } catch (error) {
    console.error("Toggle employee status error:", error)
    return { success: false, error: "Failed to update employee status" }
  }
}

export async function getEmployeeSalesStats(employeeId: string, days = 30) {
  try {
    await connectDB()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await Sale.aggregate([
      {
        $match: {
          cashier: new mongoose.Types.ObjectId(employeeId),
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$grandTotal" },
        },
      },
    ])

    return {
      success: true,
      data: stats[0] || { totalSales: 0, orderCount: 0, avgOrderValue: 0 },
    }
  } catch (error) {
    console.error("Get employee sales stats error:", error)
    return { success: false, error: "Failed to fetch employee stats" }
  }
}
