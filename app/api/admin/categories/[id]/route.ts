import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logCategoryAction } from "@/utils/audit-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check if user has admin access
    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Find category by ID
    const category = await Category.findById(params.id).populate(
      "parent",
      "name"
    );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    // Log the action
    await logCategoryAction(
      user,
      "other",
      params.id,
      `Retrieved category details for: ${category.name}`,
      req
    );

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category details",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check if user has admin access
    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Find category by ID
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, description, image, parent, isActive } = body;

    // Check for circular reference in parent
    if (parent && parent === params.id) {
      return NextResponse.json(
        {
          success: false,
          error: "A category cannot be its own parent",
        },
        { status: 400 }
      );
    }

    // Update category fields
    if (name !== undefined && name !== category.name) {
      category.name = name;
      // Generate new slug from name
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug is already in use by another category
      const existingCategory = await Category.findOne({
        slug: category.slug,
        _id: { $ne: params.id },
      });
      
      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "A category with this name already exists",
          },
          { status: 409 }
        );
      }
    }
    
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent || undefined;
    if (isActive !== undefined) category.isActive = isActive;

    // Save updated category
    await category.save();

    // Log the action
    await logCategoryAction(
      user,
      "update",
      params.id,
      `Updated category: ${category.name}`,
      req
    );

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check if user has admin access
    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Find category by ID
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    // Check if category has child categories
    const childCategories = await Category.countDocuments({ parent: params.id });
    if (childCategories > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with child categories. Please move or delete child categories first.",
        },
        { status: 400 }
      );
    }

    // Check if category is used by products
    const productsUsingCategory = await Product.countDocuments({ category: category.slug });
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category that is used by ${productsUsingCategory} products. Please reassign products first.`,
        },
        { status: 400 }
      );
    }

    // Store category info for logging
    const categoryInfo = {
      name: category.name,
    };

    // Delete category
    await Category.findByIdAndDelete(params.id);

    // Log the action
    await logCategoryAction(
      user,
      "delete",
      params.id,
      `Deleted category: ${categoryInfo.name}`,
      req
    );

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}
