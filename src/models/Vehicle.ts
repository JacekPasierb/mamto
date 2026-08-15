import mongoose, {Schema} from "mongoose";

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

    year: {
      type: Number,
      default: null,
    },

    vin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    plateNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
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

if (mongoose.models.Vehicle) {
  delete mongoose.models.Vehicle;
}

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
