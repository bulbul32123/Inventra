"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAuditLogs } from "@/lib/actions/audit.actions"
import { formatDateTime } from "@/lib/utils/format"
import { ClipboardList, RefreshCw, AlertCircle } from "lucide-react"
import useSWR from "swr"

interface AuditLog {
  _id: string
  userName: string
  userRole: string
  action: string
  entity?: string
  description: string
  createdAt: string
}

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  logout: "secondary",
  create: "default",
  update: "secondary",
  delete: "destructive",
  sale: "default",
  refund: "destructive",
  stock_adjustment: "secondary",
  settings_change: "outline",
  user_management: "outline",
}

export function AuditLogList() {
  const [action, setAction] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const { data, isLoading, error, mutate } = useSWR(
    ["audit-logs", action, startDate, endDate],
    () =>
      getAuditLogs({
        action: action === "all" ? undefined : action,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100,
      }),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    },
  )

  const logs = data?.data?.logs || []
  const pagination = data?.data?.pagination

  // Handle refresh
  const handleRefresh = () => {
    mutate()
  }

  // Handle reset filters
  const handleResetFilters = () => {
    setAction("all")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            {(action !== "all" || startDate || endDate) && (
              <Button onClick={handleResetFilters} variant="ghost" size="sm">
                Reset Filters
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="stock_adjustment">Stock Adjustment</SelectItem>
                <SelectItem value="settings_change">Settings Change</SelectItem>
                <SelectItem value="user_management">User Management</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-[180px]"
              placeholder="Start date"
            />
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-[180px]"
              placeholder="End date"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium">Failed to load audit logs</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || "An error occurred while fetching the data"}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No audit logs found</h3>
              <p className="text-muted-foreground">
                {action !== "all" || startDate || endDate 
                  ? "Try adjusting your filters" 
                  : "Activity logs will appear here."}
              </p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && logs.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: AuditLog) => (
                      <TableRow key={log._id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {log.userRole}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionColors[log.action] || "outline"} className="capitalize">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.entity || "-"}</TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={log.description}>
                            {log.description}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Info */}
              {pagination && (
                <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                  <div>
                    Showing {logs.length} of {pagination.total} logs
                  </div>
                  {pagination.pages > 1 && (
                    <div>
                      Page {pagination.page} of {pagination.pages}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}