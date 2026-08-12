import mongoose, {Schema, models} from "mongoose";

const WorkshopSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

WorkshopSchema.index({userId: 1, name: 1});

const Workshop =
  models.Workshop || mongoose.model("Workshop", WorkshopSchema);

export default Workshop;
