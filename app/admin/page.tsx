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
  Users,
  ShoppingBag,
  CreditCard,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for dashboard
const mockStats = {
  totalUsers: 256,
  totalProducts: 124,
  totalOrders: 89,
  totalRevenue: 12589.99,
  recentOrders: [
    {
      id: "ORD-1234",
      customer: "John Doe",
      date: "2023-05-15",
      status: "delivered",
      total: 249.99,
    },
    {
      id: "ORD-5678",
      customer: "Jane Smith",
      date: "2023-05-14",
      status: "processing",
      total: 159.99,
    },
    {
      id: "ORD-9012",
      customer: "Robert Johnson",
      date: "2023-05-13",
      status: "shipped",
      total: 349.99,
    },
    {
      id: "ORD-3456",
      customer: "Emily Davis",
      date: "2023-05-12",
      status: "delivered",
      total: 99.99,
    },
  ],
  lowStockProducts: [
    {
      id: "PROD-123",
      name: "Wireless Bluetooth Headphones",
      stock: 3,
      threshold: 5,
    },
    {
      id: "PROD-456",
      name: "Premium Yoga Mat",
      stock: 2,
      threshold: 10,
    },
    {
      id: "PROD-789",
      name: "Stainless Steel Water Bottle",
      stock: 4,
      threshold: 10,
    },
  ],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    const statusClasses = {
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const statusClass = statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store's performance and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products available in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders placed in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue generated from all orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.id} - {order.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      ${order.total.toFixed(2)}
                    </div>
                    {renderStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>
              Products that need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        product.stock <= product.threshold / 2
                          ? "text-red-500"
                          : "text-amber-500"
                      }`}
                    />
                    <div className="text-sm font-medium">
                      {product.stock} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/admin/products/inventory">View Inventory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
