import mongoose, {Schema, models} from "mongoose";

const VehicleSchema = new Schema(
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

    brand: {
      type: String,
      default: "",
    },

    model: {
      type: String,
      default: "",
    },

    mileage: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["car", "motorcycle", "other"],
      default: "car",
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = models.Vehicle || mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
