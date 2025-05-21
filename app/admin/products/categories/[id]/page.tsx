"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/admin/CategoryForm";

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/admin/categories/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch category");
        }

        setCategory(data.category);
      } catch (error: any) {
        console.error("Error fetching category:", error);
        setError(error.message || "Failed to load category");
        toast.error("Failed to load category");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading category...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-destructive text-center mb-4">
          <p className="text-lg font-semibold">Error</p>
          <p>{error || "Category not found"}</p>
        </div>
        <Button onClick={() => router.push("/admin/products/categories")}>
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/products/categories")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update details for {category.name}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <CategoryForm initialData={category} isEditing={true} />
      </div>
    </div>
  );
}
