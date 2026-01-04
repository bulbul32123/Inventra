// scripts/test-cleanup.ts
// Run this script manually to test cleanup: npx tsx scripts/test-cleanup.ts

import { cleanupExpiredUsers } from "../lib/utils/cleanup";

async function testCleanup() {
  console.log("Starting manual cleanup test...\n");
  
  const result = await cleanupExpiredUsers();
  
  console.log("\n=== Cleanup Results ===");
  console.log(`Success: ${result.success}`);
  console.log(`Deleted Users: ${result.deletedCount}`);
  console.log(`Users: ${result.deletedUsers.join(", ") || "None"}`);
  
  if (result.errors.length > 0) {
    console.log("\n=== Errors ===");
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log("\n=== Test Complete ===");
  process.exit(0);
}

testCleanup().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});