import mongoose from "mongoose";

export interface IProductVariant {
  name: string;
  sku: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
  category: string;
  tags?: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  variants?: IProductVariant[];
  attributes?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new mongoose.Schema<IProductVariant>({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: [0, "Price must be a positive number"],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  attributes: {
    type: Map,
    of: String,
    default: {},
  },
});

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price must be a positive number"],
    },
    image: {
      type: String,
      required: [true, "Please provide a product image"],
    },
    gallery: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Please provide a product category"],
      enum: {
        values: ["electronics", "clothing", "books", "home", "beauty", "other"],
        message: "{VALUE} is not a valid category",
      },
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if product is low on stock
ProductSchema.virtual("isLowStock").get(function (this: IProduct) {
  return this.stock <= this.lowStockThreshold;
});

// Virtual for checking if product is out of stock
ProductSchema.virtual("isOutOfStock").get(function (this: IProduct) {
  return this.stock === 0;
});

// Create text index for search
ProductSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
