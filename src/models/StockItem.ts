import mongoose, {Schema, models} from "mongoose";

import {
  STOCK_CATEGORIES,
  STOCK_UNITS,
  USAGE_MODES,
} from "@/lib/stockTypes";

const StockItemSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: STOCK_CATEGORIES,
      default: "medicine",
    },

    usageMode: {
      type: String,
      enum: USAGE_MODES,
      default: "static",
    },

    // Lek codzienny
    stock: {
      type: Number,
      default: null,
    },

    stockDate: {
      type: Date,
      default: null,
    },

    dailyUsage: {
      type: Number,
      default: null,
    },

    reminderThreshold: {
      type: Number,
      default: null,
    },

    // Zapas statyczny
    quantity: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      enum: STOCK_UNITS,
      default: "szt.",
    },

    minQuantity: {
      type: Number,
      default: 1,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const StockItem =
  models.StockItem || mongoose.model("StockItem", StockItemSchema);

export default StockItem;
