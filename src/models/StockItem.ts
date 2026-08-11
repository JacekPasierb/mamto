import mongoose, {Schema, models} from "mongoose";

import {STOCK_CATEGORIES, STOCK_UNITS} from "@/lib/stockTypes";

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

    quantity: {
      type: Number,
      required: true,
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
