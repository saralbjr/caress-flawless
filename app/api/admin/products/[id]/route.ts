import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logProductAction } from "@/utils/audit-logger";

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

    // Find product by ID
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Log the action
    await logProductAction(
      user,
      "other",
      params.id,
      `Retrieved product details for: ${product.name}`,
      req
    );

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product details",
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

    // Find product by ID
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      name,
      description,
      price,
      image,
      gallery,
      category,
      tags,
      sku,
      stock,
      lowStockThreshold,
      variants,
      attributes,
      isActive,
    } = body;

    // Check if SKU is already in use by another product
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct && existingProduct._id.toString() !== params.id) {
        return NextResponse.json(
          {
            success: false,
            error: "SKU already in use by another product",
          },
          { status: 409 }
        );
      }
    }

    // Update product fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (gallery !== undefined) product.gallery = gallery;
    if (category !== undefined) product.category = category;
    if (tags !== undefined) product.tags = tags;
    if (sku !== undefined) product.sku = sku;
    if (stock !== undefined) product.stock = stock;
    if (lowStockThreshold !== undefined)
      product.lowStockThreshold = lowStockThreshold;
    if (variants !== undefined) product.variants = variants;
    if (attributes !== undefined) product.attributes = attributes;
    if (isActive !== undefined) product.isActive = isActive;

    // Save updated product
    await product.save();

    // Log the action
    await logProductAction(
      user,
      "update",
      params.id,
      `Updated product: ${product.name}`,
      req
    );

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
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

    // Find product by ID
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Store product info for logging
    const productInfo = {
      name: product.name,
      category: product.category,
    };

    // Delete product
    await Product.findByIdAndDelete(params.id);

    // Log the action
    await logProductAction(
      user,
      "delete",
      params.id,
      `Deleted product: ${productInfo.name} (${productInfo.category})`,
      req
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
