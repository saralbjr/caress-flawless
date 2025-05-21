"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Define the form schema
const productSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  price: z
    .number()
    .min(0.01, "Price must be greater than 0")
    .or(z.string().regex(/^\d*\.?\d+$/).transform(Number)),
  image: z.string().url("Please enter a valid URL for the image"),
  gallery: z.array(z.string().url("Please enter a valid URL")).optional(),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).optional(),
  sku: z.string().optional(),
  stock: z
    .number()
    .min(0, "Stock cannot be negative")
    .or(z.string().regex(/^\d+$/).transform(Number)),
  lowStockThreshold: z
    .number()
    .min(1, "Threshold must be at least 1")
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const router = useRouter();

  // Initialize form with default values or existing product data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          // Ensure gallery and tags are arrays
          gallery: initialData.gallery || [],
          tags: initialData.tags || [],
        }
      : {
          name: "",
          description: "",
          price: 0,
          image: "",
          gallery: [],
          category: "",
          tags: [],
          sku: "",
          stock: 0,
          lowStockThreshold: 5,
          isActive: true,
        },
  });

  // Categories list
  const categories = [
    { id: "electronics", name: "Electronics" },
    { id: "clothing", name: "Clothing" },
    { id: "books", name: "Books" },
    { id: "home", name: "Home & Kitchen" },
    { id: "beauty", name: "Beauty" },
    { id: "other", name: "Other" },
  ];

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/products/${initialData._id}`
        : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(
        isEditing
          ? "Product updated successfully"
          : "Product created successfully"
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle adding a gallery image
  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return;
    
    try {
      // Validate URL
      new URL(galleryInput);
      
      const currentGallery = form.getValues("gallery") || [];
      if (!currentGallery.includes(galleryInput.trim())) {
        form.setValue("gallery", [...currentGallery, galleryInput.trim()]);
      }
      setGalleryInput("");
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  };

  // Handle removing a gallery image
  const handleRemoveGalleryImage = (imageToRemove: string) => {
    const currentGallery = form.getValues("gallery") || [];
    form.setValue(
      "gallery",
      currentGallery.filter((image) => image !== imageToRemove)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter the basic details of your product
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Press Enter or click the plus button to add a tag
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Pricing & Inventory</h3>
              <p className="text-sm text-muted-foreground">
                Set the pricing and inventory details
              </p>
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === "" ? "" : parseFloat(e.target.value)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === "" ? "" : parseInt(e.target.value)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="5"
                      {...field}
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === "" ? "" : parseInt(e.target.value)
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Alert when stock falls below this number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Make this product visible to customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Product Images</h3>
            <p className="text-sm text-muted-foreground">
              Add images for your product
            </p>
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the URL of the main product image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gallery"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallery Images</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value?.map((image) => (
                    <div
                      key={image}
                      className="relative group border rounded-md overflow-hidden w-24 h-24"
                    >
                      <img
                        src={image}
                        alt="Gallery"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(image)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add image URL"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGalleryImage();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddGalleryImage}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Add additional images for your product gallery
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
