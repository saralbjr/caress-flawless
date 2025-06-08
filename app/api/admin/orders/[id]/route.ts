import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order, { OrderStatus } from "@/models/Order";
import { authenticateUser, isAdmin } from "@/utils/auth";
import { logOrderAction } from "@/utils/audit-logger";

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

    // Find order by ID
    const order = await Order.findById(params.id)
      .populate("user", "name email")
      .populate("items.product", "name image sku");

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Log the action
    await logOrderAction(
      user,
      "other",
      params.id,
      `Retrieved order details for: ${order.orderNumber}`,
      req
    );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order details",
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

    // Find order by ID
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { status, shippingAddress, paymentInfo, shipment, notes } = body;

    // Track changes for logging
    const changes: string[] = [];

    // Update order fields
    if (status && status !== order.status) {
      changes.push(`Status: ${order.status} → ${status}`);
      order.status = status as OrderStatus;
    }

    if (shippingAddress) {
      changes.push("Shipping address updated");
      order.shippingAddress = { ...order.shippingAddress, ...shippingAddress };
    }

    if (paymentInfo) {
      changes.push("Payment info updated");
      order.paymentInfo = { ...order.paymentInfo, ...paymentInfo };
    }

    if (shipment) {
      changes.push("Shipment info updated");
      order.shipment = shipment;
    }

    if (notes && Array.isArray(notes)) {
      changes.push("Notes updated");
      order.notes = notes;
    }

    // Save changes
    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(params.id)
      .populate("user", "name email")
      .populate("items.product", "name image sku");

    // Log the action
    await logOrderAction(
      user,
      "update",
      params.id,
      `Updated order: ${order.orderNumber}. Changes: ${changes.join(", ")}`,
      req
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
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

    // Find order by ID
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Store order info for logging
    const orderInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
    };

    // Delete order
    await Order.findByIdAndDelete(params.id);

    // Log the action
    await logOrderAction(
      user,
      "delete",
      params.id,
      `Deleted order: ${orderInfo.orderNumber} (Status: ${orderInfo.status}, Amount: $${orderInfo.totalAmount})`,
      req
    );

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete order",
      },
      { status: 500 }
    );
  }
}
