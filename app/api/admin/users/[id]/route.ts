import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User, { UserRole } from "@/models/User";
import { authenticateUser, isAdmin, isSuperAdmin } from "@/utils/auth";
import { logUserAction } from "@/utils/audit-logger";

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

    // Find user by ID
    const targetUser = await User.findById(params.id).select("-password");

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Log the action
    await logUserAction(
      user,
      "other",
      params.id,
      `Retrieved user details for: ${targetUser.name} (${targetUser.email})`,
      req
    );

    return NextResponse.json({
      success: true,
      user: targetUser,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user details",
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

    // Find user by ID
    const targetUser = await User.findById(params.id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, email, role, isActive } = body;

    // Check if trying to modify a superadmin
    if (
      targetUser.role === "superadmin" &&
      !isSuperAdmin(user) &&
      (role || isActive === false)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only superadmins can modify other superadmins",
        },
        { status: 403 }
      );
    }

    // Check if trying to assign superadmin role
    if (role === "superadmin" && !isSuperAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only superadmins can assign superadmin role",
        },
        { status: 403 }
      );
    }

    // Update user fields
    if (name) targetUser.name = name;
    if (email) targetUser.email = email;

    // Track if role was changed
    const roleChanged = role && targetUser.role !== role;
    if (role) targetUser.role = role as UserRole;

    // Track if status was changed
    const statusChanged =
      isActive !== undefined && targetUser.isActive !== isActive;
    if (isActive !== undefined) targetUser.isActive = isActive;

    // Save changes
    await targetUser.save();

    // Log the action
    let actionType: "update" | "role_change" | "status_change" = "update";
    if (roleChanged) actionType = "role_change";
    if (statusChanged) actionType = "status_change";

    await logUserAction(
      user,
      actionType,
      params.id,
      `Updated user: ${targetUser.name} (${
        targetUser.email
      }). Changes: ${JSON.stringify({
        name: name ? "Updated" : "Unchanged",
        email: email ? "Updated" : "Unchanged",
        role: roleChanged ? `${targetUser.role}` : "Unchanged",
        isActive: statusChanged ? `${targetUser.isActive}` : "Unchanged",
      })}`,
      req
    );

    return NextResponse.json({
      success: true,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
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

    // Find user by ID
    const targetUser = await User.findById(params.id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Prevent deletion of superadmin by non-superadmin
    if (targetUser.role === "superadmin" && !isSuperAdmin(user)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only superadmins can delete superadmins",
        },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (targetUser._id.toString() === user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot delete your own account",
        },
        { status: 400 }
      );
    }

    // Store user info for logging
    const userInfo = {
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
    };

    // Delete user
    await User.findByIdAndDelete(params.id);

    // Log the action
    await logUserAction(
      user,
      "delete",
      params.id,
      `Deleted user: ${userInfo.name} (${userInfo.email}) with role: ${userInfo.role}`,
      req
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
