"use server"

import { revalidatePath } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Settings, AuditLog } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { settingsSchema, type SettingsInput } from "@/lib/validations"
import type { ActionResult } from "./product.actions"

export async function getSettings() {
  try {
    await connectDB()

    let settings = await Settings.findOne().lean()

    if (!settings) {
      const created = await Settings.create({})
      settings = created.toObject()
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

export async function updateSettings(data: Partial<SettingsInput>): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== "owner") {
    return { success: false, error: "Unauthorized" }
  }

  const validation = settingsSchema.partial().safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    await Settings.findOneAndUpdate({}, validation.data, { upsert: true })

    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "settings_change",
      description: "Updated store settings",
      metadata: { changes: Object.keys(data) },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Update settings error:", error)
    return { success: false, error: "Failed to update settings" }
  }
}
