import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRole } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const getTokenFromAuthHeader = (request: NextRequest): string | null => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

export const getTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
};

export async function authenticateUser(
  request: NextRequest
): Promise<JwtPayload | null> {
  // Try to get token from Authorization header first
  const token = getTokenFromAuthHeader(request);

  if (token) {
    return verifyToken(token);
  }

  // If no token in header, try to get from cookies
  const cookieToken = await getTokenFromCookies();

  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export const setAuthCookie = (response: NextResponse, token: string): void => {
  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
};

export const removeAuthCookie = (response: NextResponse): void => {
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
};

// Check if a user has a specific role or any of the roles in an array
export const checkUserRole = (
  user: JwtPayload | null,
  requiredRole: UserRole | UserRole[]
): boolean => {
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
};

// Middleware to check if a user has admin access
export const isAdmin = (user: JwtPayload | null): boolean => {
  return checkUserRole(user, ["admin", "superadmin"]);
};

// Middleware to check if a user has superadmin access
export const isSuperAdmin = (user: JwtPayload | null): boolean => {
  return checkUserRole(user, "superadmin");
};
