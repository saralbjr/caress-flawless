"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
}

// Mock order data
const mockOrders = [
  {
    id: "ORD-1234",
    date: new Date(2023, 4, 15),
    status: "delivered",
    total: 249.99,
    items: [
      {
        id: "1",
        name: "Wireless Bluetooth Headphones",
        price: 199.99,
        quantity: 1,
      },
      { id: "6", name: "Premium Yoga Mat", price: 49.99, quantity: 1 },
    ],
  },
  {
    id: "ORD-5678",
    date: new Date(2023, 3, 28),
    status: "processing",
    total: 159.99,
    items: [
      { id: "11", name: "Designer Sunglasses", price: 159.99, quantity: 1 },
    ],
  },
];

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      setUser(userData);
    } catch (error) {
      console.error("Failed to parse user data", error);
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
        <p className="text-muted-foreground mb-8">
          View and track your order history
        </p>

        {mockOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {mockOrders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      {renderStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {format(order.date, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold ml-2">
                      Rs.{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <p>{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × Rs.{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="font-medium">
                          Rs.{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted p-4 flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
