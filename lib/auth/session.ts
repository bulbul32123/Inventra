import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { UserRole } from "@/lib/db/models"

const secretKey = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const key = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ ...payload, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return session
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return decrypt(session)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function updateSession() {
  const session = await getSession()
  if (!session) return null

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const newSession = await encrypt({ ...session, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set("session", newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return session
}
