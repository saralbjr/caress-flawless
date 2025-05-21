import mongoose from "mongoose";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "role_change"
  | "status_change"
  | "other";

export type AuditEntityType =
  | "user"
  | "product"
  | "order"
  | "category"
  | "system"
  | "other";

export interface IAuditLog extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "role_change",
        "status_change",
        "other",
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["user", "product", "order", "category", "system", "other"],
      required: true,
    },
    entityId: {
      type: String,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
