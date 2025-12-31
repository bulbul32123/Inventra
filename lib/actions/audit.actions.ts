"use server";

import { connectDB } from "@/lib/db/mongodb";
import { AuditLog } from "@/lib/db/models";

export async function getAuditLogs(options?: {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();

    const {
      action,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options || {};

    // Build query filters
    const query: Record<string, unknown> = {};

    if (action) query.action = action;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, unknown>).$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    // Fetch logs and total count
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      AuditLog.countDocuments(query),
    ]);

    // Return data in the expected format
    return {
      success: true,
      data: {
        logs: JSON.parse(JSON.stringify(logs)), // Serialize for Next.js
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return {
      success: false,
      error: "Failed to fetch audit logs",
      data: {
        logs: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          pages: 0,
        },
      },
    };
  }
}

// Additional helper function to create audit logs
export async function createAuditLog(data: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await connectDB();

    const auditLog = await AuditLog.create(data);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(auditLog)),
    };
  } catch (error) {
    console.error("Error creating audit log:", error);
    return {
      success: false,
      error: "Failed to create audit log",
    };
  }
}

// Get audit logs for a specific user
export async function getUserAuditLogs(userId: string, limit: number = 20) {
  try {
    await connectDB();

    const logs = await AuditLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(logs)),
    };
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    return {
      success: false,
      error: "Failed to fetch user audit logs",
      data: [],
    };
  }
}

// Get audit statistics
export async function getAuditStats() {
  try {
    await connectDB();

    const [
      totalLogs,
      todayLogs,
      actionBreakdown,
      recentActivity,
    ] = await Promise.all([
      // Total logs
      AuditLog.countDocuments(),
      
      // Today's logs
      AuditLog.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      
      // Action breakdown
      AuditLog.aggregate([
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
      
      // Recent activity (last 10)
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        totalLogs,
        todayLogs,
        actionBreakdown,
        recentActivity: JSON.parse(JSON.stringify(recentActivity)),
      },
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return {
      success: false,
      error: "Failed to fetch audit statistics",
    };
  }
}