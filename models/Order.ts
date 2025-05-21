import mongoose from "mongoose";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface IPaymentInfo {
  method: "credit_card" | "paypal" | "stripe" | "other";
  transactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
}

export interface IShipment {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippedAt: Date;
  estimatedDelivery?: Date;
}

export interface IOrderNote {
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  isInternal: boolean;
}

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  shipment?: IShipment;
  notes?: IOrderNote[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new mongoose.Schema<IOrderItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
});

const ShippingAddressSchema = new mongoose.Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

const PaymentInfoSchema = new mongoose.Schema<IPaymentInfo>({
  method: {
    type: String,
    enum: ["credit_card", "paypal", "stripe", "other"],
    required: true,
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  paidAt: {
    type: Date,
  },
});

const ShipmentSchema = new mongoose.Schema<IShipment>({
  carrier: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
  },
  trackingUrl: {
    type: String,
  },
  shippedAt: {
    type: Date,
    required: true,
  },
  estimatedDelivery: {
    type: Date,
  },
});

const OrderNoteSchema = new mongoose.Schema<IOrderNote>({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isInternal: {
    type: Boolean,
    default: true,
  },
});

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: ShippingAddressSchema,
    paymentInfo: PaymentInfoSchema,
    shipment: ShipmentSchema,
    notes: [OrderNoteSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Generate a unique order number before saving
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    // Get the count of orders for today to generate a sequential number
    const Order = mongoose.models.Order as mongoose.Model<IOrder>;
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
    
    // Format: ORD-YYMMDD-XXXX (XXXX is a sequential number)
    this.orderNumber = `ORD-${year}${month}${day}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  
  next();
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
