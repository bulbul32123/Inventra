"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEmployee, updateEmployee } from "@/lib/actions/employee.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EmployeeDialogProps {
  open: boolean
  onClose: () => void
  employee?: {
    _id: string
    email: string
    name: string
    role: "owner" | "manager" | "cashier"
    phone?: string
  } | null
  onSuccess: () => void
}

export function EmployeeDialog({ open, onClose, employee, onSuccess }: EmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier" as "owner" | "manager" | "cashier",
    phone: "",
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        password: "",
        role: employee.role,
        phone: employee.phone || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        phone: "",
      })
    }
  }, [employee, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = employee
        ? await updateEmployee(employee._id, {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            phone: formData.phone || undefined,
            password: formData.password || undefined,
          })
        : await createEmployee(formData)

      if (result.success) {
        toast.success(employee ? "Employee updated" : "Employee created")
        onSuccess()
      } else {
        toast.error(result.error || "Operation failed")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{employee ? "New Password (leave blank to keep)" : "Password *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required={!employee}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "owner" | "manager" | "cashier") =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner (Full Access)</SelectItem>
                <SelectItem value="manager">Manager (Inventory + Reports)</SelectItem>
                <SelectItem value="cashier">Cashier (POS Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {employee ? "Updating..." : "Creating..."}
                </>
              ) : employee ? (
                "Update Employee"
              ) : (
                "Create Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
