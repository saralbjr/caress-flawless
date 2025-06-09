"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, Shield, Users, Crown } from "lucide-react";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface RoleStats {
  user: number;
  admin: number;
  superadmin: number;
}

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStats>({
    user: 0,
    admin: 0,
    superadmin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users and calculate role stats
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users?limit=100");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);

      // Calculate role statistics
      const stats = data.users.reduce(
        (acc: RoleStats, user: User) => {
          acc[user.role as keyof RoleStats]++;
          return acc;
        },
        { user: 0, admin: 0, superadmin: 0 }
      );
      setRoleStats(stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      toast.success("User role updated successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  // Render role badge
  const renderRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: {
        icon: <Crown className="h-3 w-3" />,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
      admin: {
        icon: <Shield className="h-3 w-3" />,
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      user: {
        icon: <Users className="h-3 w-3" />,
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <Badge
        className={`${config.className} flex items-center gap-1`}
        variant="outline"
      >
        {config.icon}
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            User Roles Management
          </h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the system.
          </p>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.user}</div>
            <p className="text-xs text-muted-foreground">
              Standard user accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admin}</div>
            <p className="text-xs text-muted-foreground">
              Admin access accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.superadmin}</div>
            <p className="text-xs text-muted-foreground">Full system access</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Role Management
          </CardTitle>
          <CardDescription>
            View and modify user roles. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
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
                    <TableCell colSpan={5} className="text-center py-10">
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
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user._id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
