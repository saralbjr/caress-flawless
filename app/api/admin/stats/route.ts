import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authenticateUser, isAdmin } from "@/utils/auth";

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

    // Get date ranges for analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ]);

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ["delivered", "shipped"] },
          "paymentInfo.status": "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Monthly sales data for the last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ["delivered", "shipped"] },
          "paymentInfo.status": "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format monthly sales data
    const salesMonths: string[] = [];
    const salesData: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      salesMonths.push(monthName);
      
      const monthData = monthlySales.find(
        (item) =>
          item._id.year === date.getFullYear() &&
          item._id.month === date.getMonth() + 1
      );
      
      salesData.push(monthData?.revenue || 0);
    }

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const orderStatusLabels = orderStatusData.map((item) => item._id);
    const orderStatusCounts = orderStatusData.map((item) => item.count);

    // Product category distribution
    const categoryData = await Product.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryLabels = categoryData.map((item) => item._id);
    const categoryCounts = categoryData.map((item) => item.count);

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber user totalAmount status createdAt");

    // Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .sort({ stock: 1 })
      .limit(5)
      .select("name sku stock lowStockThreshold");

    // Growth metrics (compared to previous month)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [currentMonthOrders, previousMonthOrders] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: currentMonthStart },
      }),
      Order.countDocuments({
        createdAt: { $gte: previousMonth, $lt: currentMonthStart },
      }),
    ]);

    const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentMonthStart },
            status: { $in: ["delivered", "shipped"] },
            "paymentInfo.status": "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: previousMonth, $lt: currentMonthStart },
            status: { $in: ["delivered", "shipped"] },
            "paymentInfo.status": "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const prevRevenue = previousMonthRevenue[0]?.total || 0;

    const orderGrowth = previousMonthOrders > 0 
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 
      : 0;

    const revenueGrowth = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        // Basic metrics
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        
        // Growth metrics
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        
        // Chart data
        salesMonths,
        salesData,
        categoryLabels,
        categoryData: categoryCounts,
        orderStatusLabels,
        orderStatusData: orderStatusCounts,
        
        // Recent data
        recentOrders: recentOrders.map((order) => ({
          id: order.orderNumber,
          customer: order.user?.name || "Unknown",
          date: order.createdAt.toISOString().split("T")[0],
          status: order.status,
          total: order.totalAmount,
        })),
        
        lowStockProducts: lowStockProducts.map((product) => ({
          id: product._id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          threshold: product.lowStockThreshold,
        })),
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin statistics",
      },
      { status: 500 }
    );
  }
}
