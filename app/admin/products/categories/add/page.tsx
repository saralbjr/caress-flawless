"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/admin/CategoryForm";

export default function AddCategoryPage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
          <p className="text-muted-foreground">
            Create a new category for your products
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
