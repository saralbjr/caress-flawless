import mongoose from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "user" | "admin" | "superadmin";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasRole(role: UserRole | UserRole[]): boolean;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: [true, "Please provide a name"],
      minlength: 2,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has a specific role or any of the roles in an array
UserSchema.methods.hasRole = function (role: UserRole | UserRole[]): boolean {
  if (Array.isArray(role)) {
    return role.includes(this.role);
  }
  return this.role === role;
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
