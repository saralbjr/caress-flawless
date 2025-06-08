"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryForm from "@/components/admin/CategoryForm";

export default function AddCategoryPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
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
      <div className="border rounded-lg p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
