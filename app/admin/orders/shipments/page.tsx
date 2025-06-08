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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  Truck,
  Package,
  ExternalLink,
  Plus,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  status: string;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    city: string;
    state: string;
    country: string;
  };
  shipment?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    shippedAt: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
}

interface ShipmentForm {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
}

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shipmentForm, setShipmentForm] = useState<ShipmentForm>({
    carrier: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedDelivery: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Fetch orders that are shipped or ready to ship
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "50");
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      // Filter orders that are processing, shipped, or delivered
      const shippableOrders = data.orders.filter((order: Order) => 
        ["processing", "shipped", "delivered"].includes(order.status)
      );
      
      setOrders(shippableOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery]);

  // Handle search
  const handleSearch = () => {
    fetchOrders();
  };

  // Open shipment dialog
  const openShipmentDialog = (order: Order) => {
    setSelectedOrder(order);
    if (order.shipment) {
      setShipmentForm({
        carrier: order.shipment.carrier,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl || "",
        estimatedDelivery: order.shipment.estimatedDelivery 
          ? format(new Date(order.shipment.estimatedDelivery), "yyyy-MM-dd")
          : "",
      });
    } else {
      setShipmentForm({
        carrier: "",
        trackingNumber: "",
        trackingUrl: "",
        estimatedDelivery: "",
      });
    }
    setIsDialogOpen(true);
  };

  // Handle shipment update
  const handleShipmentUpdate = async () => {
    if (!selectedOrder) return;

    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      toast.error("Carrier and tracking number are required");
      return;
    }

    setIsUpdating(true);
    try {
      const shipmentData = {
        status: "shipped",
        shipment: {
          carrier: shipmentForm.carrier,
          trackingNumber: shipmentForm.trackingNumber,
          trackingUrl: shipmentForm.trackingUrl || undefined,
          shippedAt: new Date().toISOString(),
          estimatedDelivery: shipmentForm.estimatedDelivery 
            ? new Date(shipmentForm.estimatedDelivery).toISOString()
            : undefined,
        },
      };

      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update shipment");
      }

      toast.success("Shipment information updated successfully");
      setIsDialogOpen(false);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast.error("Failed to update shipment information");
    } finally {
      setIsUpdating(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };

    const className = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;

    return (
      <Badge className={className} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipment Management</h1>
          <p className="text-muted-foreground">
            Manage shipping information for orders.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Orders & Shipments
          </CardTitle>
          <CardDescription>
            Track and manage shipments for processing and shipped orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or customer..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipment Info</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading orders...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <p className="text-muted-foreground">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-muted-foreground">{order.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.shippingAddress.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.shipment ? (
                          <div>
                            <p className="font-medium">{order.shipment.carrier}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shipment.trackingNumber}
                            </p>
                            {order.shipment.trackingUrl && (
                              <a
                                href={order.shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                Track <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No shipment info</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
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
                            <DropdownMenuItem onClick={() => openShipmentDialog(order)}>
                              {order.shipment ? (
                                <>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Shipment
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Shipment
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/${order._id}`)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              View Order
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
        </CardContent>
      </Card>

      {/* Shipment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.shipment ? "Edit Shipment" : "Add Shipment Information"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order #${selectedOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carrier" className="text-right">
                Carrier *
              </Label>
              <Input
                id="carrier"
                value={shipmentForm.carrier}
                onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., FedEx, UPS, DHL"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingNumber" className="text-right">
                Tracking # *
              </Label>
              <Input
                id="trackingNumber"
                value={shipmentForm.trackingNumber}
                onChange={(e) => setShipmentForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                className="col-span-3"
                placeholder="Tracking number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trackingUrl" className="text-right">
                Tracking URL
              </Label>
              <Input
                id="trackingUrl"
                value={shipmentForm.trackingUrl}
                onChange={(e) => setShipmentForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
                className="col-span-3"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimatedDelivery" className="text-right">
                Est. Delivery
              </Label>
              <Input
                id="estimatedDelivery"
                type="date"
                value={shipmentForm.estimatedDelivery}
                onChange={(e) => setShipmentForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleShipmentUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Save Shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
