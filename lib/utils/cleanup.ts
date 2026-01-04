// lib/utils/cleanup.ts
import { connectDB } from "@/lib/db/mongodb";
import { 
  User, 
  Product, 
  Sale, 
  Customer, 
  Supplier, 
  AuditLog, 
  InventoryLog 
} from "@/lib/db/models";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public_id from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
}

// Delete image from Cloudinary
async function deleteCloudinaryImage(imageUrl: string): Promise<boolean> {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) return false;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}

// Delete all product images for a user
async function deleteUserProductImages(userId: string): Promise<void> {
  try {
    // Find all products (assuming products are associated with users via sales/inventory)
    // You might need to adjust this based on your actual schema
    const products = await Product.find({});
    
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          await deleteCloudinaryImage(imageUrl);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting product images:", error);
  }
}

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
  deletedUsers: string[];
}

export async function cleanupExpiredUsers(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    deletedCount: 0,
    errors: [],
    deletedUsers: [],
  };

  try {
    await connectDB();
    
    // Find all expired trial users
    const expiredUsers = await User.find({
      isTrialUser: true,
      expiresAt: { $lte: new Date() },
      isActive: true, // Only delete active trial users
    });

    console.log(`Found ${expiredUsers.length} expired trial users to clean up`);

    for (const user of expiredUsers) {
      try {
        const userId = user._id.toString();
        console.log(`Cleaning up user: ${user.email} (${userId})`);

        // 1. Delete user's avatar from Cloudinary
        if (user.avatar) {
          console.log(`Deleting avatar for user ${user.email}`);
          await deleteCloudinaryImage(user.avatar);
        }

        // 2. Delete all sales made by this user
        const deletedSales = await Sale.deleteMany({ cashier: user._id });
        console.log(`Deleted ${deletedSales.deletedCount} sales for user ${user.email}`);

        // 3. Delete all audit logs for this user
        const deletedAuditLogs = await AuditLog.deleteMany({ user: user._id });
        console.log(`Deleted ${deletedAuditLogs.deletedCount} audit logs for user ${user.email}`);

        // 4. Delete all inventory logs performed by this user
        const deletedInventoryLogs = await InventoryLog.deleteMany({ 
          performedBy: user._id 
        });
        console.log(`Deleted ${deletedInventoryLogs.deletedCount} inventory logs for user ${user.email}`);

        // 5. Delete all products (if you want to delete all products in the trial)
        // If products should persist, comment this out
        const deletedProducts = await Product.deleteMany({});
        console.log(`Deleted ${deletedProducts.deletedCount} products`);
        
        // Delete product images from Cloudinary
        await deleteUserProductImages(userId);

        // 6. Delete all customers
        const deletedCustomers = await Customer.deleteMany({});
        console.log(`Deleted ${deletedCustomers.deletedCount} customers`);

        // 7. Delete all suppliers
        const deletedSuppliers = await Supplier.deleteMany({});
        console.log(`Deleted ${deletedSuppliers.deletedCount} suppliers`);

        // 8. Finally, delete the user
        await User.findByIdAndDelete(user._id);
        console.log(`Deleted user ${user.email}`);

        result.deletedCount++;
        result.deletedUsers.push(user.email);

      } catch (error) {
        const errorMsg = `Failed to cleanup user ${user.email}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    console.log(`Cleanup completed. Deleted ${result.deletedCount} users.`);
    return result;

  } catch (error) {
    console.error("Cleanup process failed:", error);
    result.success = false;
    result.errors.push(`Cleanup process failed: ${error}`);
    return result;
  }
}

// Optional: Function to extend trial period for a specific user
export async function extendTrialPeriod(
  userId: string, 
  additionalMinutes: number
): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return false;

    user.expiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);
    await user.save();
    
    console.log(`Extended trial for user ${user.email} by ${additionalMinutes} minutes`);
    return true;
  } catch (error) {
    console.error("Failed to extend trial period:", error);
    return false;
  }
}

// Optional: Convert trial user to permanent user
export async function convertToPermanentUser(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return false;

    user.isTrialUser = false;
    // Set expiration far in the future (e.g., 100 years)
    user.expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    await user.save();
    
    console.log(`Converted user ${user.email} to permanent user`);
    return true;
  } catch (error) {
    console.error("Failed to convert to permanent user:", error);
    return false;
  }
}