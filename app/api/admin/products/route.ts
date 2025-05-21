import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logProductAction } from "@/utils/audit-logger";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isActive = searchParams.get("isActive");

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Log the action
    await logProductAction(
      user,
      "other",
      "all",
      `Retrieved products list with filters: ${JSON.stringify({
        search,
        category,
        minPrice,
        maxPrice,
        isActive,
      })}`,
      req
    );

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Validate input
    if (!name || !description || !price || !image || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, description, price, image, and category are required",
        },
        { status: 400 }
      );
    }

    // Check if SKU is already in use
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return NextResponse.json(
          {
            success: false,
            error: "SKU already in use",
          },
          { status: 409 }
        );
      }
    }

    // Create new product
    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      gallery: gallery || [],
      category,
      tags: tags || [],
      sku: sku || undefined,
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 5,
      variants: variants || [],
      attributes: attributes || {},
      isActive: isActive !== undefined ? isActive : true,
    });

    // Log the action
    await logProductAction(
      user,
      "create",
      newProduct._id.toString(),
      `Created new product: ${name} (${category})`,
      req
    );

    return NextResponse.json(
      {
        success: true,
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
