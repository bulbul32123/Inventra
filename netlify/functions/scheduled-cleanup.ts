// netlify/functions/scheduled-cleanup.ts
import { Handler, schedule } from "@netlify/functions";
import { cleanupExpiredUsers } from "../../lib/utils/cleanup";

// This function runs every 5 minutes
const handler: Handler = schedule("*/5 * * * *", async (event) => {
  console.log("Netlify scheduled cleanup started...", new Date().toISOString());
  
  try {
    const result = await cleanupExpiredUsers();
    
    console.log("Cleanup results:", {
      success: result.success,
      deletedCount: result.deletedCount,
      deletedUsers: result.deletedUsers,
      errors: result.errors,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: result.success,
        message: `Cleanup completed. Deleted ${result.deletedCount} users.`,
        deletedCount: result.deletedCount,
        deletedUsers: result.deletedUsers,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Cleanup function error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
    };
  }
});

export { handler };