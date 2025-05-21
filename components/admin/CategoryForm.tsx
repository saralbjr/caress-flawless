"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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

// Define the form schema
const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  image: z
    .string()
    .url("Please enter a valid URL for the image")
    .optional()
    .or(z.literal("")),
  parent: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  _id: string;
  name: string;
}

interface CategoryFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function CategoryForm({
  initialData,
  isEditing = false,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const router = useRouter();

  // Initialize form with default values or existing category data
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          ...initialData,
          parent: initialData.parent?._id || initialData.parent || "",
          image: initialData.image || "",
          description: initialData.description || "",
        }
      : {
          name: "",
          description: "",
          image: "",
          parent: "",
          isActive: true,
        },
  });

  // Fetch parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      setIsLoadingParents(true);
      try {
        const response = await fetch("/api/admin/categories?limit=100");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch categories");
        }

        // Filter out the current category if editing (to prevent circular reference)
        const filteredCategories = isEditing
          ? data.categories.filter(
              (category: Category) => category._id !== initialData._id
            )
          : data.categories;

        setParentCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
        toast.error("Failed to load parent categories");
      } finally {
        setIsLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, [isEditing, initialData?._id]);

  // Handle form submission
  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/admin/categories/${initialData._id}`
        : "/api/admin/categories";
      const method = isEditing ? "PUT" : "POST";

      // Clean up empty strings
      const payload = {
        ...data,
        parent: data.parent || undefined,
        image: data.image || undefined,
        description: data.description || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully"
      );
      router.push("/admin/products/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter the basic details of your category
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used to generate the category slug
                  </FormDescription>
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
                      placeholder="Enter category description (optional)"
                      className="min-h-20"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None (Root Category)</SelectItem>
                      {isLoadingParents ? (
                        <SelectItem value="" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        parentCategories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally nest this category under a parent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Additional Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure additional category settings
              </p>
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the URL of an image for this category
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
                      Make this category visible to customers
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products/categories")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
