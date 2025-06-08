import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order, { OrderStatus } from "@/models/Order";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logOrderAction } from "@/utils/audit-logger";

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
    const status = searchParams.get("status") as OrderStatus | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name image")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    // Log the action
    await logOrderAction(
      user,
      "other",
      "all",
      `Retrieved orders list with filters: ${JSON.stringify({
        search,
        status,
        startDate,
        endDate,
      })}`,
      req
    );

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
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
      userId,
      items,
      shippingAddress,
      paymentInfo,
      status = "pending",
    } = body;

    // Validate input
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and items are required",
        },
        { status: 400 }
      );
    }

    if (!shippingAddress || !paymentInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipping address and payment info are required",
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create new order
    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount,
      status,
      shippingAddress,
      paymentInfo,
    });

    // Populate the created order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("user", "name email")
      .populate("items.product", "name image");

    // Log the action
    await logOrderAction(
      user,
      "create",
      newOrder._id.toString(),
      `Created new order: ${newOrder.orderNumber} for user: ${userId}`,
      req
    );

    return NextResponse.json(
      {
        success: true,
        order: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
