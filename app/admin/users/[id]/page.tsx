"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface FormData {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "user",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user");
        }

        setUser(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
        router.push("/admin/users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id, router]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      router.push("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
              <CardDescription>
                Update the user&apos;s basic information and role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive">Account Active</Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* User Details Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  User ID
                </Label>
                <p className="text-sm font-mono">{user._id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Created
                </Label>
                <p className="text-sm">
                  {format(new Date(user.createdAt), "PPP")}
                </p>
              </div>
              {user.lastLogin && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </Label>
                  <p className="text-sm">
                    {format(new Date(user.lastLogin), "PPP")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
