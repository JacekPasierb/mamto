import mongoose, {Schema} from "mongoose";

import {PET_CARE_TYPES} from "@/lib/petTypes";

const PetCareSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [...PET_CARE_TYPES],
      default: "rabies",
      index: true,
    },

    providerName: {
      type: String,
      default: "",
      trim: true,
    },

    lastDoneAt: {
      type: Date,
      default: null,
    },

    nextDueAt: {
      type: Date,
      required: true,
      index: true,
    },

    intervalMonths: {
      type: Number,
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

if (mongoose.models.PetCare) {
  delete mongoose.models.PetCare;
}

const PetCare = mongoose.model("PetCare", PetCareSchema);

export default PetCare;
