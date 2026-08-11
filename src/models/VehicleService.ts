import mongoose, {Schema, models} from "mongoose";

import {SERVICE_TYPES} from "@/lib/serviceTypes";

const VehicleServiceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: SERVICE_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    performedAt: {
      type: Date,
      required: true,
    },

    mileage: {
      type: Number,
      default: 0,
    },

    nextDueAt: {
      type: Date,
      default: null,
    },

    nextDueMileage: {
      type: Number,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    cost: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const VehicleService =
  models.VehicleService ||
  mongoose.model("VehicleService", VehicleServiceSchema);

export default VehicleService;
