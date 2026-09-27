import mongoose, {Schema, models} from "mongoose";

const VetSchema = new Schema(
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

VetSchema.index({userId: 1, name: 1});

const Vet = models.Vet || mongoose.model("Vet", VetSchema);

export default Vet;
