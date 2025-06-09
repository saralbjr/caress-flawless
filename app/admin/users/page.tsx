"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  Ban,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const router = useRouter();

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (roleFilter && roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("isActive", statusFilter === "active" ? "true" : "false");
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, roleFilter, statusFilter]);

  // Handle search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchUsers();
  };

  // Handle filter change
  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchUsers();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user status");
      }

      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Render role badge
  const renderRoleBadge = (role: string) => {
    const roleStyles = {
      superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      admin:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    };

    const style =
      roleStyles[role as keyof typeof roleStyles] ||
      "bg-gray-100 text-gray-800";

    return (
      <Badge className={style} variant="outline">
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => router.push("/admin/users/add")}>
          Add User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all users in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleSearch}>
                Filter
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading users...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{renderRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/users/${user._id}`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/users/${user._id}/roles`)
                              }
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Manage Roles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(user._id, user.isActive)
                              }
                            >
                              {user.isActive ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={
                            pagination.page === page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
