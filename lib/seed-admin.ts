import dbConnect from "./db";
import User from "@/models/User";

/**
 * Seeds the database with an admin user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function seedAdminUser(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await dbConnect();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

    if (existingAdmin) {
      return {
        success: true,
        message: "Admin user already exists",
      };
    }

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: "admin123", // This will be hashed by the pre-save hook in the User model
      role: "admin",
      isActive: true,
      lastLogin: new Date(),
    });

    return {
      success: true,
      message: `Admin user created successfully with ID: ${adminUser._id}`,
    };
  } catch (error) {
    console.error("Error seeding admin user:", error);
    return {
      success: false,
      message: `Failed to seed admin user: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
