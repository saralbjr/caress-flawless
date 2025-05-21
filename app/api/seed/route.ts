import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { sampleProducts } from "@/lib/sample-data";
import { seedAdminUser } from "@/lib/seed-admin";

export async function GET() {
  try {
    await dbConnect();

    // Clear existing products
    await Product.deleteMany({});

    // Insert sample products
    await Product.insertMany(sampleProducts);

    // Seed admin user (this won't overwrite if admin already exists)
    const adminResult = await seedAdminUser();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      products: {
        count: sampleProducts.length,
      },
      admin: {
        success: adminResult.success,
        message: adminResult.message,
      },
    });
  } catch (error) {
    console.error("Seed database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
