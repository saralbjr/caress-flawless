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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Package,
  AlertTriangle,
  Edit,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  category: string;
  isActive: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

interface StockUpdateForm {
  stock: number;
  lowStockThreshold: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockUpdateForm>({
    stock: 0,
    lowStockThreshold: 5,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const router = useRouter();

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "100");

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery]);

  // Handle search
  const handleSearch = () => {
    fetchProducts();
  };

  // Filter products based on stock status
  const filteredProducts = products.filter((product) => {
    switch (filter) {
      case "low":
        return product.isLowStock && !product.isOutOfStock;
      case "out":
        return product.isOutOfStock;
      default:
        return true;
    }
  });

  // Open stock update dialog
  const openStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockForm({
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    });
    setIsDialogOpen(true);
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!selectedProduct) return;

    if (stockForm.stock < 0 || stockForm.lowStockThreshold < 0) {
      toast.error("Stock values cannot be negative");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: stockForm.stock,
            lowStockThreshold: stockForm.lowStockThreshold,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update stock");
      }

      toast.success("Stock updated successfully");
      setIsDialogOpen(false);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    } finally {
      setIsUpdating(false);
    }
  };

  // Render stock status badge
  const renderStockBadge = (product: Product) => {
    if (product.isOutOfStock) {
      return (
        <Badge
          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          variant="outline"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Out of Stock
        </Badge>
      );
    } else if (product.isLowStock) {
      return (
        <Badge
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          variant="outline"
        >
          <TrendingDown className="h-3 w-3 mr-1" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          variant="outline"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          In Stock
        </Badge>
      );
    }
  };

  // Calculate inventory stats
  const inventoryStats = {
    total: products.length,
    lowStock: products.filter((p) => p.isLowStock && !p.isOutOfStock).length,
    outOfStock: products.filter((p) => p.isOutOfStock).length,
    inStock: products.filter((p) => !p.isLowStock && !p.isOutOfStock).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage product stock levels.
          </p>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventoryStats.inStock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventoryStats.lowStock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryStats.outOfStock}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inventory
          </CardTitle>
          <CardDescription>
            Monitor stock levels and update inventory for all products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "low" ? "default" : "outline"}
                onClick={() => setFilter("low")}
              >
                Low Stock
              </Button>
              <Button
                variant={filter === "out" ? "default" : "outline"}
                onClick={() => setFilter("out")}
              >
                Out of Stock
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Low Stock Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Loading products...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <p className="text-muted-foreground">No products found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            product.isOutOfStock
                              ? "text-red-600"
                              : product.isLowStock
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{product.lowStockThreshold}</TableCell>
                      <TableCell>{renderStockBadge(product)}</TableCell>
                      <TableCell>Rs.{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStockDialog(product)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct &&
                `Update inventory for ${selectedProduct.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Current Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stockForm.stock}
                onChange={(e) =>
                  setStockForm((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threshold" className="text-right">
                Low Stock Alert
              </Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={stockForm.lowStockThreshold}
                onChange={(e) =>
                  setStockForm((prev) => ({
                    ...prev,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  }))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleStockUpdate}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
