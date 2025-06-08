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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      image: string;
      sku?: string;
    };
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };
  paymentInfo: {
    method: string;
    status: string;
    amount: number;
    currency: string;
    transactionId?: string;
    paidAt?: string;
  };
  shipment?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    shippedAt: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const router = useRouter();

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order");
        }

        setOrder(data.order);
        setNewStatus(data.order.status);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order data");
        router.push("/admin/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, router]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      setOrder(data.order);
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      setNewStatus(order.status); // Reset to original status
    } finally {
      setIsUpdating(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    const className = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={className} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            Order #{order.orderNumber} • Created {format(new Date(order.createdAt), "PPP")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {renderStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.product.sku && (
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {order.user.name}</p>
                <p><strong>Email:</strong> {order.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p><strong>Phone:</strong> {order.shippingAddress.phoneNumber}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newStatus !== order.status && (
                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Method:</strong> {order.paymentInfo.method}</p>
              <p><strong>Status:</strong> {order.paymentInfo.status}</p>
              <p><strong>Amount:</strong> ${order.paymentInfo.amount.toFixed(2)} {order.paymentInfo.currency}</p>
              {order.paymentInfo.transactionId && (
                <p><strong>Transaction ID:</strong> {order.paymentInfo.transactionId}</p>
              )}
              {order.paymentInfo.paidAt && (
                <p><strong>Paid At:</strong> {format(new Date(order.paymentInfo.paidAt), "PPP")}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipment Information */}
          {order.shipment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Carrier:</strong> {order.shipment.carrier}</p>
                <p><strong>Tracking Number:</strong> {order.shipment.trackingNumber}</p>
                {order.shipment.trackingUrl && (
                  <p>
                    <strong>Track:</strong>{" "}
                    <a
                      href={order.shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Tracking
                    </a>
                  </p>
                )}
                <p><strong>Shipped At:</strong> {format(new Date(order.shipment.shippedAt), "PPP")}</p>
                {order.shipment.estimatedDelivery && (
                  <p>
                    <strong>Estimated Delivery:</strong>{" "}
                    {format(new Date(order.shipment.estimatedDelivery), "PPP")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/admin/orders/${order._id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
