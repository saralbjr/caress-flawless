"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch product");
        }

        setProduct(data.product);
      } catch (error: any) {
        console.error("Error fetching product:", error);
        setError(error.message || "Failed to load product");
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-destructive text-center mb-4">
          <p className="text-lg font-semibold">Error</p>
          <p>{error || "Product not found"}</p>
        </div>
        <Button onClick={() => router.push("/admin/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="border rounded-lg p-6">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ProductForm initialData={product} isEditing />
        )}
      </div>
    </div>
  );
}
