import mongoose, {Schema} from "mongoose";

import {PET_SPECIES} from "@/lib/petTypes";

const PetSchema = new Schema(
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

    species: {
      type: String,
      enum: [...PET_SPECIES],
      default: "dog",
      index: true,
    },

    breed: {
      type: String,
      default: "",
      trim: true,
    },

    birthDate: {
      type: Date,
      default: null,
    },

    microchipId: {
      type: String,
      default: "",
      trim: true,
    },

    vetName: {
      type: String,
      default: "",
      trim: true,
    },

    vetId: {
      type: Schema.Types.ObjectId,
      ref: "Vet",
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

if (mongoose.models.Pet) {
  delete mongoose.models.Pet;
}

const Pet = mongoose.model("Pet", PetSchema);

export default Pet;
