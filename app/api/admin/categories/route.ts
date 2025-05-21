import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logCategoryAction } from "@/utils/audit-logger";

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
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const parentId = searchParams.get("parent");

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    if (parentId) {
      if (parentId === "root") {
        filter.parent = { $exists: false };
      } else {
        filter.parent = parentId;
      }
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("parent", "name");

    // Get total count for pagination
    const total = await Category.countDocuments(filter);

    // Log the action
    await logCategoryAction(
      user,
      "other",
      "all",
      `Retrieved categories list with filters: ${JSON.stringify({
        search,
        isActive,
        parentId,
      })}`,
      req
    );

    return NextResponse.json({
      success: true,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
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
    const { name, description, image, parent, isActive } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug is already in use
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
        },
        { status: 409 }
      );
    }

    // Create new category
    const newCategory = await Category.create({
      name,
      slug,
      description: description || "",
      image: image || "",
      parent: parent || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Log the action
    await logCategoryAction(
      user,
      "create",
      newCategory._id.toString(),
      `Created new category: ${name}`,
      req
    );

    return NextResponse.json(
      {
        success: true,
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 }
    );
  }
}
