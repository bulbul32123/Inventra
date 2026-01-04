// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredUsers } from "@/lib/utils/cleanup";

// This endpoint should be called by a cron job
// IMPORTANT: Protect this endpoint with a secret token
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from your cron service
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key-here";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Starting cleanup job...");
    const result = await cleanupExpiredUsers();

    return NextResponse.json({
      success: result.success,
      message: `Cleanup completed. Deleted ${result.deletedCount} users.`,
      deletedCount: result.deletedCount,
      deletedUsers: result.deletedUsers,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Cleanup API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Cleanup failed", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method for manual triggers (admin only)
export async function POST(request: NextRequest) {
  try {
    // Add your admin authentication here
    const authHeader = request.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET || "your-admin-secret";
    
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Manual cleanup triggered by admin...");
    const result = await cleanupExpiredUsers();

    return NextResponse.json({
      success: result.success,
      message: `Manual cleanup completed. Deleted ${result.deletedCount} users.`,
      deletedCount: result.deletedCount,
      deletedUsers: result.deletedUsers,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Manual cleanup error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Manual cleanup failed", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}