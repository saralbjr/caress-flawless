import { NextRequest } from "next/server";
import AuditLog, { AuditAction, AuditEntityType } from "@/models/AuditLog";
import dbConnect from "@/lib/db";
import { JwtPayload } from "./auth";

interface AuditLogParams {
  user: JwtPayload;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details: string;
  request?: NextRequest;
}

/**
 * Log an audit event
 */
export async function logAuditEvent({
  user,
  action,
  entityType,
  entityId,
  details,
  request,
}: AuditLogParams): Promise<void> {
  try {
    await dbConnect();

    // Extract IP address and user agent from request if available
    const ipAddress = request?.ip || request?.headers.get("x-forwarded-for") || undefined;
    const userAgent = request?.headers.get("user-agent") || undefined;

    // Create audit log entry
    await AuditLog.create({
      user: user.userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to prevent disrupting the main flow
  }
}

/**
 * Log user actions
 */
export async function logUserAction(
  user: JwtPayload,
  action: AuditAction,
  targetUserId: string,
  details: string,
  request?: NextRequest
): Promise<void> {
  return logAuditEvent({
    user,
    action,
    entityType: "user",
    entityId: targetUserId,
    details,
    request,
  });
}

/**
 * Log product actions
 */
export async function logProductAction(
  user: JwtPayload,
  action: AuditAction,
  productId: string,
  details: string,
  request?: NextRequest
): Promise<void> {
  return logAuditEvent({
    user,
    action,
    entityType: "product",
    entityId: productId,
    details,
    request,
  });
}

/**
 * Log order actions
 */
export async function logOrderAction(
  user: JwtPayload,
  action: AuditAction,
  orderId: string,
  details: string,
  request?: NextRequest
): Promise<void> {
  return logAuditEvent({
    user,
    action,
    entityType: "order",
    entityId: orderId,
    details,
    request,
  });
}

/**
 * Log category actions
 */
export async function logCategoryAction(
  user: JwtPayload,
  action: AuditAction,
  categoryId: string,
  details: string,
  request?: NextRequest
): Promise<void> {
  return logAuditEvent({
    user,
    action,
    entityType: "category",
    entityId: categoryId,
    details,
    request,
  });
}

/**
 * Log system actions
 */
export async function logSystemAction(
  user: JwtPayload,
  action: AuditAction,
  details: string,
  request?: NextRequest
): Promise<void> {
  return logAuditEvent({
    user,
    action,
    entityType: "system",
    details,
    request,
  });
}
