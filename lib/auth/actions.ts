"use server"

import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongodb"
import { User, AuditLog, Settings } from "@/lib/db/models"
import { createSession, deleteSession, getSession } from "./session"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations"
import { redirect } from "next/navigation"

export interface AuthResult {
  success: boolean
  error?: string
}

export async function login(data: LoginInput): Promise<AuthResult> {
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    const user = await User.findOne({ email: data.email.toLowerCase() }).select("+password")
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    if (!user.isActive) {
      return { success: false, error: "Account is disabled. Contact your administrator." }
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

    // Create session
    await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: "login",
      description: `User ${user.name} logged in`,
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function register(data: RegisterInput): Promise<AuthResult> {
  const validation = registerSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() })
    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await User.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      role: data.role,
      phone: data.phone,
    })

    // Create default settings if this is the first user (owner)
    const userCount = await User.countDocuments()
    if (userCount === 1) {
      await Settings.create({})
    }

    // Create session
    await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: "create",
      entity: "User",
      entityId: user._id,
      description: `New user ${user.name} registered`,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

export async function logout(): Promise<void> {
  const session = await getSession()

  if (session) {
    try {
      await connectDB()
      await AuditLog.create({
        user: session.userId,
        userName: session.name,
        userRole: session.role,
        action: "logout",
        description: `User ${session.name} logged out`,
      })
    } catch (error) {
      console.error("Logout audit error:", error)
    }
  }

  await deleteSession()
  redirect("/login")
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  try {
    await connectDB()
    const user = await User.findById(session.userId).lean()
    if (!user || !user.isActive) return null

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    }
  } catch {
    return null
  }
}
