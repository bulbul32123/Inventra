"use server"

import { revalidatePath } from "next/cache"
import { connectDB } from "@/lib/db/mongodb"
import { Product, AuditLog, InventoryLog } from "@/lib/db/models"
import { getSession } from "@/lib/auth/session"
import { productSchema, type ProductInput } from "@/lib/validations"
import { generateBarcode, generateSKU } from "@/lib/utils/barcode"
import mongoose from "mongoose"

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function getProducts(options?: {
  search?: string
  category?: string
  status?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) {
  try {
    await connectDB()

    const { search, category, status, lowStock, page = 1, limit = 20 } = options || {}

    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ]
    }

    if (category) query.category = category
    if (status) query.status = status
    if (lowStock) query.$expr = { $lte: ["$stock", "$reorderLevel"] }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ])

    return {
      success: true,
      data: {
        products: products.map((p) => ({
          ...p,
          _id: p._id.toString(),
          supplier: p.supplier?.toString(),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    console.error("Get products error:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    await connectDB()

    const product = await Product.findOne({
      $or: [{ barcode }, { "variants.barcode": barcode }],
      status: "active",
    }).lean()

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    return {
      success: true,
      data: {
        ...product,
        _id: product._id.toString(),
        supplier: product.supplier?.toString(),
      },
    }
  } catch (error) {
    console.error("Get product by barcode error:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function getProductById(id: string) {
  try {
    await connectDB()

    const product = await Product.findById(id).populate("supplier").lean()

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    return {
      success: true,
      data: {
        ...product,
        _id: product._id.toString(),
        supplier: product.supplier ? (product.supplier as { _id: mongoose.Types.ObjectId })._id.toString() : undefined,
      },
    }
  } catch (error) {
    console.error("Get product error:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function createProduct(data: ProductInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const validation = productSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  try {
    await connectDB()

    // Auto-generate barcode and SKU if empty
    const barcode = data.barcode || generateBarcode()
    const productCount = await Product.countDocuments({ category: data.category })
    const sku = data.sku || generateSKU(data.category, productCount + 1)

    // Check for duplicates
    const existing = await Product.findOne({ $or: [{ sku }, { barcode }] })
    if (existing) {
      return { success: false, error: "A product with this SKU or barcode already exists" }
    }

    const product = await Product.create({
      ...validation.data,
      sku,
      barcode,
      supplier: data.supplier ? new mongoose.Types.ObjectId(data.supplier) : undefined,
    })

    // Create initial inventory log
    if (data.stock > 0) {
      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        action: "stock_in",
        quantityBefore: 0,
        quantityChange: data.stock,
        quantityAfter: data.stock,
        reason: "Initial stock",
        costPrice: data.costPrice,
        performedBy: session.userId,
        performedByName: session.name,
      })
    }

    // Audit log
    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "create",
      entity: "Product",
      entityId: product._id,
      description: `Created product: ${product.name}`,
      metadata: { sku, barcode },
    })

    revalidatePath("/products")
    return { success: true, data: { id: product._id.toString() } }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    const product = await Product.findById(id)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Check for duplicate SKU/barcode if changed
    if (data.sku && data.sku !== product.sku) {
      const existing = await Product.findOne({ sku: data.sku, _id: { $ne: id } })
      if (existing) return { success: false, error: "SKU already exists" }
    }

    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await Product.findOne({ barcode: data.barcode, _id: { $ne: id } })
      if (existing) return { success: false, error: "Barcode already exists" }
    }

    const updateData = {
      ...data,
      supplier: data.supplier ? new mongoose.Types.ObjectId(data.supplier) : product.supplier,
    }

    await Product.findByIdAndUpdate(id, updateData)

    // Audit log
    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "update",
      entity: "Product",
      entityId: product._id,
      description: `Updated product: ${product.name}`,
      metadata: { changes: Object.keys(data) },
    })

    revalidatePath("/products")
    revalidatePath(`/products/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    await connectDB()

    const product = await Product.findById(id)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    await Product.findByIdAndDelete(id)

    // Audit log
    await AuditLog.create({
      user: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "delete",
      entity: "Product",
      entityId: product._id,
      description: `Deleted product: ${product.name}`,
    })

    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Delete product error:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function getCategories() {
  try {
    await connectDB()
    const categories = await Product.distinct("category")
    return { success: true, data: categories }
  } catch (error) {
    console.error("Get categories error:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}
