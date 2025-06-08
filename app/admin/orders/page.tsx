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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
    };
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
  };
  paymentInfo: {
    method: string;
    status: string;
    amount: number;
  };
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const router = useRouter();

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  // Handle search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchOrders();
  };

  // Handle filter change
  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    fetchOrders();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        icon: <Clock className="h-3 w-3" />,
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      processing: {
        icon: <Package className="h-3 w-3" />,
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      shipped: {
        icon: <Truck className="h-3 w-3" />,
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      delivered: {
        icon: <CheckCircle className="h-3 w-3" />,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      cancelled: {
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge
        className={`${config.className} flex items-center gap-1`}
        variant="outline"
      >
        {config.icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage all orders in your store.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="flex gap-4">
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleSearch}>
                Filter
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/orders/${order._id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/orders/${order._id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteOrder(order._id)}
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
                of {pagination.total} orders
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
