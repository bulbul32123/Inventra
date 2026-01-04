"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  Users,
} from "lucide-react";
import {
  getEmployees,
  toggleEmployeeStatus,
} from "@/lib/actions/employee.actions";
import { formatDateTime } from "@/lib/utils/format";
import { EmployeeDialog } from "./employee-dialog";
import { toast } from "sonner";
import useSWR from "swr";

interface Employee {
  _id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "cashier";
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const roleColors = {
  owner: "bg-amber-500",
  manager: "bg-blue-500",
  cashier: "bg-gray-500",
};

export function EmployeeList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data, mutate, isLoading } = useSWR("employees", getEmployees, {
    revalidateOnFocus: false,
  });

  const employees = data?.data || [];

  async function handleToggleStatus(
    id: string,
    name: string,
    isActive: boolean
  ) {
    const action = isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} "${name}"?`)) return;

    const result = await toggleEmployeeStatus(id);
    if (result.success) {
      toast.success(`Employee ${action}d successfully`);
      mutate();
    } else {
      toast.error(result.error || `Failed to ${action} employee`);
    }
  }

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditingEmployee(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {employees.length} employees
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No employees yet</h3>
              <p className="text-muted-foreground">
                Add your first employee to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: Employee) => {
                  const initials = employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {employee?.avatar ? (
                            <div className="h-12 w-12 rounded-full overflow-hidden border-4 border-gray-100">
                              <img
                                src={employee?.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <Avatar className="h-9 w-9">
                              <AvatarFallback
                                className={
                                  roleColors[employee.role] +
                                  " text-white text-sm"
                                }
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.phone || "-"}</TableCell>
                      <TableCell>
                        {employee.lastLogin
                          ? formatDateTime(employee.lastLogin)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.isActive ? "default" : "secondary"}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(employee)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  employee._id,
                                  employee.name,
                                  employee.isActive
                                )
                              }
                            >
                              {employee.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        employee={editingEmployee}
        onSuccess={() => {
          handleCloseDialog();
          mutate();
        }}
      />
    </div>
  );
}
