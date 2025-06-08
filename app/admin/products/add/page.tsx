"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
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
        <ProductForm />
      </div>
    </div>
  );
}
