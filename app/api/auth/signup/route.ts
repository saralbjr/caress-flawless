import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateToken, setAuthCookie } from "@/utils/auth";
import { z } from "zod";

// Define validation schema
const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await req.json();

    // Validate input
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already in use",
        },
        { status: 409 }
      );
    }

    // Check if this is the first user in the system
    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? "superadmin" : "user";

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role,
      lastLogin: new Date(),
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      },
      { status: 201 }
    );

    // Set auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
